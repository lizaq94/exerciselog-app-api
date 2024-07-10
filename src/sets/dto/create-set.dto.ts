import { OmitType } from '@nestjs/mapped-types';
import { SetDto } from '../../common/dto/set.dto';

export class CreateSetDto extends OmitType(SetDto, ['id']) {}
