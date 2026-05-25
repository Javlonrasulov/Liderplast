type PdfOutput = {
  download: (filename?: string) => Promise<void>;
  getBlob: () => Promise<Blob>;
};

type PdfMakeClient = {
  createPdf: (docDefinition: object) => PdfOutput;
};

let pdfMakeReady: Promise<PdfMakeClient> | null = null;

async function loadPdfMake(): Promise<PdfMakeClient> {
  if (!pdfMakeReady) {
    pdfMakeReady = (async () => {
      const mod = await import('pdfmake/build/pdfmake.min.js');
      const pdfMake =
        (mod as { default?: PdfMakeClient }).default ?? (mod as unknown as PdfMakeClient);
      await import('pdfmake/build/vfs_fonts.js');
      return pdfMake;
    })();
  }
  return pdfMakeReady;
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** pdfmake orqali PDF yuklab olish (html2canvas ishlatilmaydi) */
export async function downloadPdfDefinition(
  docDefinition: object,
  filename: string,
): Promise<void> {
  const pdfMake = await loadPdfMake();
  const output = pdfMake.createPdf(docDefinition);

  try {
    await output.download(filename);
    return;
  } catch {
    /* file-saver bloklangan bo‘lishi mumkin — blob orqali */
  }

  const blob = await output.getBlob();
  if (!blob || blob.size < 100) {
    throw new Error('PDF yaratib bo‘lmadi');
  }
  triggerBlobDownload(blob, filename);
}
