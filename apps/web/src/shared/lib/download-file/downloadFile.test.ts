import { afterEach, describe, expect, test, vi } from 'vitest';

import { downloadFile } from './downloadFile';

describe('downloadFile', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  test('downloads content with filename and mime type', async () => {
    const createObjectUrlSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:report');
    const revokeObjectUrlSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);
    const removeSpy = vi.spyOn(HTMLAnchorElement.prototype, 'remove').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      this.parentElement?.removeChild(this);
    });

    downloadFile({
      content: '# Report',
      filename: 'frontend-radar-report.md',
      mimeType: 'text/markdown;charset=utf-8',
    });

    const blob = createObjectUrlSpy.mock.calls[0]?.[0];
    const link = clickSpy.mock.contexts[0];

    expect(blob).toBeInstanceOf(Blob);
    expect(link).toBeInstanceOf(HTMLAnchorElement);
    if (!(blob instanceof Blob) || !(link instanceof HTMLAnchorElement)) {
      throw new Error('Expected download link and blob to be created');
    }

    expect(blob.type).toBe('text/markdown;charset=utf-8');
    await expect(blob.text()).resolves.toBe('# Report');
    expect(link).toMatchObject({
      download: 'frontend-radar-report.md',
      href: 'blob:report',
      rel: 'noopener',
    });
    expect(link.style.display).toBe('none');
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(removeSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectUrlSpy).toHaveBeenCalledWith('blob:report');
  });

  test('cleans up object url and temporary link when click fails', () => {
    const createObjectUrlSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:report');
    const revokeObjectUrlSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const clickError = new Error('Download click failed');

    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {
      throw clickError;
    });

    const removeSpy = vi.spyOn(HTMLAnchorElement.prototype, 'remove').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      this.parentElement?.removeChild(this);
    });

    expect(() =>
      downloadFile({
        content: '# Report',
        filename: 'frontend-radar-report.md',
        mimeType: 'text/markdown;charset=utf-8',
      }),
    ).toThrow(clickError);

    expect(createObjectUrlSpy).toHaveBeenCalledTimes(1);
    expect(removeSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectUrlSpy).toHaveBeenCalledWith('blob:report');
    expect(document.body.childElementCount).toBe(0);
  });
});
