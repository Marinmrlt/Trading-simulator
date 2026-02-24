import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './mail.service';

@Global() // Making it global so we don't need to import it in every feature module
@Module({
    imports: [ConfigModule],
    providers: [MailService],
    exports: [MailService],
})
export class MailModule { }
