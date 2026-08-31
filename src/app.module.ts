import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WellKnownController } from './well-known/well-known.controller';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { GuestModule } from './guest/guest.module';
import { EventModule } from './event/event.module';
import { VendorModule } from './vendor/vendor.module';
import { MoiModule } from './moi/moi.module';
import { LedgerModule } from './ledger/ledger.module';
import { LanguageConfigurationModule } from './language-configuration/language-configuration.module';
import { NotificationModule } from './notification/notification.module';
import { SettingsModule } from './settings/settings.module';
import { SearchModule } from './search/search.module';
import { TemplateModule } from './template/template.module';
import { MailModule } from './mail/mail.module';
import { UploadModule } from './upload/upload.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    UserModule,
    GuestModule,
    EventModule,
    VendorModule,
    MoiModule,
    LedgerModule,
    LanguageConfigurationModule,
    NotificationModule,
    SettingsModule,
    SearchModule,
    TemplateModule,
    MailModule,
    UploadModule,
    DashboardModule,
  ],
  controllers: [AppController, WellKnownController],
  providers: [AppService],
})
export class AppModule {}
