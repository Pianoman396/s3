import { HttpException, Injectable } from '@nestjs/common';
import * as AWS from "aws-sdk";
import { Readable } from "stream";
// const tinify = require('tinify');
const sharp = require('sharp');

export enum ImageTypes {
  LARGE = 'large',
  MEDIUM = 'medium ',
  THUMB = 'thumb'
}

@Injectable()
export class s3Service {

  private  AWS_S3_BUCKET: string = process.env.AWS_S3_BUCKET;

  private s3: any = new AWS.S3({
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_KEY_SECRET,
  });

  constructor() {}

  async uploadSingleFile(file: Express.Multer.File[], type) {
    const { originalname, mimetype } = file[0];
    const buffer = await this.resizeByType(file[0], type);
    return await this.s3_upload(buffer, this.AWS_S3_BUCKET, originalname, mimetype);
  }

  uploadMultipleFiles() {}

  async s3_upload(file, bucket, name, mimetype)  {
    const params = {
      Bucket: bucket,
      Key: String(name),
      Body: file,
      // ACL: "public-read",
      ContentType: mimetype,
      ContentDisposition:"inline",
      CreateBucketConfiguration: {
        LocationConstraint: "eu-west-2"
      }
    };

    console.log('------------' ,params, '------------');

    try {
      let s3Response = await this.s3?.upload(params).promise();

     return s3Response;
    }  catch (e) {
      console.log(e);
    }
  }


  private bufferToStream(buffer: Buffer) {
    return new Readable({
      read() {
        this.push(buffer);
        this.push(null);
      },
    });
  }

  private async resizeByType(file, type) {
    return new Promise(async (resolveImg, rejectImg) => {
      try  {
        const minWidth = ImageTypes.LARGE == type ? 2048 : ImageTypes.MEDIUM == type ? 1024 : 300 ;
        const minHeight = ImageTypes.LARGE == type ? 2048 :  ImageTypes.MEDIUM == type ? 1024 : 300;
        if(!Buffer.isBuffer(file.buffer)) {
          rejectImg('Error');
          throw new HttpException('File buffer is not valid', 506);
        }
        const image = await sharp(file?.buffer);
         await  image
          .metadata()
          .then(async (imageMetadata) => {
            let imageBuffer = file.buffer;

            if (imageMetadata.width < minWidth) {
              imageBuffer = await image.resize(minWidth).png().toBuffer();
            }
            const imageRecheck = await sharp(file?.buffer);

            const reCheck = await imageRecheck.metadata();
            if (reCheck.height < minHeight) {
              imageBuffer = await imageRecheck
                .resize(null, minHeight)
                .png()
                .toBuffer();
            }
            resolveImg(imageBuffer);
          });
      } catch (e) {
        rejectImg(e);
        console.log('Error:' , e);
      }
    });
  }

 async test(file, type) {
    console.log(await  this.resizeByType(file, type));
  }

}
