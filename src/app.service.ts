import { Injectable } from '@nestjs/common';

export interface ServerTimeResponse {
  serverTime: string;
  isoTime: string;
  timezone: string;
}

@Injectable()
export class AppService {
  getServerTime(): ServerTimeResponse {
    const now = new Date();

    return {
      serverTime: now.toLocaleString('ko-KR', {
        dateStyle: 'full',
        timeStyle: 'medium',
        timeZone: 'Asia/Seoul',
      }),
      isoTime: now.toISOString(),
      timezone: 'Asia/Seoul',
    };
  }
}
