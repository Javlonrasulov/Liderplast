import { Module } from '@nestjs/common';
import { RealtimeGateway } from '../../socket/realtime.gateway.js';
import { FileUploadController } from './file-upload.controller.js';
import { FileUploadService } from './file-upload.service.js';

@Module({
  controllers: [FileUploadController],
  providers: [FileUploadService, RealtimeGateway],
})
export class FileUploadModule {}
