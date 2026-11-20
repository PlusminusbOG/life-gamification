import 'fake-indexeddb/auto';

// Polyfill `self` for dexie-export-import in Node.js test environment
if (typeof self === 'undefined') {
  (globalThis as unknown as { self: unknown }).self = globalThis;
}

// Polyfill `FileReader` for dexie-export-import in Node.js test environment
if (typeof FileReader === 'undefined') {
  class NodeFileReader {
    result: string | ArrayBuffer | null = null;
    error: Error | null = null;
    onload: ((event: { target: NodeFileReader }) => void) | null = null;
    onerror: ((event: { target: NodeFileReader }) => void) | null = null;
    onabort: ((event: { target: NodeFileReader }) => void) | null = null;

    readAsArrayBuffer(blob: Blob) {
      blob.arrayBuffer().then(
        (buf) => {
          this.result = buf;
          this.onload?.({ target: this });
        },
        (err) => {
          this.error = err;
          this.onerror?.({ target: this });
        }
      );
    }

    readAsText(blob: Blob) {
      blob.text().then(
        (txt) => {
          this.result = txt;
          this.onload?.({ target: this });
        },
        (err) => {
          this.error = err;
          this.onerror?.({ target: this });
        }
      );
    }
  }
  (globalThis as unknown as { FileReader: unknown }).FileReader = NodeFileReader;
}
