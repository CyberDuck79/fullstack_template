import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import * as Mail from 'nodemailer/lib/mailer';
import { ConfigService } from '@nestjs/config';
 
@Injectable()
export default class EmailService {
  private nodemailerTransport: Mail;
 
  constructor(
    private readonly configService: ConfigService
  ) {
    this.nodemailerTransport = createTransport({
      host: configService.get('SMTP_HOST'),
      port: configService.get('SMTP_PORT'),
      secure: false,
      auth: {
        user: configService.get('SMTP_USER'),
        pass: configService.get('SMTP_PASSWORD'),
      }
    });
  }
 
  sendMail(options: Mail.Options) {
    return this.nodemailerTransport.sendMail({
      ...options,
      from: this.configService.get('SMTP_SENDER')
    });
  }
}