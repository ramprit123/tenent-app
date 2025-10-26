import { Module } from '@nestjs/common';
import { OllamaController } from './ollama.controller';
import { OllamaService } from './ollama.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [OllamaController],
  providers: [OllamaService, PrismaService],
  exports: [OllamaService],
})
export class OllamaModule {}
