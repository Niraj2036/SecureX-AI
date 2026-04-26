import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateAccessDto } from './dto/update-access.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

const multerOptions = {
  storage: memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req: any, file: any, callback: any) => {
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'text/plain',
      'image/png',
      'image/jpeg',
      'image/jpg',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(
        new HttpException(
          `File type ${file.mimetype} is not allowed. Allowed: PDF, DOC, DOCX, XLSX, CSV, TXT, PNG, JPG`,
          HttpStatus.BAD_REQUEST,
        ),
        false,
      );
    }
  },
};

@ApiTags('documents')
@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('upload')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file', multerOptions))
  @ApiOperation({ summary: 'Upload a single document' })
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Req() req: any,
  ) {
    try {
      if (!file) {
        throw new HttpException('File is required', HttpStatus.BAD_REQUEST);
      }

      // Parse the access JSON string from form-data
      const dto: CreateDocumentDto = {
        title: body.title,
        description: body.description,
        type: body.type || 'other',
        employeeId: body.employeeId,
        access: body.access ? JSON.parse(body.access) : [],
      };

      const document = await this.documentService.uploadDocument(file, dto, req);
      return {
        statusCode: 201,
        message: 'Document uploaded successfully',
        data: document,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || 400,
          message: error.message || 'Error uploading document',
          data: null,
        },
        error.status || 400,
      );
    }
  }

  @Post('upload-bulk')
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('files', 10, multerOptions))
  @ApiOperation({ summary: 'Upload multiple documents (up to 10)' })
  async uploadBulkDocuments(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any,
    @Req() req: any,
  ) {
    try {
      if (!files || files.length === 0) {
        throw new HttpException('At least one file is required', HttpStatus.BAD_REQUEST);
      }

      // Parse the metadata JSON string from form-data
      const metadata = body.metadata ? JSON.parse(body.metadata) : [];
      const results = await this.documentService.uploadBulkDocuments(files, metadata, req);

      return {
        statusCode: 201,
        message: `Uploaded ${results.success.length} documents, ${results.failed.length} failed`,
        data: results,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || 400,
          message: error.message || 'Error uploading documents',
          data: null,
        },
        error.status || 400,
      );
    }
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'List documents with access control' })
  async getDocuments(@Req() req: any, @Query() query: any) {
    try {
      const documents = await this.documentService.getDocuments(req, query);
      return {
        statusCode: 200,
        message: 'Documents fetched successfully',
        data: documents,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || 400,
          message: error.message || 'Error fetching documents',
          data: null,
        },
        error.status || 400,
      );
    }
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get a single document' })
  async getDocument(@Param('id') id: string, @Req() req: any) {
    try {
      const document = await this.documentService.getDocumentById(id, req);
      return {
        statusCode: 200,
        message: 'Document fetched successfully',
        data: document,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || 400,
          message: error.message || 'Error fetching document',
          data: null,
        },
        error.status || 400,
      );
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Delete a document' })
  async deleteDocument(@Param('id') id: string, @Req() req: any) {
    try {
      const result = await this.documentService.deleteDocument(id, req);
      return {
        statusCode: 200,
        message: result.message,
        data: null,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || 400,
          message: error.message || 'Error deleting document',
          data: null,
        },
        error.status || 400,
      );
    }
  }

  @Put(':id/access')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update document access list' })
  async updateAccess(
    @Param('id') id: string,
    @Body() dto: UpdateAccessDto,
    @Req() req: any,
  ) {
    try {
      const document = await this.documentService.updateAccess(id, dto, req);
      return {
        statusCode: 200,
        message: 'Access updated successfully',
        data: document,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || 400,
          message: error.message || 'Error updating access',
          data: null,
        },
        error.status || 400,
      );
    }
  }

  @Get(':id/access')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get document access list' })
  async getDocumentAccess(@Param('id') id: string, @Req() req: any) {
    try {
      const access = await this.documentService.getDocumentAccess(id, req);
      return {
        statusCode: 200,
        message: 'Access list fetched successfully',
        data: access,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: error.status || 400,
          message: error.message || 'Error fetching access list',
          data: null,
        },
        error.status || 400,
      );
    }
  }
}
