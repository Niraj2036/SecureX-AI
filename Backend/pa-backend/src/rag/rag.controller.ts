import { Controller, Post, Get, Body, Req, UseGuards } from '@nestjs/common';
import { RagService } from './rag.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('rag')
@Controller('rag')
@UseGuards(AuthGuard)
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Ask a question using RAG' })
  async chat(@Body('question') question: string, @Req() req: any) {
    return this.ragService.chat(question, req);
  }

  @Get('audits')
  @ApiOperation({ summary: 'Get current user query audits' })
  async getAudits(@Req() req: any) {
    return this.ragService.getAudits(req);
  }
}
