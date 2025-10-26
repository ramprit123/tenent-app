import {
  Injectable,
  Logger,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { format } from 'sql-formatter';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class OllamaService {
  private readonly logger = new Logger(OllamaService.name);
  private readonly OLLAMA_URL =
    process.env.OLLAMA_URL || 'http://localhost:11434';
  private readonly OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'sqlcoder';
  private readonly MAX_PROMPT_LENGTH = 1000;
  private readonly REQUEST_TIMEOUT = 60000; // 60 seconds

  // SQL injection prevention patterns
  private readonly DANGEROUS_PATTERNS = [
    /;\s*(drop|delete|truncate|alter|create|insert|update)\s+/i,
    /union\s+select/i,
    /exec\s*\(/i,
    /xp_cmdshell/i,
    /sp_executesql/i,
    /--\s*$/m,
    /\/\*.*\*\//s,
  ];

  // Allowed SQL operations (read-only)
  private readonly ALLOWED_OPERATIONS = [
    /^\s*select\s+/i,
    /^\s*with\s+/i, // CTE queries
  ];

  constructor(private readonly prisma: PrismaService) {}

  async debugTextToSql(prompt: string, userId: string) {
    this.logger.log(`🔄 DEBUG: Starting SQL generation for user: ${userId}`);

    // Input validation
    this.validatePrompt(prompt);
    this.logger.log('✅ DEBUG: Prompt validation passed');

    const systemPrompt = `You are an expert SQL generator for a PostgreSQL database using Prisma ORM schema.

IMPORTANT SECURITY RULES:
- Only generate SELECT queries (no INSERT, UPDATE, DELETE, DROP, ALTER, CREATE)
- Do not include any comments (-- or /* */)
- Do not use UNION operations
- Only query these tables: Tenant, User, Property, Flat, Occupant, Agreement, RentPayment, AuditLog
- Always include proper WHERE clauses for data isolation
- Limit results to maximum 100 rows
- Output ONLY the SQL query without quotes, markdown, or explanations

Schema includes: Tenant, User, Property, Flat, Occupant, Agreement, RentPayment, AuditLog, etc.`;

    try {
      this.logger.log(
        `🔄 DEBUG: Calling Ollama at ${this.OLLAMA_URL} with model ${this.OLLAMA_MODEL}`,
      );

      // Format prompt for sqlcoder model - using actual database schema with quoted names
      const formattedPrompt = `-- Database schema (use quoted table names):
-- Table: "Tenant" (id, name, phone, email, created_at)
-- Table: "Property" (id, name, address, type, created_at)  
-- Table: "Flat" (id, property_id, number, rent_amount, created_at)
-- Table: "KycRecord" (id, tenant_id, document_type, status, created_at)
-- Table: "Agreement" (id, tenant_id, flat_id, start_date, end_date, rent_amount, created_at)
-- Table: "RentPayment" (id, agreement_id, amount, due_date, paid_date, is_late, created_at)
-- Table: "Complaint" (id, tenant_id, property_id, description, status, created_at)
-- Table: "AuditLog" (id, user_id, service, action, entity, created_at)

-- Question: ${prompt}
-- Use quoted table names like "Tenant", "Property", etc.
SELECT`;

      const response = await axios.post(
        `${this.OLLAMA_URL}/api/generate`,
        {
          model: this.OLLAMA_MODEL,
          prompt: formattedPrompt,
          stream: false,
        },
        {
          timeout: this.REQUEST_TIMEOUT,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log('✅ DEBUG: Received response from Ollama');

      if (!response.data?.response) {
        this.logger.error('❌ DEBUG: Invalid response structure from Ollama');
        throw new BadRequestException('Invalid response from Ollama service');
      }

      const rawText = response.data.response.trim();
      this.logger.log(`🔍 DEBUG: Raw response from Ollama: "${rawText}"`);

      // Prepend SELECT since we only sent the rest of the query
      const fullSql = 'SELECT ' + rawText;

      // Clean up the SQL string
      let cleanedSql = fullSql.trim();

      // Remove any potential SQL comments
      cleanedSql = cleanedSql
        .replace(/--.*$/gm, '')
        .replace(/\/\*[\s\S]*?\*\//g, '');

      // Remove extra quotes that might be wrapping the entire query
      cleanedSql = cleanedSql.replace(/^["'`]+|["'`]+$/g, '');

      // Remove any markdown code block markers
      cleanedSql = cleanedSql.replace(/^```sql\s*|^```\s*|```$/gm, '');

      // Clean up whitespace
      cleanedSql = cleanedSql.trim();

      this.logger.log(`🔍 DEBUG: Cleaned SQL: "${cleanedSql}"`);

      return {
        rawResponse: rawText,
        cleanedSql: cleanedSql,
        startsWithSelect: /^\s*select\s+/i.test(cleanedSql),
        startsWithWith: /^\s*with\s+/i.test(cleanedSql),
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error(`❌ DEBUG: Ollama service error: ${error.message}`);
        throw new BadRequestException(
          `Failed to generate SQL query: ${error.message}`,
        );
      }
      this.logger.error(`❌ DEBUG: Unexpected error: ${error.message}`);
      throw error;
    }
  }

  async textToSql(prompt: string, userId: string) {
    this.logger.log(`🔄 Starting SQL generation for user: ${userId}`);

    // Input validation
    this.validatePrompt(prompt);
    this.logger.log('✅ Prompt validation passed');

    const systemPrompt = `You are an expert SQL generator for a PostgreSQL database using Prisma ORM schema.

IMPORTANT SECURITY RULES:
- Only generate SELECT queries (no INSERT, UPDATE, DELETE, DROP, ALTER, CREATE)
- Do not include any comments (-- or /* */)
- Do not use UNION operations
- Only query these tables: Tenant, User, Property, Flat, Occupant, Agreement, RentPayment, AuditLog
- Always include proper WHERE clauses for data isolation
- Limit results to maximum 100 rows
- Output ONLY the SQL query without quotes, markdown, or explanations

Schema includes: Tenant, User, Property, Flat, Occupant, Agreement, RentPayment, AuditLog, etc.`;

    try {
      this.logger.log(
        `🔄 Calling Ollama at ${this.OLLAMA_URL} with model ${this.OLLAMA_MODEL}`,
      );

      // Format prompt for sqlcoder model - using actual database schema with quoted names
      const formattedPrompt = `-- Database schema (use quoted table names):
-- Table: "Tenant" (id, name, phone, email, created_at)
-- Table: "Property" (id, name, address, type, created_at)  
-- Table: "Flat" (id, property_id, number, rent_amount, created_at)
-- Table: "KycRecord" (id, tenant_id, document_type, status, created_at)
-- Table: "Agreement" (id, tenant_id, flat_id, start_date, end_date, rent_amount, created_at)
-- Table: "RentPayment" (id, agreement_id, amount, due_date, paid_date, is_late, created_at)
-- Table: "Complaint" (id, tenant_id, property_id, description, status, created_at)
-- Table: "AuditLog" (id, user_id, service, action, entity, created_at)

-- Question: ${prompt}
-- Use quoted table names like "Tenant", "Property", etc.
SELECT`;

      const response = await axios.post(
        `${this.OLLAMA_URL}/api/generate`,
        {
          model: this.OLLAMA_MODEL,
          prompt: formattedPrompt,
          stream: false,
        },
        {
          timeout: this.REQUEST_TIMEOUT,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log('✅ Received response from Ollama');

      if (!response.data?.response) {
        this.logger.error('❌ Invalid response structure from Ollama');
        throw new BadRequestException('Invalid response from Ollama service');
      }

      const text = response.data.response.trim();
      this.logger.log(`🔄 Raw SQL from Ollama: ${text}`);

      // Prepend SELECT since we only sent the rest of the query
      const fullSql = 'SELECT ' + text;
      const sql = this.sanitizeAndValidateSQL(fullSql);
      this.logger.log(
        `✅ SQL validated and sanitized: ${sql.substring(0, 100)}...`,
      );

      return sql;
    } catch (error) {
      if (error instanceof AxiosError) {
        this.logger.error(`❌ Ollama service error: ${error.message}`);
        this.logger.error(
          `❌ Error details: ${JSON.stringify(error.response?.data || 'No response data')}`,
        );
        throw new BadRequestException(
          `Failed to generate SQL query: ${error.message}`,
        );
      }
      this.logger.error(`❌ Unexpected error: ${error.message}`);
      throw error;
    }
  }

  private validatePrompt(prompt: string): void {
    if (!prompt || typeof prompt !== 'string') {
      throw new BadRequestException('Prompt is required and must be a string');
    }

    if (prompt.length > this.MAX_PROMPT_LENGTH) {
      throw new BadRequestException(
        `Prompt too long. Maximum ${this.MAX_PROMPT_LENGTH} characters allowed`,
      );
    }

    // Check for suspicious patterns in prompt
    const suspiciousPatterns = [
      /drop\s+table/i,
      /delete\s+from/i,
      /truncate/i,
      /alter\s+table/i,
      /create\s+table/i,
      /insert\s+into/i,
      /update\s+set/i,
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(prompt)) {
        throw new ForbiddenException(
          'Prompt contains potentially dangerous operations',
        );
      }
    }
  }

  private sanitizeAndValidateSQL(sql: string): string {
    if (!sql || typeof sql !== 'string') {
      throw new BadRequestException('Generated SQL is invalid');
    }

    // Clean up the SQL string
    sql = sql.trim();

    // Remove any potential SQL comments
    sql = sql.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');

    // Remove extra quotes that might be wrapping the entire query
    sql = sql.replace(/^["'`]+|["'`]+$/g, '');

    // Remove any markdown code block markers
    sql = sql.replace(/^```sql\s*|^```\s*|```$/gm, '');

    // Remove common prefixes that Ollama might add
    sql = sql.replace(/^\(with comments\):\s*/i, '');
    sql = sql.replace(/^<s>\s*/i, '');
    sql = sql.replace(/^##\s*/i, '');
    sql = sql.replace(/^Here's the SQL query:\s*/i, '');
    sql = sql.replace(/^SQL:\s*/i, '');
    sql = sql.replace(/^Query:\s*/i, '');

    // Handle Unicode escape sequences
    sql = sql.replace(/\\u003c/g, '<').replace(/\\u003e/g, '>');

    // Remove any remaining angle brackets
    sql = sql.replace(/^<[^>]*>\s*/i, '');
    sql = sql.replace(/<[^>]*>$/i, '');

    // Remove leading dots and extra whitespace
    sql = sql.replace(/^\.\s*\n*\s*/i, '');
    sql = sql.replace(/^\n+/, '');

    // Find the first complete SELECT statement and remove everything after it
    const selectMatch = sql.match(/(SELECT[\s\S]*?)(?:\n\n|<\s*s\s*>|$)/i);
    if (selectMatch) {
      sql = selectMatch[1].trim();
    }

    // Remove any trailing semicolons before adding LIMIT
    sql = sql.replace(/;\s*$/, '');

    // Remove any existing LIMIT clause to avoid duplicates
    sql = sql.replace(/\s+LIMIT\s+\d+\s*$/i, '');

    // Clean up whitespace
    sql = sql.trim();

    // Fix table names - add quotes to known table names
    const tableNames = [
      'AuditLog',
      'Tenant',
      'Property',
      'Flat',
      'KycRecord',
      'Agreement',
      'RentPayment',
      'Complaint',
      'User',
      'Occupant',
      'Lease',
      'Maintenance',
      'Vendor',
      'Notification',
      'File',
      'Asset',
      'Event',
      'Announcement',
    ];
    for (const tableName of tableNames) {
      // Replace table names in FROM clauses
      sql = sql.replace(
        new RegExp(`FROM\\s+${tableName}\\b`, 'gi'),
        `FROM "${tableName}"`,
      );
      // Replace table names in JOIN clauses
      sql = sql.replace(
        new RegExp(`JOIN\\s+${tableName}\\b`, 'gi'),
        `JOIN "${tableName}"`,
      );
    }

    // Basic validation before formatting
    if (!sql) {
      throw new BadRequestException('Generated SQL is empty after cleaning');
    }

    // Format and clean the SQL (disabled formatter to preserve quoted table names)
    let formattedSql: string;
    try {
      // Temporarily disable SQL formatter as it's converting quoted table names to lowercase
      // formattedSql = format(sql, {
      //   language: 'postgresql',
      //   keywordCase: 'upper',
      // });
      formattedSql = sql; // Use the cleaned SQL as-is
    } catch (error) {
      this.logger.error(
        `SQL formatting error: ${error.message}. Original SQL: ${sql}`,
      );
      // If formatting fails, use the cleaned SQL as-is but still validate it
      formattedSql = sql;
    }

    // Validate against dangerous patterns
    for (const pattern of this.DANGEROUS_PATTERNS) {
      if (pattern.test(formattedSql)) {
        this.logger.warn(`Dangerous SQL pattern detected: ${formattedSql}`);
        throw new ForbiddenException(
          'Generated SQL contains forbidden operations',
        );
      }
    }

    // Ensure it's a read-only operation
    const isAllowed = this.ALLOWED_OPERATIONS.some((pattern) =>
      pattern.test(formattedSql),
    );
    if (!isAllowed) {
      throw new ForbiddenException('Only SELECT queries are allowed');
    }

    // Add LIMIT if not present
    if (!/\blimit\s+\d+/i.test(formattedSql)) {
      formattedSql += ' LIMIT 100';
    }

    return formattedSql;
  }

  async executeSql(sql: string, userId: string, tenantId?: string) {
    // Final validation before execution
    this.sanitizeAndValidateSQL(sql);

    try {
      // Execute with timeout
      const startTime = Date.now();
      const result = await Promise.race([
        this.prisma.$queryRawUnsafe(sql),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Query timeout')), 10000),
        ),
      ]);
      const executionTime = Date.now() - startTime;

      // Log successful query execution (only if userId exists)
      try {
        if (
          userId &&
          userId !== 'anonymous' &&
          userId !== 'test-user' &&
          userId !== 'debug-user'
        ) {
          await this.prisma.auditLog.create({
            data: {
              userId,
              tenantId,
              service: 'ollama',
              action: 'execute-sql',
              entity: 'raw-query',
              entityId: 'n/a',
              diff: {
                sql: sql.substring(0, 500), // Truncate for storage
                executionTime,
                resultCount: Array.isArray(result) ? result.length : 1,
              },
            },
          });
        }
      } catch (auditError) {
        this.logger.warn(`Audit logging failed: ${auditError.message}`);
        // Don't fail the main operation if audit logging fails
      }

      this.logger.log(
        `SQL executed successfully for user ${userId} in ${executionTime}ms`,
      );

      return {
        data: result,
        meta: {
          executionTime,
          resultCount: Array.isArray(result) ? result.length : 1,
        },
      };
    } catch (err) {
      this.logger.error(
        `SQL execution failed for user ${userId}: ${err.message}`,
      );
      this.logger.error(`Failed SQL: ${sql}`);

      // Try to log the failure, but don't fail if audit logging fails
      try {
        if (
          userId &&
          userId !== 'anonymous' &&
          userId !== 'test-user' &&
          userId !== 'debug-user'
        ) {
          await this.prisma.auditLog.create({
            data: {
              userId,
              tenantId,
              service: 'ollama',
              action: 'execute-sql-failed',
              entity: 'raw-query',
              entityId: 'n/a',
              diff: {
                sql: sql.substring(0, 500),
                error: err.message,
              },
            },
          });
        }
      } catch (auditError) {
        this.logger.error(`Audit logging failed: ${auditError.message}`);
      }

      // Provide more specific error messages
      if (
        err.message.includes('relation') &&
        err.message.includes('does not exist')
      ) {
        throw new BadRequestException(
          `Database table not found. The generated SQL references tables that don't exist in your database: ${err.message}`,
        );
      } else if (
        err.message.includes('column') &&
        err.message.includes('does not exist')
      ) {
        throw new BadRequestException(
          `Database column not found. The generated SQL references columns that don't exist: ${err.message}`,
        );
      } else if (err.message.includes('syntax error')) {
        throw new BadRequestException(
          `SQL syntax error in generated query: ${err.message}`,
        );
      } else {
        throw new BadRequestException(`Query execution failed: ${err.message}`);
      }
    }
  }
}
