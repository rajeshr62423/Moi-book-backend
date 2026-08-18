import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MoiController } from './moi.controller';
import { MoiService } from './moi.service';
import { Moi, MoiSchema } from './schemas/moi.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Moi.name, schema: MoiSchema }])],
  controllers: [MoiController],
  providers: [MoiService],
})
export class MoiModule {}
