import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpException,
  HttpCode,
  Put,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { AuthGuard } from '../auth/guards/auth.guard'; // Assuming guards are already set up
import { AdminGuard } from '../auth/guards/admin.guard';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginWithGoogleDto } from './dto/login-with-google.dto';
import { CompanyDTO } from './dto/update-company.dto';
import { CheckDomainDto } from './dto/check-domain.dto';
import { BulkInviteDto } from './dto/bulkInviteDto.dto';
import { UpdateSelfDto } from './dto/update-self.dto';
import { GetAllUserDto } from './dto/get-all-user.dto';
import { CreateSuperAdminDto } from './dto/superAdminDto';
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Create a new user',
    description: 'This endpoint creates a new user in the system.',
  })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error occurred.',
  })
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.usersService.create(createUserDto);
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || 400,
          message: error.message || 'Error creating user',
          data: null,
        },
        error.status,
      );
    }
  }

  @Post('login')
  async login(@Body() loginUseeDto: LoginUserDto) {
    try {
      return await this.usersService.login(
        loginUseeDto.email,
        loginUseeDto.password,
      );
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
  @Post('adminLogin')
  async adminLogin(@Req() req: any) {
    try {
      const { email, password } = req.body;
      const data = await this.usersService.adminLogin(email, password);
      return data;
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
  @Get()
  async findAll(@Req() req: any, @Query() dto: GetAllUserDto) {
    try {
      const users = await this.usersService.getAllUsersByTenantId(req, dto);

      return {
        statusCode: 200,
        message: 'fetched users successfully',
        data: users,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'error fetchind users',
        error.status || 400,
      );
    }
  }
  @UseGuards(AuthGuard)
  @Get('org-structure')
  async getOrgStructure(@Req() req: any) {
    try {
      const data = await this.usersService.getOrgStructure(req.user.tenantId);
      return {
        statusCode: 200,
        message: 'Fetched org structure successfully',
        data,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || 400,
          message: error.message || 'Error fetching org structure',
          data: null,
        },
        error.status || 400,
      );
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string) {
    return this.usersService.update(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
  @Post('invite')
  @UseGuards(AuthGuard, AdminGuard) // Apply all 3 guards
  async inviteUser(@Body() inviteUserDto: InviteUserDto, @Req() req: any) {
    // Pass tenantId from request to the service method
    try {
      return await this.usersService.inviteUser(inviteUserDto, req);
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || 400,
          message: error.message || 'Error inviting user',
          data: null,
        },
        error.status,
      );
    }
  }

  // @Post('login-with-google')
  // async LoginWithGoogle(@Body() loginWithGoogleDto: LoginWithGoogleDto) {
  //   try {
  //     return await this.usersService.loginWithGoogle(loginWithGoogleDto);
  //   } catch (error) {
  //     throw new HttpException(
  //       {
  //         statusCode: error.status || 400,
  //         message: error.message || 'Error logging with google',
  //         data: null,
  //       },
  //       error.status,
  //     );
  //   }
  // }
  @Put(":id/visibility")
  async updateVisibility(@Req() req,@Body() UpdateUserVisibilityDto) {
    try{
      const data = await this.usersService.updateUserVisibility(req,UpdateUserVisibilityDto);
      return {
        statusCode:200,
        message:"Updated user visibility successfully",
        data:data
      }
    }catch(error){
      throw new HttpException({
        statusCode:error.status || 400,
        message: error.message || 'Error updating user visibility',
        data:null
      },error.status||400)
    }
  }


  @UseGuards(AuthGuard, AdminGuard) 
  @Post('inviteBulk')
  async inviteBulk(@Body() dto: BulkInviteDto[], @Req() req: any) {
    try {
      const data = await this.usersService.inviteUsersBulk(dto, req);
      return data;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || 400,
          message: error.message || 'Error fetching company',
          data: null,
        },
        error.status || 400,
      );
    }
  }
  @Put('update-profile')
  @UseInterceptors(
    FileInterceptor('profilePhoto', {
      storage: diskStorage({
        destination: './public/uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const fileExtension = extname(file.originalname);
          const fileName = `${req.params.id}-${uniqueSuffix}${fileExtension}`;
          callback(null, fileName);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(
            new HttpException(
              'Only image files are allowed (JPG, JPEG, PNG, GIF)',
              HttpStatus.BAD_REQUEST,
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async updateProfile(
    @Req() req: any,
    @Body() updateUserDto: UpdateSelfDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      return await this.usersService.updateProfile(req, updateUserDto, file);
    } catch (error) {
      console.error('Error in updateProfile controller:', error.message);
      throw new HttpException(
        {
          statusCode: error.status || HttpStatus.BAD_REQUEST,
          message: error.message || 'Error updating profile',
          data: null,
        },
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
  @Post('update-logo')
  @UseInterceptors(FileInterceptor('logo'))
  async updateLogo(@UploadedFile() logo: Express.Multer.File, @Req() req: any) {
    try {
      if (!logo) {
        throw new HttpException(
          'Logo file is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validMimeTypes.includes(logo.mimetype)) {
        throw new HttpException(
          'Invalid file type. Only JPEG, PNG, and GIF are allowed',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Validate file size (max 5MB)
      if (logo.size > 5 * 1024 * 1024) {
        throw new HttpException(
          'File size exceeds 5MB limit',
          HttpStatus.BAD_REQUEST,
        );
      }

      const data = await this.usersService.updateUserLogo(req, logo);
      return {
        statusCode: 200,
        message: 'Logo updated successfully',
        data: data,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || 400,
          message: error.message || 'Error updating logo',
          data: null,
        },
        error.status || 400,
      );
    }
  }

}
@Controller('company')
export class companyController {
  constructor(
    private readonly usersService: UsersService,

  ) {}
  @UseGuards(AdminGuard)
  @Patch('update')
  async LoginWithGoogle(@Body() companyDto: CompanyDTO, @Req() req: any) {
    try {
      const updateCompany = await this.usersService.updateCompany(
        req,
        companyDto,
      );
      return {
        statusCode: 201,
        message: 'Updated company successfully',
        data: updateCompany,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || 400,
          message: error.message || 'Error updating company',
          data: null,
        },
        error.status || 400,
      );
    }
  }

  @Get('orgChart')
  async getOrgChart(@Req() req: any) {
    try {
      const data = await this.usersService.getOrgChartByTenantId(
        req.user.tenantId,
      );
      return {
        statusCode: 200,
        message: 'Fetched company successfully',
        data: data,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || 400,
          message: error.message || 'Error fetching company',
          data: null,
        },
        error.status || 400,
      );
    }
  }
  @Get('')
  async findOne(@Req() req: any) {
    try {
      const company = await this.usersService.getCompany(req);
      return {
        statusCode: 200,
        message: 'Fetched company successfully',
        data: company,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || 400,
          message: error.message || 'Error fetching company',
          data: null,
        },
        error.status || 400,
      );
    }
  }
  @HttpCode(200)
  @Post('')
  async CheckDomain(@Req() req: any, @Body() dto: CheckDomainDto) {
    try {
      const message = await this.usersService.checkDomain(dto);
      return {
        statusCode: 200,
        message: message,
        data: null,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || 400,
          message: error.message || 'Error fetching company',
          data: null,
        },
        error.status || 400,
      );
    }
  }
  @Get('getusers/:id')
  async getUsers(@Param('id') id: string, @Req() req: any) {
    try {
      const data = await this.usersService.getUserByEmail(req, id);
      return {
        statusCode: 200,
        message: 'Fetched company successfully',
        data: data,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || 400,
          message: error.message || 'Error fetching company',
          data: null,
        },
        error.status || 400,
      );
    }
  }
  @Post('update-logo')
  @UseInterceptors(FileInterceptor('logo'))
  async updateLogo(@UploadedFile() logo: Express.Multer.File, @Req() req: any) {
    try {
      if (!logo) {
        throw new HttpException(
          'Logo file is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validMimeTypes.includes(logo.mimetype)) {
        throw new HttpException(
          'Invalid file type. Only JPEG, PNG, and GIF are allowed',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Validate file size (max 5MB)
      if (logo.size > 5 * 1024 * 1024) {
        throw new HttpException(
          'File size exceeds 5MB limit',
          HttpStatus.BAD_REQUEST,
        );
      }

      const data = await this.usersService.updateCompanyLogo(req, logo);
      return {
        statusCode: 200,
        message: 'Logo updated successfully',
        data: data,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || 400,
          message: error.message || 'Error updating logo',
          data: null,
        },
        error.status || 400,
      );
    }
  }
  @Post('create-superadmin')
  async createSuperAdmin(@Req() req, @Body() dto: CreateSuperAdminDto) {
    try {
      const data = await this.usersService.createSuperadminUser(req, dto);
      return {
        statusCode: 200,
        message: 'Superadmin created successfully',
        data: data,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || 400,
          message: error.message || 'Error creating superadmin',
          data: null,
        },
        error.status || 400,
      );
    }
  }
  @Get('whitelabel')
  async whiteLabelToggle(@Req() req: any) {
    try {
      const data = await this.usersService.whiteLabelToggle(req);
      return data;
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || 400,
          message: error.message || 'Error fetching company',
          data: null,
        },
        error.status || 400,
      );
    }
  }
}
