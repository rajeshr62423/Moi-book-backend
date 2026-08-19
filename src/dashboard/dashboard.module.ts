import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Event, EventSchema } from '../event/schemas/event.schema';
import { Guest, GuestSchema } from '../guest/schemas/guest.schema';
import { Vendor, VendorSchema } from '../vendor/schemas/vendor.schema';
import { Moi, MoiSchema } from '../moi/schemas/moi.schema';
import { Ledger, LedgerSchema } from '../ledger/schemas/ledger.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: Guest.name, schema: GuestSchema },
      { name: Vendor.name, schema: VendorSchema },
      { name: Moi.name, schema: MoiSchema },
      { name: Ledger.name, schema: LedgerSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
