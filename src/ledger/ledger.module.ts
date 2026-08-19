import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LedgerController } from './ledger.controller';
import { LedgerService } from './ledger.service';
import { Ledger, LedgerSchema } from './schemas/ledger.schema';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Ledger.name, schema: LedgerSchema }]),
    NotificationModule,
  ],
  controllers: [LedgerController],
  providers: [LedgerService],
})
export class LedgerModule {}
