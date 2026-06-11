import { Module } from '@nestjs/common';
import { InventoryDocumentsController } from './inventory-documents.controller.js';
import { InventoryDocumentsService } from './inventory-documents.service.js';

@Module({
  controllers: [InventoryDocumentsController],
  providers: [InventoryDocumentsService],
  exports: [InventoryDocumentsService],
})
export class InventoryDocumentsModule {}
