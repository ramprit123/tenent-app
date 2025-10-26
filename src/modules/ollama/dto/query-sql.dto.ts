import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class QuerySqlDto {
  @IsString()
  @IsNotEmpty({ message: 'Prompt is required' })
  @Length(1, 1000, { message: 'Prompt must be between 1 and 1000 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Matches(/^[a-zA-Z0-9\s\-_.,?!()]+$/, {
    message: 'Prompt contains invalid characters',
  })
  prompt: string;
}
