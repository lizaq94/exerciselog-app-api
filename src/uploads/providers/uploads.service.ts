import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadsService {
  public async uploadImage(file: Express.Multer.File) {}
}
