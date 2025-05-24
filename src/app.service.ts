import { ImATeapotException, Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    throw new ImATeapotException();
  }
}
