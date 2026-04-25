import * as bcrypt from 'bcrypt';

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

import { JwtService } from '@nestjs/jwt';
import { SuperAdminPrismaService } from 'src/prisma/superAdminprisma.service';
import { status } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { InviteUserDto } from 'src/users/dto/invite-user.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AdminService {
  private readonly s3Client: S3Client;
  constructor(
    private prisma: SuperAdminPrismaService,
    private readonly jwtService: JwtService,
    private userService: UsersService,
  ) {
    this.s3Client = new S3Client({
      endpoint: process.env.S3_ENDPOINT || '',
      region: process.env.S3_REGION || '',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || '',
        secretAccessKey: process.env.S3_SECRET_KEY || '',
      },
      forcePathStyle: true,
    });
  }

  async uploadFileToS3(file: Express.Multer.File): Promise<string> {
    try {
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const bucketName = process.env.S3_BUCKET_NAME || 'peakstorage';

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: `project-docs/${fileName}`,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      });

      await this.s3Client.send(command);
      return `https://${bucketName}.blr1.digitaloceanspaces.com/project-docs/${fileName}`;
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new Error('Failed to upload file to storage');
    }
  }

  async getAllCompanys(req: any) {
    const hasPage = req.query.page !== undefined;
    const hasLimit = req.query.limit !== undefined;
    console.log(req.user);
    const page = hasPage ? parseInt(req.query.page, 10) : null;
    const limit = hasLimit ? parseInt(req.query.limit, 10) : null;
    const search = req.query.search || '';
    const skip = page && limit ? (page - 1) * limit : undefined;

    try {
      const [companies, total] = await this.prisma.$transaction([
        this.prisma.company.findMany({
          where: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
          ...(skip !== undefined && limit !== null
            ? { skip, take: limit }
            : {}),
          orderBy: { createdAt: 'desc' },
          select: {
            logo: true,
            id: true,
            name: true,
            createdAt: true,
            website: true,
            _count: {
              select: {
                users: true,
              },
            },
          },
        }),
        this.prisma.company.count({
          where: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        }),
      ]);

      return { data: companies, total };
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw new HttpException('Error fetching companies', 500);
    }
  }

  // In your AdminService class

  async getCompanyById(id: string) {
    try {
      const company = await this.prisma.company.findUnique({
        where: { id },
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              createdAt: true,
            },
            take: 5, // Limit number of users shown
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: {
              users: true,
              teams: true,
              
            },
          },
        },
      });

      if (!company) {
        throw new HttpException('Company not found', 404);
      }

      return company;
    } catch (error) {
      console.error('Error fetching company:', error);
      throw new HttpException('Error fetching company', 500);
    }
  }

  async getUserDetails(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          avatar: true,
          email: true,
          role: true,
          createdAt: true,
          dob: true,
          nationality: true,
          updatedAt: true,
          status: true,
          gender: true,
          department: {
            select: {
              id: true,
              name: true,
            },
          },
          manager: {
            select: {
              id: true,
              name: true,
            },
          },
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          team: {
            select: {
              id: true,
              name: true,
            },
          },
          joiningDate: true,
          mobile: true,
        },
      });

      if (!user) {
        throw new HttpException('User not found', 404);
      }

      return user;
    } catch (error) {
      console.error('Error fetching user details:', error);
      throw new HttpException('Error fetching user details', 500);
    }
  }

  async login(email: string, password: string) {
    try {
      return await this.prisma.$transaction(async (prisma) => {
        await prisma.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`;
        await prisma.$executeRaw`SELECT set_config('app.tenant_id', '0', TRUE)`;
        await prisma.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`;

        // Step 2: Fetch user from the database
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          throw new HttpException('User not found', 404);
        }

        // âœ… Step 2.5: Only allow superadmin role
        if (user.role !== 'superadmin') {
          throw new HttpException('Unauthorized access', 403);
        }

        // Step 3: Validate password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          throw new HttpException('Invalid credentials', 401);
        }

        // Step 4: Generate JWT token
        const payload = {
          userId: user.id,
          tenantId: user.tenantId,
          role: user.role,
        };

        const token = this.jwtService.sign(payload, {
          secret: process.env.JWT_SECRET,
        });

        return {
          statusCode: HttpStatus.OK,
          message: 'Login successful',
          data: { access_token: token },
        };
      });
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || 400,
          message: error.message || 'Error logging in',
          data: null,
        },
        error.status || 400,
      );
    }
  }
 async getAllUsers(req: any) {
  const hasPage = req.query.page !== undefined;
  const hasLimit = req.query.limit !== undefined;

  const page = hasPage ? parseInt(req.query.page, 10) : null;
  const limit = hasLimit ? parseInt(req.query.limit, 10) : null;
  const skip = page && limit ? (page - 1) * limit : undefined;
  const companyId = req.query.companyId;
  const search = req.query.search || '';

  const whereClause: any = {
    AND: [],
  };

  if (companyId) {
    whereClause.AND.push({
      company: {
        id: companyId,
      },
    });
  }

  if (search) {
    whereClause.AND.push({
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    });
  }

  // Simplify the where clause if AND is empty
  const where = whereClause.AND.length > 0 ? whereClause : {};

  try {
    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        ...(skip !== undefined && limit !== undefined && {
          skip,
          take: limit,
        }),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          status: true,
          avatar: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data: users, total };
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new HttpException('Error fetching users', 500);
  }
}


  async banUser(req: any) {
    const { id } = req.params;

    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new HttpException('User not found', 404);
      }

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          status: user.status === 'active' ? 'banned' : 'active',
          updatedAt: new Date(),
        },
      });

      return {
        message: `User ${updatedUser.status === 'active' ? 'unbanned' : 'banned'} successfully`,
        user: updatedUser,
      };
    } catch (error) {
      console.error('Error banning user:', error);
      throw new HttpException('Error banning user', 500);
    }
  }

  async deleteUser(req: any) {
    const { id } = req.params;

    try {
      // First check if user exists
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new HttpException('User not found', 404);
      }

      // Soft delete (recommended approach)
      const deletedUser = await this.prisma.user.update({
        where: { id },
        data: {
          status: 'deleted' as status,
          updatedAt: new Date(),
        },
      });

      // Alternatively for hard delete:
      // await this.prisma.user.delete({ where: { id } });

      return {
        message: 'User deleted successfully',
        user: deletedUser,
      };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new HttpException('Error deleting user', 500);
    }
  }
  async getAllTeams(req: any) {
    // const page = parseInt(req.query.page || '1', 10);
    // const limit = parseInt(req.query.limit || '10', 10);
    // const skip = (page - 1) * limit;
    const companyId = req.query.companyId;

    const whereClause: any = {};
    if (companyId) {
      whereClause.company = {
        id: companyId,
      };
    }

    try {
      const [teams, total] = await this.prisma.$transaction([
        this.prisma.team.findMany({
          where: whereClause,
          // skip,
          // take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            createdAt: true,
            type: true,
            departmentId: true,

            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
        this.prisma.team.count({ where: whereClause }),
      ]);

      return { data: teams, total };
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw new HttpException('Error fetching teams', 500);
    }
  }
  private formatResponse(
    statusCode: number,
    message: string,
    data: any = null,
  ) {
    return {
      statusCode,
      message,
      data,
    };
  }
  async InviteUser(req: any, inviteUserDto: InviteUserDto) {
    console.log('invite user function');
    const tenantId = inviteUserDto.companyId;
    const userId = req.user.userId;

    try {
      // Begin a transaction
      const result = await this.prisma.$transaction(
        async (prisma) => {
          const companyLimit = await prisma.company.findFirst({
            where: { id: tenantId },
            select: {
              userLimit: true,
              _count: {
                select: {
                  users: true,
                },
              },
            },
          });
          if (!companyLimit) {
            throw new HttpException('Company not found', 404);
          }
          const effectiveUserLimit = Math.max(companyLimit.userLimit ?? 0, 100);
          if (companyLimit._count.users >= effectiveUserLimit) {
            throw new HttpException('User limit reached for this company', 403);
          }

          let role = 'employee';
          const inviter = await prisma.user.findFirst({
            where: { id: req.user.userId },
          });
          console.log('dept:', inviteUserDto.orgUnit);
          if (inviteUserDto.orgUnit) {
            const dept = await prisma.team.findFirst({
              where: { id: inviteUserDto.orgUnit },
            });
            if (!dept) {
              throw new HttpException('Enter valid department', 404);
            }
            if (inviteUserDto.isDeptHead) {
              role = 'dept_head';
              const dept = await prisma.team.findFirst({
                where: { id: inviteUserDto.orgUnit },
              });
              if (dept.leadId) {
                throw new HttpException(
                  'Head for the department already exists',
                  409,
                );
              }
            }
          }
          if (inviteUserDto.teamId) {
            const team = await prisma.team.findFirst({
              where: { id: inviteUserDto.teamId },
            });
            if (!team) {
              throw new HttpException('Enter valid team', 404);
            }
            if (inviteUserDto.isTeamLead) {
              role = 'team_lead';
              if (team.leadId) {
                throw new HttpException(
                  'Head for the team already exists',
                  409,
                );
              }
            }
          }

          if (inviteUserDto.isAdmin) {
            role = 'admin';
          }

          if (!tenantId) {
            // If tenantId is not found in the request, return an error response with status code 400
            throw new HttpException('TenantId is missing or invalid', 400);
          }
          const tenant = await prisma.company.findFirst({
            where: { id: tenantId },
          });
          if (!tenant) {
            throw new HttpException('Invalid token', 400);
          }
          // Check if user already exists with the given email
          const existingUser = await prisma.user.findUnique({
            where: { email: inviteUserDto.email },
          });

          if (existingUser) {
            throw new HttpException('User with this email already exist', 409); // Conflict response
          }

          // Create a new user with the status set to 'pending' and assigned to the correct tenantId
          const user = await prisma.user.create({
            data: {
              tenantId, // Attach the tenantId to the user
              name: inviteUserDto.name,
              email: inviteUserDto.email,
              phoneCode: inviteUserDto.phoneCode,
              mobile: inviteUserDto.mobile,
              departmentId: inviteUserDto.orgUnit,
              designation: inviteUserDto.designation,
              role: role,
              status: 'pending', // Default status set to 'pending'
              teamId: inviteUserDto.teamId,
              managerId: inviteUserDto.managerId,
            },
          });
          if (role === 'team_lead') {
            const team = await prisma.team.findFirst({
              where: { id: inviteUserDto.teamId },
            });
            team.leadId = user.id;
          }
          if (role === 'dept_head') {
            const dept = await prisma.team.findFirst({
              where: { id: inviteUserDto.orgUnit },
            });
            dept.leadId = user.id;
          }
          // Generate a token with INVITE_SECRET from .env

          const payload = {
            userId: user.id,
            tenantId: user.tenantId,
          };

          // Sign the token with the INVITE_SECRET
          const token = this.jwtService.sign(payload, {
            secret: process.env.INVITE_SECRET,
            expiresIn: 1296000,
          });
          console.log('token   :', token);

          // Return the token
          return { token, user, inviter, tenant };
        },
        { timeout: 20000 },
      );
      const BASEURL = process.env.NEXT_URL;
      const link = `${BASEURL}/auth/invite?token=${result.token}`;
      await this.userService.sendMail(
        result.user,
        result.inviter,
        result.tenant,
        link,
      );
      return this.formatResponse(200, 'User invited successfully', null);
    } catch (error) {
      console.error(error); // Log the error for debugging
      throw new HttpException(
        {
          statusCode: error.status || 400,
          message: error.message || 'error inviting user',
          data: null,
        },
        error.status || 400,
      );
    }
  }
  // async sendMail(user: any, inviter: any, tenant: any, dynamicLink: string) {
  //   const transporter = nodemailer.createTransport({
  //     service: 'Gmail',
  //     auth: {
  //       user: process.env.EMAIL_USERNAME,
  //       pass: process.env.EMAIL_PASSWORD,
  //     },
  //   });
  //   await transporter.sendMail({
  //     from: process.env.EMAIL_USERNAME, // Replace with your email
  //     to: user.email,
  //     subject: "You're Invited to Collaborate!",
  //     html: `
  //         <!DOCTYPE html>
  //         <html>
  //         <head>
  //             <style>
  //                 body {
  //                     font-family: Arial, sans-serif;
  //                     background-color: #f4f4f4;

  //                     padding: 20px;
  //                 }
  //                 .email-container {
  //                     background-color: #ffffff;
  //                     padding: 20px;

  //                     border-radius: 8px;
  //                     max-width: 600px;
  //                     margin: 0 auto;
  //                     box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  //                 }
  //                 .email-header {
  //                     font-size: 24px;
  //                     font-weight: bold;
  //                     margin-bottom: 20px;
  //                     color: #084545;
  //                 }
  //                 .email-body {
  //                     font-size: 16px;
  //                     line-height: 1.6;
  //                     color: #333333;
  //                 }
  //                 .email-button {
  //                     display: inline-block;
  //                     margin: 20px 0;
  //                     padding: 10px 20px;
  //                     font-size: 16px;
  //                     color: #ffffff;
  //                     background-color: #084545;
  //                     text-decoration: none;
  //                     border-radius: 5px;
  //                     text-align: center;
  //                 }
  //                 .email-footer {
  //                     text-align: center;
  //                     font-size: 12px;
  //                     color: #777777;
  //                     margin-top: 20px;
  //                 }
  //                 .logo{
  //                     height: 40px;
  //                     margin-bottom: 20px;
  //                 }
  //             </style>
  //         </head>
  //         <body>
  //             <div class="email-container">
  //                 <div class="email-nav">
  //                 <img class="logo" src="https://imagegenerator123.s3.eu-north-1.amazonaws.com/securexai-high-resolution-logo-transparent+1+(2).png"/>
  //                 </div>
  //                 <div class="email-header">
  //                     You're Invited to Collaborate!
  //                 </div>
  //                 <div class="email-body">
  //                     Hi ${user.name},
  //                     <br><br>
  //                     ${inviter.name} invited you to collaborate on <strong>${tenant.name}</strong>! Click the button below to get started:
  //                     <br><br>
  //                     <a href="${dynamicLink}" class="email-button" style="text-decoration: none; color: #ffffff;">Accept Invitation</a>
  //                     <br><br>
  //                     <strong style="color: #084545;">Note:</strong>The invitation will be valid for 15 days.

  //                 </div>
  //                 <div class="email-footer">
  //                     If you didnâ€™t request this invitation, please disregard this email.
  //                 </div>
  //             </div>
  //         </body>
  //         </html>
  //       `,
  //   });
  // }
}

