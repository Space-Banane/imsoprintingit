import html2canvas from "html2canvas-pro";

interface GenerateOptions {
  scale?: number;
}

export async function generateCardPng(element: HTMLElement, options: GenerateOptions = {}): Promise<Blob> {
  const { scale = 1 } = options;
  const canvas = await html2canvas(element, { backgroundColor: null, scale });
  return new Promise((resolve) => {
    canvas.toBlob((blob: Blob | null) => {
      if (blob) resolve(blob);
    }, "image/png");
  });
}
