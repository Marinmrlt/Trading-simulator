import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { MailService } from './src/core/mail/mail.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const mailService = app.get(MailService);

    console.log('Sending test email...');
    try {
        await mailService.sendMail({
            to: 'test@example.com',
            subject: 'Test Email from Trading Simulator',
            text: 'This is a test email sent from the Trading Simulator application.',
        });
        console.log('Test email sent successfully!');
    } catch (error) {
        console.error('Failed to send test email:', error);
    }

    await app.close();
}

bootstrap();
