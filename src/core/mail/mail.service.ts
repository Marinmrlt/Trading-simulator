import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { IMailOptions, ISmtpConfig } from './mail.interface';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger(MailService.name);
    private readonly fromEmail: string;

    constructor(private readonly configService: ConfigService) {
        const smtpConfig: ISmtpConfig = {
            host: this.configService.get<string>('MAIL_HOST', 'localhost'),
            port: this.configService.get<number>('MAIL_PORT', 587),
            secure: this.configService.get<string>('MAIL_SECURE', 'false') === 'true',
            auth: {
                user: this.configService.get<string>('MAIL_USER', ''),
                pass: this.configService.get<string>('MAIL_PASSWORD', ''),
            },
            from: this.configService.get<string>('MAIL_FROM', '"No Reply" <noreply@example.com>'),
        };

        this.fromEmail = smtpConfig.from;

        this.transporter = nodemailer.createTransport({
            host: smtpConfig.host,
            port: smtpConfig.port,
            secure: smtpConfig.secure,
            auth: {
                user: smtpConfig.auth.user,
                pass: smtpConfig.auth.pass,
            },
        });
    }

    async sendMail(options: IMailOptions): Promise<void> {
        try {
            const info = await this.transporter.sendMail({
                from: options.from || this.fromEmail,
                to: options.to,
                subject: options.subject,
                text: options.text,
                html: options.html,
            });
            this.logger.log(`Message sent: ${info.messageId}`);
        } catch (error: any) {
            this.logger.error(`Error sending email: ${error.message}`, error.stack);
            throw error;
        }
    }
}
