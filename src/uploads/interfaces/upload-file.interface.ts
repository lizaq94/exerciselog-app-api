import { FileType } from '../enums/file-type.enum';

export interface UploadFile {
  name: string;
  path: string;
  type: FileType;
  mime: string;
  size: number;
}
