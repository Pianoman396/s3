import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {

  test() {
    return 'Works';
  }

}
