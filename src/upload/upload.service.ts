import {
  BadGatewayException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

export interface UploadResult {
  url: string;
  publicId: string;
}

/**
 * Shared image upload (event thumbnails, profile photos, etc) via
 * Cloudinary. Config is read once at construction rather than with
 * getOrThrow, so a missing CLOUDINARY_API_SECRET only breaks uploads
 * (a clear 503) instead of failing the whole app's boot.
 */
@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private configured = false;

  constructor(private readonly config: ConfigService) {
    const cloudName = this.config.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.config.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.config.get<string>('CLOUDINARY_API_SECRET');

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
      this.configured = true;
    } else {
      this.logger.warn(
        'CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET are not fully set — image uploads will fail until they are.',
      );
    }
  }

  uploadImage(buffer: Buffer, folder = 'moibook'): Promise<UploadResult> {
    if (!this.configured) {
      throw new ServiceUnavailableException('Image upload is not configured on the server');
    }

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image' },
        (error, result) => {
          if (error || !result) {
            // Cloudinary SDK errors are plain {message, http_code} objects,
            // not Error instances — pull the real reason out instead of
            // masking auth/config mistakes behind a generic message.
            const reason = (error as { message?: string } | undefined)?.message ?? 'unknown error';
            this.logger.error(`Cloudinary upload failed: ${reason}`);
            reject(new BadGatewayException(`Image upload failed: ${reason}`));
            return;
          }
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      );
      stream.end(buffer);
    });
  }
}
