import { VendorCategory, VendorDocument, VendorStatus } from '../schemas/vendor.schema';

export class VendorResponseDto {
  id?: string;
  name!: string;
  category!: VendorCategory;
  phone!: string;
  location!: string;
  thumbnail?: string;
  status!: VendorStatus;
  createdAt?: Date;
  updatedAt?: Date;

  static fromDocument(vendor: VendorDocument): VendorResponseDto {
    const doc = vendor as unknown as { createdAt: Date; updatedAt: Date };
    return {
      id: vendor._id.toString(),
      name: vendor.name,
      category: vendor.category,
      phone: vendor.phone,
      location: vendor.location,
      thumbnail: vendor.thumbnail,
      status: vendor.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
