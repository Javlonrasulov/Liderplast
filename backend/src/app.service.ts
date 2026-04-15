import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      service: 'liderplast-backend',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
