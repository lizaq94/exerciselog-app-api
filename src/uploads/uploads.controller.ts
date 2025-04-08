import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { ApiHeaders, ApiOperation } from '@nestjs/swagger';
import { UploadsService } from './providers/uploads.service';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadService: UploadsService) {}
  @UseInterceptors(FileInterceptor('image'))
  @ApiHeaders([
    { name: 'Content-Type', description: 'multipart/form-data' },
    { name: 'Authorization', description: 'Bearer Token' },
  ])
  @ApiOperation({ summary: 'Upload a nwe image to the server' })
  @Post('image')
  public uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.uploadImage(file);
  }
}
