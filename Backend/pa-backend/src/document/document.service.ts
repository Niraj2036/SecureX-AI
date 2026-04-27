import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from './cloudinary.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateAccessDto } from './dto/update-access.dto';
import axios from 'axios';

@Injectable()
export class DocumentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async uploadDocument(
    file: Express.Multer.File,
    dto: CreateDocumentDto,
    req: any,
  ) {
    const userId = req.user.userId;
    const tenantId = req.user.tenantId;

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new HttpException('File size exceeds 10MB limit', HttpStatus.BAD_REQUEST);
    }

    // Upload to Cloudinary
    const folder = `documents/${tenantId}`;
    const { url, publicId } = await this.cloudinary.uploadFile(file, folder);
    console.log("File uploaded to Cloudinary")
    // Create document record
    const document = await this.prisma.document.create({
      data: {
        title: dto.title,
        description: dto.description || null,
        type: dto.type as any,
        fileUrl: url,
        publicId,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadedById: userId,
        employeeId: dto.employeeId || null,
        tenantId,
        access: dto.access && dto.access.length > 0
          ? {
              create: dto.access.map((entry) => ({
                targetType: entry.targetType as any,
                userId: entry.targetType === 'user' ? entry.userId : null,
                teamId: entry.targetType !== 'user' ? entry.teamId : null,
                permission: entry.permission as any,
              })),
            }
          : undefined,
      },
      include: {
        uploadedBy: { select: { id: true, name: true, email: true } },
        employee: { select: { id: true, name: true, email: true } },
        access: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            team: { select: { id: true, name: true, type: true } },
          },
        },
      },
    });

    console.log("Document created successfully")
    // Send to Python backend for RAG ingestion
    try {
  console.log("Sending to Python backend for RAG ingestion");

  const accessData = {
    employees: [userId],
    teams: [],
    depts: [],
    roles: [],
  };

  if (dto.employeeId && dto.employeeId !== userId) {
    accessData.employees.push(dto.employeeId);
  }

  if (dto.access && dto.access.length > 0) {
    for (const entry of dto.access) {
      if (entry.targetType === 'user' && !accessData.employees.includes(entry.userId)) {
        accessData.employees.push(entry.userId);
      } else if (entry.targetType === 'team') {
        accessData.teams.push(entry.teamId);
      } else if (entry.targetType === 'department') {
        accessData.depts.push(entry.teamId);
      }
    }
  }

  const uploader = await this.prisma.user.findUnique({ where: { id: userId } });
  const pythonUrl = process.env.PYTHON_BACKEND_URL || 'http://127.0.0.1:5000';

  const response = await axios.post(`${pythonUrl}/ingest`, {
    user_details: {
      id: userId,
      orgId: tenantId,
      role: uploader?.role || 'user',
      teamId: uploader?.teamId || '',
      deptId: uploader?.departmentId || ''
    },
    documents: [{
      name: document.fileName,
      url: document.fileUrl,
      access: accessData
    }]
  });

  // ✅ PRINT RESPONSE
  console.log("Status:", response.status);
  console.log("Status Text:", response.statusText);
  console.log("Data:", response.data);

  console.log("Python ingestion triggered");

} catch (error) {
  console.log('Failed to trigger Python ingestion:', error.message);

  // 🔥 EXTRA DEBUG (very useful)
  if (error.response) {
    console.log("Error Status:", error.response.status);
    console.log("Error Data:", error.response.data);
  }
}
    
    return document;
  }

  async uploadBulkDocuments(
    files: Express.Multer.File[],
    dtoList: CreateDocumentDto[],
    req: any,
  ) {
    const results = { success: [], failed: [] };

    for (let i = 0; i < files.length; i++) {
      try {
        const dto = dtoList[i] || {
          title: files[i].originalname.replace(/\.[^/.]+$/, ''),
          type: 'other',
        };
        const doc = await this.uploadDocument(files[i], dto as CreateDocumentDto, req);
        results.success.push(doc);
      } catch (error) {
        results.failed.push({
          fileName: files[i].originalname,
          error: error.message,
        });
      }
    }

    return results;
  }

  async getDocuments(req: any, query: any) {
    const userId = req.user.userId;
    const tenantId = req.user.tenantId;
    const role = req.user.role;
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const search = query.search || '';
    const type = query.type || '';

    // Get the user's teamId and departmentId for team/dept-level access checks
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { teamId: true, departmentId: true },
    });

    // Build the WHERE clause
    let whereClause: any = {
      tenantId,
      ...(search ? { title: { contains: search, mode: 'insensitive' } } : {}),
      ...(type ? { type: type as any } : {}),
    };

    // If not admin, restrict to documents the user has access to
    if (role !== 'admin') {
      const accessConditions: any[] = [
        { uploadedById: userId },
        { employeeId: userId },
        { access: { some: { targetType: 'user', userId } } },
      ];

      if (currentUser?.teamId) {
        accessConditions.push({
          access: { some: { targetType: 'team', teamId: currentUser.teamId } },
        });
      }

      if (currentUser?.departmentId) {
        accessConditions.push({
          access: { some: { targetType: 'department', teamId: currentUser.departmentId } },
        });
      }

      whereClause.OR = accessConditions;
    }

    const [documents, total] = await Promise.all([
      this.prisma.document.findMany({
        where: whereClause,
        include: {
          uploadedBy: { select: { id: true, name: true, email: true, avatar: true } },
          employee: { select: { id: true, name: true, email: true } },
          access: {
            include: {
              user: { select: { id: true, name: true, email: true } },
              team: { select: { id: true, name: true, type: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.document.count({ where: whereClause }),
    ]);

    return {
      data: documents,
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    };
  }

  async getDocumentById(id: string, req: any) {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: {
        uploadedBy: { select: { id: true, name: true, email: true, avatar: true } },
        employee: { select: { id: true, name: true, email: true } },
        access: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            team: { select: { id: true, name: true, type: true } },
          },
        },
      },
    });

    if (!document) {
      throw new HttpException('Document not found', HttpStatus.NOT_FOUND);
    }

    // Check access
    const hasAccess = await this.checkAccess(document, req);
    if (!hasAccess) {
      throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
    }

    return document;
  }

  async deleteDocument(id: string, req: any) {
    const document = await this.prisma.document.findUnique({ where: { id } });

    if (!document) {
      throw new HttpException('Document not found', HttpStatus.NOT_FOUND);
    }

    if (document.tenantId !== req.user.tenantId) {
      throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
    }

    // Delete from Cloudinary
    try {
      await this.cloudinary.deleteFile(document.publicId);
    } catch (error) {
      console.error('Error deleting from Cloudinary:', error.message);
    }

    // Delete from database (documentAccess cascade deletes)
    await this.prisma.document.delete({ where: { id } });

    return { message: 'Document deleted successfully' };
  }

  async updateAccess(id: string, dto: UpdateAccessDto, req: any) {
    const document = await this.prisma.document.findUnique({ where: { id } });

    if (!document) {
      throw new HttpException('Document not found', HttpStatus.NOT_FOUND);
    }

    if (document.tenantId !== req.user.tenantId) {
      throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
    }

    // Delete existing access entries and create new ones
    await this.prisma.$transaction([
      this.prisma.documentAccess.deleteMany({ where: { documentId: id } }),
      ...dto.access.map((entry) =>
        this.prisma.documentAccess.create({
          data: {
            documentId: id,
            targetType: entry.targetType as any,
            userId: entry.targetType === 'user' ? entry.userId : null,
            teamId: entry.targetType !== 'user' ? entry.teamId : null,
            permission: entry.permission as any,
          },
        }),
      ),
    ]);

    // Return updated document with access
    return this.getDocumentById(id, req);
  }

  async getDocumentAccess(id: string, req: any) {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: {
        access: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            team: { select: { id: true, name: true, type: true } },
          },
        },
      },
    });

    if (!document) {
      throw new HttpException('Document not found', HttpStatus.NOT_FOUND);
    }

    return document.access;
  }

  private async checkAccess(document: any, req: any): Promise<boolean> {
    const userId = req.user.userId;
    const role = req.user.role;

    // Admin always has access
    if (role === 'admin') return true;

    // Uploader has access
    if (document.uploadedById === userId) return true;

    // Named employee has access
    if (document.employeeId === userId) return true;

    // Check explicit access
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { teamId: true, departmentId: true },
    });

    const hasExplicitAccess = document.access?.some((entry: any) => {
      if (entry.targetType === 'user' && entry.userId === userId) return true;
      if (entry.targetType === 'team' && entry.teamId === currentUser?.teamId) return true;
      if (entry.targetType === 'department' && entry.teamId === currentUser?.departmentId) return true;
      return false;
    });

    return hasExplicitAccess || false;
  }
}
