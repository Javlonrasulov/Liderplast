import { Injectable } from '@nestjs/common';

const APP_TIME_ZONE = process.env.APP_TIMEZONE ?? 'Asia/Tashkent';

@Injectable()
export class AppService {
  getHealth() {
    const now = new Date();
    return {
      service: 'liderplast-backend',
      status: 'ok',
      timestamp: now.toISOString(),
      timeZone: APP_TIME_ZONE,
      today: new Intl.DateTimeFormat('en-CA', {
        timeZone: APP_TIME_ZONE,
      }).format(now),
    };
  }
}
