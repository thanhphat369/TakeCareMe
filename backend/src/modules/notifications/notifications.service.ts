import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface AlertMessagePayload {
  title: string;
  message: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  elderId: number;
  elderName?: string;
  timestamp?: Date;
  metadata?: Record<string, any>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly http: HttpService) {}

  async sendAllChannels(to: { phone?: string; pushToken?: string; zaloId?: string; email?: string }[], payload: AlertMessagePayload): Promise<void> {
    await Promise.allSettled([
      this.sendSMSBulk(
        to.map(t => t.phone).filter(Boolean) as string[],
        this.buildSmsMessage(payload),
      ),
      this.sendPushBulk(
        to.map(t => t.pushToken).filter(Boolean) as string[],
        payload,
      ),
      this.sendZaloBulk(
        to.map(t => t.zaloId).filter(Boolean) as string[],
        payload,
      ),
    ]);
  }

  private buildSmsMessage(payload: AlertMessagePayload): string {
    const time = payload.timestamp ? new Date(payload.timestamp).toLocaleString('vi-VN') : new Date().toLocaleString('vi-VN');
    const elder = payload.elderName ? ` - ${payload.elderName}` : '';
    return `[TCM] ${payload.severity} cảnh báo${elder}: ${payload.title}. ${payload.message}. ${time}`;
  }

  async sendSMSBulk(phones: string[], message: string): Promise<void> {
    if (!phones.length) return;
    const endpoint = process.env.SMS_API_ENDPOINT;
    const apiKey = process.env.SMS_API_KEY;
    if (!endpoint || !apiKey) {
      this.logger.warn('SMS endpoint or key not configured; skipping SMS.');
      return;
    }
    try {
      await firstValueFrom(
        this.http.post(
          endpoint,
          { phones, message },
          { headers: { Authorization: `Bearer ${apiKey}` } },
        ),
      );
    } catch (err) {
      this.logger.error('Failed to send SMS', err as any);
    }
  }

  async sendPushBulk(tokens: string[], payload: AlertMessagePayload): Promise<void> {
    if (!tokens.length) return;
    const endpoint = process.env.PUSH_API_ENDPOINT;
    const apiKey = process.env.PUSH_API_KEY;
    if (!endpoint || !apiKey) {
      this.logger.warn('Push endpoint or key not configured; skipping push.');
      return;
    }
    try {
      await firstValueFrom(
        this.http.post(
          endpoint,
          { tokens, payload },
          { headers: { Authorization: `Bearer ${apiKey}` } },
        ),
      );
    } catch (err) {
      this.logger.error('Failed to send push', err as any);
    }
  }

  async sendZaloBulk(userIds: string[], payload: AlertMessagePayload): Promise<void> {
    if (!userIds.length) return;
    const endpoint = process.env.ZALO_API_ENDPOINT;
    const apiKey = process.env.ZALO_API_KEY;
    if (!endpoint || !apiKey) {
      this.logger.warn('Zalo endpoint or key not configured; skipping Zalo.');
      return;
    }
    try {
      await firstValueFrom(
        this.http.post(
          endpoint,
          { userIds, payload },
          { headers: { Authorization: `Bearer ${apiKey}` } },
        ),
      );
    } catch (err) {
      this.logger.error('Failed to send Zalo', err as any);
    }
  }
}












