import { IsNumber } from 'class-validator';

export class SetDto {
  id: number;
  @IsNumber()
  repetitions: number;
  @IsNumber()
  weight: number;
  @IsNumber()
  order: number;
}
