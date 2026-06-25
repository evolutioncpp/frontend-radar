export interface DownloadFileOptions {
  content: BlobPart;
  filename: string;
  mimeType: string;
}

export const downloadFile = ({ content, filename, mimeType }: DownloadFileOptions) => {
  const blob = new Blob([content], {
    type: mimeType,
  });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.download = filename;
  link.href = url;
  link.rel = 'noopener';
  link.style.display = 'none';

  try {
    document.body.append(link);
    link.click();
  } finally {
    link.remove();
    URL.revokeObjectURL(url);
  }
};
