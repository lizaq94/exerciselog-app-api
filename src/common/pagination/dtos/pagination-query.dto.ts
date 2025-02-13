import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsPositive } from 'class-validator';

export class PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
  })
  @IsOptional()
  @IsPositive()
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsPositive()
  page?: number = 1;
}
