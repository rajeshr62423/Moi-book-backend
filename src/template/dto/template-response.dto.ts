import { TemplateDocument } from '../schemas/template.schema';

export class TemplateResponseDto {
  id?: string;
  name!: string;
  subject!: string;
  body!: string;
  isDefault?: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  static fromDocument(template: TemplateDocument): TemplateResponseDto {
    const doc = template as unknown as { createdAt: Date; updatedAt: Date };
    return {
      id: template._id.toString(),
      name: template.name,
      subject: template.subject,
      body: template.body,
      isDefault: template.isDefault,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
