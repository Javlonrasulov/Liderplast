import { Injectable } from '@nestjs/common';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { PrismaService } from '../../prisma/prisma.service.js';
import { UploadStatus } from '../../generated/prisma/enums.js';
import { RealtimeGateway } from '../../socket/realtime.gateway.js';

@Injectable()
export class FileUploadService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async saveUpload(
    file: Express.Multer.File,
    uploadedById?: string,
    source?: string,
  ) {
    const uploadsDir = process.env.UPLOADS_DIR ?? 'uploads';
    await fs.mkdir(uploadsDir, { recursive: true });

    const fileName = `${Date.now()}-${file.originalname}`;
    const storagePath = join(uploadsDir, fileName);
    await fs.writeFile(storagePath, file.buffer);

    const savedFile = await this.prisma.uploadedFile.create({
      data: {
        originalName: file.originalname,
        fileName,
        mimeType: file.mimetype,
        size: file.size,
        storagePath,
        uploadedById,
        status: UploadStatus.PROCESSING,
      },
    });

    const job = await this.prisma.uploadJob.create({
      data: {
        uploadedFileId: savedFile.id,
        status: UploadStatus.PROCESSING,
        message: `Uploaded for ${source ?? 'generic'} import pipeline`,
        parsedRows: 0,
      },
    });

    const completedFile = await this.prisma.uploadedFile.update({
      where: { id: savedFile.id },
      data: {
        status: UploadStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    const completedJob = await this.prisma.uploadJob.update({
      where: { id: job.id },
      data: {
        status: UploadStatus.COMPLETED,
        completedAt: new Date(),
        message: 'Upload stored successfully. Parsing skeleton completed.',
      },
    });

    const payload = { file: completedFile, job: completedJob };
    this.realtimeGateway.emitUploadUpdated(payload);
    return payload;
  }

  getUploads() {
    return this.prisma.uploadedFile.findMany({
      include: {
        jobs: true,
        uploadedBy: {
          omit: { passwordHash: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
