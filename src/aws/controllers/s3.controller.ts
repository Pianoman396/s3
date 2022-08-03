import { Controller, Post, Body, UploadedFiles, UseInterceptors, HttpException, HttpStatus } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { s3Service } from '../services/s3.service';
import { ImageValidatorService } from '../../util/services/imageValidator.service';
import { extname } from 'path';
import { logicalExpression } from '@babel/types';

@Controller('storage')
export  class s3Controller {
  constructor(private readonly s3Service: s3Service) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files', 5, {
      limits: {
        fileSize: +process.env.MAX_FILE_SIZE,
      },
      fileFilter: (req: any, file: any, cb: any) => {
        const fileSize = parseInt(req.headers["content-length"]);
        if (file.mimetype.match(/\/(png|jpg)$/) && +process.env.MAX_FILE_SIZE >= (fileSize / 1000)) {
          cb(null, true);
        } else {
          if(+process.env.MAX_FILE_SIZE < (fileSize / 1000)) {
            cb(new HttpException(`File size doesn't match`, HttpStatus.BAD_REQUEST), false);
          } else {
            cb(new HttpException(`Unsupported file type ${extname(file.originalname)}`, HttpStatus.BAD_REQUEST), false);
          }
        }
      },
    }
  ))
  async upload(
    @UploadedFiles(
      // ImageValidatorService
    ) files: Express.Multer.File[],
    @Body('type') type: string
  ) {
    // return this.s3Service.test(files[0], type);
    if( 2 > files.length ) {

      return this.s3Service.uploadSingleFile(files, type);
    } else {

      return this.s3Service.uploadMultipleFiles();
    }

  }

}
