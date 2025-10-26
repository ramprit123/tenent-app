import {
  Controller,
  Post,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import type { Request } from 'express';
import { OllamaService } from './ollama.service';
import { QuerySqlDto } from './dto/query-sql.dto';

/**
 * Ollama Controller - AI-powered SQL query generation
 *
 * Security Features:
 * - Input validation and sanitization
 * - Rate limiting (should be implemented at gateway level)
 * - Authentication required
 * - Audit logging
 * - Read-only SQL operations only
 */
@Controller('ollama')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class OllamaController {
  constructor(private readonly ollamaService: OllamaService) {}

  /**
   * Health check endpoint for Ollama service
   */
  @Post('health')
  @HttpCode(HttpStatus.OK)
  async health() {
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      const data = await response.json();
      return {
        success: true,
        ollama: 'connected',
        models: data.models?.map((m) => m.name) || [],
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        ollama: 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Debug endpoint to see raw SQL generation without execution
   */
  @Post('debug')
  @HttpCode(HttpStatus.OK)
  async debug(@Body() dto: QuerySqlDto, @Req() req: Request) {
    const userId = req.user?.id || req.user?.sub || 'debug-user';

    try {
      const debugInfo = await this.ollamaService.debugTextToSql(
        dto.prompt,
        userId,
      );
      return {
        success: true,
        prompt: dto.prompt,
        ...debugInfo,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        prompt: dto.prompt,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Test database connection and show available tables
   */
  @Post('test-db')
  @HttpCode(HttpStatus.OK)
  async testDb() {
    try {
      // Test with a simple query to see what tables exist
      const result = await this.ollamaService.executeSql(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' LIMIT 10",
        'test-user',
      );
      return {
        success: true,
        message: 'Database connection successful',
        tables: result.data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Test AuditLog query manually
   */
  @Post('test-auditlog')
  @HttpCode(HttpStatus.OK)
  async testAuditLog() {
    try {
      const result = await this.ollamaService.executeSql(
        'SELECT * FROM "AuditLog" WHERE service = \'payment\' LIMIT 5',
        'test-user',
      );
      return {
        success: true,
        message: 'AuditLog query successful',
        sql: 'SELECT * FROM "AuditLog" WHERE service = \'payment\' LIMIT 5',
        data: result.data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Test Tenant table query manually
   */
  @Post('test-tenant-simple')
  @HttpCode(HttpStatus.OK)
  async testTenantSimple() {
    try {
      const result = await this.ollamaService.executeSql(
        'SELECT name FROM "Tenant" LIMIT 5',
        'test-user',
      );
      return {
        success: true,
        message: 'Tenant query successful',
        sql: 'SELECT name FROM "Tenant" LIMIT 5',
        data: result.data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Generate SQL query without execution (for testing)
   */
  @Post('generate')
  @HttpCode(HttpStatus.OK)
  async generate(@Body() dto: QuerySqlDto, @Req() req: Request) {
    const userId = req.user?.id || req.user?.sub || 'anonymous';
    console.log(dto);
    try {
      const sql = await this.ollamaService.textToSql(dto.prompt, userId);
      return {
        success: true,
        prompt: dto.prompt,
        sql,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ SQL generation failed:', error.message);
      throw error;
    }
  }

  /**
   * Generate and execute SQL query from natural language prompt
   *
   * @param dto - Query request with prompt
   * @param req - Express request object containing user info
   * @returns Generated SQL and query results
   */
  @Post('query')
  @HttpCode(HttpStatus.OK)
  async query(@Body() dto: QuerySqlDto, @Req() req: Request) {
    console.log('🚀 Query received:', dto.prompt);

    const userId = req.user?.id || req.user?.sub || 'anonymous';
    const tenantId =
      req.user?.tenantId || (req.headers['x-tenant-id'] as string);

    console.log('👤 User context:', { userId, tenantId });

    try {
      // Generate SQL from natural language prompt
      console.log('🔄 Generating SQL...');
      const sql = await this.ollamaService.textToSql(dto.prompt, userId);
      console.log('✅ SQL generated:', sql);

      // Execute the generated SQL
      console.log('🔄 Executing SQL...');
      const result = await this.ollamaService.executeSql(sql, userId, tenantId);
      console.log('✅ SQL executed successfully');

      return {
        success: true,
        sql,
        ...result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Query failed:', error.message);
      console.error('❌ Error stack:', error.stack);

      // Return a proper error response instead of throwing
      return {
        success: false,
        error: error.message,
        prompt: dto.prompt,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
