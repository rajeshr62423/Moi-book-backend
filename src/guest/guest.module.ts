import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GuestService } from './guest.service';
import { GuestController } from './guest.controller';
import { Guest, GuestSchema } from './schemas/guest.schema';
import { Event, EventSchema } from '../event/schemas/event.schema';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Guest.name, schema: GuestSchema },
      { name: Event.name, schema: EventSchema },
    ]),
    NotificationModule,
  ],
  providers: [GuestService],
  controllers: [GuestController],
})
export class GuestModule {}
