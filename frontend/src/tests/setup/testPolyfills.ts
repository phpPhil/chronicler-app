// Test polyfills for frontend testing environment
// Ensures consistent behavior across different test environments

// File API polyfills for file upload testing
if (!global.File) {
  global.File = class File {
    name: string;
    size: number;
    type: string;
    lastModified: number;
    
    constructor(bits: BlobPart[], filename: string, options: FilePropertyBag = {}) {
      this.name = filename;
      this.type = options.type || '';
      this.lastModified = options.lastModified || Date.now();
      
      // Calculate size from bits
      this.size = bits.reduce((total, bit) => {
        if (typeof bit === 'string') {
          return total + new Blob([bit]).size;
        } else if (bit instanceof ArrayBuffer) {
          return total + bit.byteLength;
        } else {
          return total + (bit as Blob).size;
        }
      }, 0);
    }
    
    slice(start?: number, end?: number, contentType?: string): Blob {
      return new Blob([], { type: contentType });
    }
    
    stream(): ReadableStream {
      return new ReadableStream();
    }
    
    text(): Promise<string> {
      return Promise.resolve('');
    }
    
    arrayBuffer(): Promise<ArrayBuffer> {
      return Promise.resolve(new ArrayBuffer(0));
    }
  } as any;
}

// DataTransfer API for drag and drop testing
if (!global.DataTransfer) {
  global.DataTransfer = class DataTransfer {
    dropEffect: string = 'none';
    effectAllowed: string = 'uninitialized';
    files: FileList = { length: 0, item: () => null, [Symbol.iterator]: function*() {} } as FileList;
    items: DataTransferItemList = {
      length: 0,
      add: () => null as any,
      remove: () => {},
      clear: () => {},
      [Symbol.iterator]: function*() {}
    } as DataTransferItemList;
    types: readonly string[] = [];
    
    clearData(format?: string): void {}
    getData(format: string): string { return ''; }
    setData(format: string, data: string): void {}
    setDragImage(image: Element, x: number, y: number): void {}
  } as any;
}

// URL.createObjectURL polyfill for file preview testing
if (!global.URL || !global.URL.createObjectURL) {
  global.URL = global.URL || {};
  global.URL.createObjectURL = (object: any) => {
    return `blob:${Math.random().toString(36).substring(2)}`;
  };
  global.URL.revokeObjectURL = (url: string) => {};
}

// FileReader polyfill for file content reading
if (!global.FileReader) {
  global.FileReader = class FileReader extends EventTarget {
    error: DOMException | null = null;
    readyState: number = 0;
    result: string | ArrayBuffer | null = null;
    
    EMPTY = 0;
    LOADING = 1;
    DONE = 2;
    
    abort(): void {
      this.readyState = this.DONE;
    }
    
    readAsArrayBuffer(file: Blob): void {
      setTimeout(() => {
        this.readyState = this.DONE;
        this.result = new ArrayBuffer(0);
        this.dispatchEvent(new Event('load'));
      }, 0);
    }
    
    readAsBinaryString(file: Blob): void {
      setTimeout(() => {
        this.readyState = this.DONE;
        this.result = '';
        this.dispatchEvent(new Event('load'));
      }, 0);
    }
    
    readAsDataURL(file: Blob): void {
      setTimeout(() => {
        this.readyState = this.DONE;
        this.result = 'data:text/plain;base64,';
        this.dispatchEvent(new Event('load'));
      }, 0);
    }
    
    readAsText(file: Blob, encoding?: string): void {
      setTimeout(() => {
        this.readyState = this.DONE;
        this.result = 'mock file content';
        this.dispatchEvent(new Event('load'));
      }, 0);
    }
    
    // Event handler properties
    onabort: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
    onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
    onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
    onloadend: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
    onloadstart: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
    onprogress: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  } as any;
}

// Intersection Observer polyfill for component visibility testing
if (!global.IntersectionObserver) {
  global.IntersectionObserver = class IntersectionObserver {
    root: Element | Document | null = null;
    rootMargin: string = '0px';
    thresholds: ReadonlyArray<number> = [0];
    
    constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
      this.root = options?.root || null;
      this.rootMargin = options?.rootMargin || '0px';
      this.thresholds = options?.threshold ? [options.threshold].flat() : [0];
    }
    
    disconnect(): void {}
    observe(target: Element): void {}
    unobserve(target: Element): void {}
    takeRecords(): IntersectionObserverEntry[] { return []; }
  } as any;
}

// ResizeObserver polyfill for responsive component testing
if (!global.ResizeObserver) {
  global.ResizeObserver = class ResizeObserver {
    callback: ResizeObserverCallback;
    
    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }
    
    disconnect(): void {}
    observe(target: Element, options?: ResizeObserverOptions): void {}
    unobserve(target: Element): void {}
  } as any;
}

// MutationObserver polyfill for DOM change testing
if (!global.MutationObserver) {
  global.MutationObserver = class MutationObserver {
    callback: MutationCallback;
    
    constructor(callback: MutationCallback) {
      this.callback = callback;
    }
    
    disconnect(): void {}
    observe(target: Node, options?: MutationObserverInit): void {}
    takeRecords(): MutationRecord[] { return []; }
  } as any;
}

// Performance API polyfills for performance testing
if (!global.performance) {
  global.performance = {
    now: () => Date.now(),
    mark: () => {},
    measure: () => {},
    clearMarks: () => {},
    clearMeasures: () => {},
    getEntries: () => [],
    getEntriesByName: () => [],
    getEntriesByType: () => [],
    timing: {},
    navigation: {},
    memory: {
      usedJSHeapSize: 1000000,
      totalJSHeapSize: 2000000,
      jsHeapSizeLimit: 10000000
    }
  } as any;
}

// matchMedia polyfill for responsive design testing
if (!global.matchMedia) {
  global.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  });
}

// getComputedStyle polyfill for style testing
if (!global.getComputedStyle) {
  global.getComputedStyle = (element: Element) => ({
    getPropertyValue: (prop: string) => '',
    setProperty: () => {},
    removeProperty: () => '',
    item: () => '',
    length: 0,
    [Symbol.iterator]: function*() {}
  } as any);
}

// Canvas API polyfill for visual component testing
if (!global.HTMLCanvasElement) {
  global.HTMLCanvasElement = class HTMLCanvasElement {
    getContext(): any {
      return {
        fillRect: () => {},
        clearRect: () => {},
        getImageData: () => ({ data: new Array(4) }),
        putImageData: () => {},
        createImageData: () => ({ data: new Array(4) }),
        setTransform: () => {},
        drawImage: () => {},
        save: () => {},
        fillText: () => {},
        restore: () => {},
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        closePath: () => {},
        stroke: () => {},
        translate: () => {},
        scale: () => {},
        rotate: () => {},
        arc: () => {},
        fill: () => {},
        measureText: () => ({ width: 0 }),
        transform: () => {},
        rect: () => {},
        clip: () => {}
      };
    }
    
    toDataURL(): string {
      return 'data:image/png;base64,mock';
    }
    
    getBoundingClientRect(): DOMRect {
      return {
        x: 0, y: 0, width: 0, height: 0,
        top: 0, right: 0, bottom: 0, left: 0,
        toJSON: () => ({})
      };
    }
  } as any;
}

// Request Animation Frame polyfill for animation testing
if (!global.requestAnimationFrame) {
  global.requestAnimationFrame = (callback: FrameRequestCallback) => {
    return setTimeout(() => callback(Date.now()), 16) as any;
  };
}

if (!global.cancelAnimationFrame) {
  global.cancelAnimationFrame = (id: number) => {
    clearTimeout(id as any);
  };
}

// Fetch polyfill for API testing (if not provided by jest environment)
if (!global.fetch) {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
      blob: () => Promise.resolve(new Blob()),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      formData: () => Promise.resolve(new FormData()),
      headers: new Map() as any,
      redirected: false,
      statusText: 'OK',
      type: 'basic' as ResponseType,
      url: '',
      clone: function() { return this; },
      body: null,
      bodyUsed: false
    } as unknown as Response)
  ) as jest.Mock;
}

// CustomEvent polyfill for event testing
if (!global.CustomEvent) {
  global.CustomEvent = class CustomEvent extends Event {
    detail: any;
    
    constructor(type: string, eventInitDict?: CustomEventInit) {
      super(type, eventInitDict);
      this.detail = eventInitDict?.detail;
    }
  } as any;
}

// Clipboard API polyfill for copy/paste testing
if (!navigator.clipboard) {
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: jest.fn(() => Promise.resolve()),
      readText: jest.fn(() => Promise.resolve('mock clipboard text')),
      write: jest.fn(() => Promise.resolve()),
      read: jest.fn(() => Promise.resolve([]))
    },
    writable: true
  });
}

// Web Crypto API polyfill for security testing
if (!global.crypto) {
  global.crypto = {
    getRandomValues: (array: any) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    },
    randomUUID: () => '12345678-1234-1234-1234-123456789012',
    subtle: {
      encrypt: jest.fn(() => Promise.resolve(new ArrayBuffer(0))),
      decrypt: jest.fn(() => Promise.resolve(new ArrayBuffer(0))),
      sign: jest.fn(() => Promise.resolve(new ArrayBuffer(0))),
      verify: jest.fn(() => Promise.resolve(true)),
      digest: jest.fn(() => Promise.resolve(new ArrayBuffer(0))),
      generateKey: jest.fn(() => Promise.resolve({})),
      deriveKey: jest.fn(() => Promise.resolve({})),
      deriveBits: jest.fn(() => Promise.resolve(new ArrayBuffer(0))),
      importKey: jest.fn(() => Promise.resolve({})),
      exportKey: jest.fn(() => Promise.resolve(new ArrayBuffer(0))),
      wrapKey: jest.fn(() => Promise.resolve(new ArrayBuffer(0))),
      unwrapKey: jest.fn(() => Promise.resolve({}))
    }
  } as any;
}

// Console polyfill for test environments that might not have full console
if (!global.console) {
  global.console = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
    table: jest.fn(),
    time: jest.fn(),
    timeEnd: jest.fn(),
    group: jest.fn(),
    groupEnd: jest.fn(),
    clear: jest.fn(),
    count: jest.fn(),
    countReset: jest.fn(),
    assert: jest.fn(),
    dir: jest.fn(),
    dirxml: jest.fn(),
    groupCollapsed: jest.fn(),
    profile: jest.fn(),
    profileEnd: jest.fn(),
    timeLog: jest.fn(),
    timeStamp: jest.fn()
  } as any;
}

// Export for module usage
export {};