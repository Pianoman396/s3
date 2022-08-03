import { Module } from '@nestjs/common';
import { AwsService } from './aws.service';
import { s3Controller } from './controllers/s3.controller';
import { MulterModule } from '@nestjs/platform-express';
import { ImageValidatorService } from '../util/services/imageValidator.service';
import { s3Service } from './services/s3.service';

@Module({
  imports: [ MulterModule.register() ],
  controllers: [ s3Controller ],
  providers: [ AwsService, ImageValidatorService, s3Service ]
})
export class AwsModule {}
