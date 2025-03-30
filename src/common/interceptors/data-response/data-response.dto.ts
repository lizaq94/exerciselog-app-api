import { ApiProperty } from '@nestjs/swagger';

export class DataResponseDto {
  @ApiProperty({ example: '1.0.0', description: 'API version' })
  apiVersion: string;

  @ApiProperty({ description: 'Api response' })
  data: any;
}
