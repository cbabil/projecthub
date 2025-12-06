import { PreloadApi } from '@preload/api';

declare global {
  interface Window {
    projecthub: PreloadApi;
  }
}

export {};
