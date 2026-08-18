import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TemplateDocument = HydratedDocument<Template>;

@Schema({ timestamps: true })
export class Template {
  // Templates are private to whoever created them.
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true })
  subject!: string;

  // Free-text body supporting {{guestName}} / {{eventName}} / {{hostName}}
  // style placeholders, expanded by the caller when the invite is sent.
  @Prop({ required: true })
  body!: string;

  @Prop({ default: false })
  isDefault!: boolean;
}

export const TemplateSchema = SchemaFactory.createForClass(Template);
