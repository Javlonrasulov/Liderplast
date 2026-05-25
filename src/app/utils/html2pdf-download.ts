type Html2PdfWorker = {
  set: (options: object) => Html2PdfWorker;
  from: (element: HTMLElement) => Html2PdfWorker;
  outputPdf: (type?: string) => Promise<Blob | unknown>;
  save: () => Promise<void>;
};

type Html2PdfFactory = () => Html2PdfWorker;

/** html2canvas uchun element ko‘rinadigan bo‘lishi kerak (left:-9999px ishlamaydi) */
export function createOffscreenPdfHost(innerHtml: string): HTMLDivElement {
  const host = document.createElement('div');
  host.setAttribute('aria-hidden', 'true');
  host.style.cssText = [
    'position:fixed',
    'left:0',
    'top:0',
    'width:210mm',
    'min-height:297mm',
    'background:#fff',
    'color:#000',
    'z-index:2147483646',
    'opacity:0.01',
    'pointer-events:none',
    'overflow:visible',
  ].join(';');
  host.innerHTML = innerHtml;
  document.body.appendChild(host);
  return host;
}

function waitForPaint(ms = 400): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(resolve, ms);
      });
    });
  });
}

async function loadHtml2Pdf(): Promise<Html2PdfFactory> {
  const mod = await import('html2pdf.js');
  const fn = (mod as { default?: Html2PdfFactory }).default ?? (mod as Html2PdfFactory);
  if (typeof fn !== 'function') {
    throw new Error('html2pdf.js moduli yuklanmadi');
  }
  return fn;
}

function pdfOptions(filename: string) {
  return {
    margin: [8, 8, 8, 8] as [number, number, number, number],
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  };
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

/** DOM elementdan PDF fayl yuklab olish */
export async function downloadElementAsPdf(
  root: HTMLElement,
  filename: string,
): Promise<void> {
  await waitForPaint();

  const html2pdf = await loadHtml2Pdf();
  const opts = pdfOptions(filename);

  try {
    const result = await html2pdf().set(opts).from(root).outputPdf('blob');
    if (result instanceof Blob && result.size > 100) {
      triggerBlobDownload(result, filename);
      return;
    }
  } catch {
    /* yangi worker bilan save */
  }

  try {
    await html2pdf().set(opts).from(root).save();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(msg || 'PDF yaratib bo‘lmadi');
  }
}
