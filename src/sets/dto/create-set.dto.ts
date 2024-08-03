import { OmitType } from '@nestjs/swagger';
import { SetDto } from '../../common/dto/set.dto';

export class CreateSetDto extends OmitType(SetDto, ['id']) {}
