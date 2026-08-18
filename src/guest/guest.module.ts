import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GuestService } from './guest.service';
import { GuestController } from './guest.controller';
import { Guest, GuestSchema } from './schemas/guest.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Guest.name, schema: GuestSchema }])],
  providers: [GuestService],
  controllers: [GuestController],
})
export class GuestModule {}
