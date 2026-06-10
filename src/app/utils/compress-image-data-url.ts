function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Rasmni serverga yuborishdan oldin siqish (base64 hajmini kamaytiradi) */
export async function compressImageFileToDataUrl(
  file: File,
  maxWidth = 1280,
  maxHeight = 1280,
  quality = 0.82,
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    return readFileAsDataUrl(file);
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxWidth / bitmap.width, maxHeight / bitmap.height);
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      bitmap.close();
      return readFileAsDataUrl(file);
    }
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    return canvas.toDataURL('image/jpeg', quality);
  } catch {
    return readFileAsDataUrl(file);
  }
}
