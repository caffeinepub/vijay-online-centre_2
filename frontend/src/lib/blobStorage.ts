// Blob storage utility for handling file uploads and URL generation
export class ExternalBlob {
  private bytes?: Uint8Array<ArrayBuffer>;
  private url?: string;
  private progressCallback?: (percentage: number) => void;

  private constructor() {}

  static fromBytes(bytes: Uint8Array): ExternalBlob {
    const blob = new ExternalBlob();
    // Cast through unknown to handle ArrayBufferLike (which may be SharedArrayBuffer)
    const buffer = bytes.buffer instanceof ArrayBuffer
      ? bytes.buffer
      : (bytes.buffer.slice(0) as unknown as ArrayBuffer);
    blob.bytes = new Uint8Array(buffer) as Uint8Array<ArrayBuffer>;
    return blob;
  }

  static fromURL(url: string): ExternalBlob {
    const blob = new ExternalBlob();
    blob.url = url;
    return blob;
  }

  withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob {
    this.progressCallback = onProgress;
    return this;
  }

  getDirectURL(): string {
    if (this.url) return this.url;
    if (this.bytes) {
      const buffer: ArrayBuffer = this.bytes.buffer as ArrayBuffer;
      const blob = new Blob([buffer]);
      return URL.createObjectURL(blob);
    }
    return '';
  }

  async getBytes(): Promise<Uint8Array<ArrayBuffer>> {
    if (this.bytes) return this.bytes;
    if (this.url) {
      const response = await fetch(this.url);
      const buffer = await response.arrayBuffer();
      return new Uint8Array(buffer) as Uint8Array<ArrayBuffer>;
    }
    return new Uint8Array(new ArrayBuffer(0)) as Uint8Array<ArrayBuffer>;
  }
}
