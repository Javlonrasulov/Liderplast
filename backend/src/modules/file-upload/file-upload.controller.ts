import {
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../generated/prisma/enums.js';
import { UploadFileQueryDto } from './dto/upload-file-query.dto.js';
import { FileUploadService } from './file-upload.service.js';

@Controller('files')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('upload')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT, Role.MANAGER)
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('sub') userId?: string,
    @Query() query?: UploadFileQueryDto,
  ) {
    return this.fileUploadService.saveUpload(file, userId, query?.source);
  }

  @Get('uploads')
  @Roles(Role.DIRECTOR, Role.ACCOUNTANT, Role.MANAGER)
  getUploads() {
    return this.fileUploadService.getUploads();
  }
}
