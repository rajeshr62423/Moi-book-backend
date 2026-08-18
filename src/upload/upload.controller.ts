import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiMessage } from '../common/decorators/api-message.decorator';
import { UploadService } from './upload.service';
import { UploadResponseDto } from './dto/upload-response.dto';

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB

/** Generic image upload, reused by any feature that needs one (event thumbnails, profile photos, ...). */
@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @ApiMessage('File uploaded successfully')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_BYTES },
    }),
  )
  async upload(@UploadedFile() file?: Express.Multer.File): Promise<UploadResponseDto> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed');
    }
    return this.uploadService.uploadImage(file.buffer);
  }
}
