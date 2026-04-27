import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RagService {
  constructor(private readonly prisma: PrismaService) {}

  private get pythonUrl(): string {
    return process.env.PYTHON_BACKEND_URL || 'http://127.0.0.1:5000';
  }

  async chat(question: string, req: any) {
    const userId = req.user.userId;
    const tenantId = req.user.tenantId;

    // Fetch user details to pass to python for access control
    const uploader = await this.prisma.user.findUnique({ where: { id: userId } });

    try {
      const response = await axios.post(`${this.pythonUrl}/query`, {
        user_details: {
          id: userId,
          orgId: tenantId,
          role: uploader?.role || 'user',
          teamId: uploader?.teamId || '',
          deptId: uploader?.departmentId || ''
        },
        question: question
      });

      return response.data;
    } catch (error) {
      console.error("Error communicating with Python backend (chat):", error.message);
      throw new HttpException(
        'Failed to connect to AI service.',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  async getAudits(req: any) {
    const userId = req.user.userId;

    try {
      const response = await axios.get(`${this.pythonUrl}/audits/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error communicating with Python backend (audits):", error.message);
      throw new HttpException(
        'Failed to fetch audits.',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }
}
