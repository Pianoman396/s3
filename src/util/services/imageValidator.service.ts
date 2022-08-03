import { PipeTransform, Injectable, ArgumentMetadata, HttpException } from '@nestjs/common';

Injectable()
export  class ImageValidatorService implements PipeTransform {
  transform(value: Express.Multer.File, metadata: ArgumentMetadata) {
    console.log(value, '----------------------');
    if(this.isEmpty(value)) {
      throw new HttpException('File is empty or broken', 506);
    }
    const oneMb = 1000;
    const acceptable = ['png'];

    return oneMb > value.size && acceptable.includes(value.mimetype);
  }

  private isEmpty(arg: any) {
    if(Object.keys(arg).length < 1) {

      return true;
    }

    return false;
  }

}