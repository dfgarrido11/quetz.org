// Type definitions for Google Analytics gtag.js

interface GtagEventParams {
  event_category?: string;
  event_label?: string;
  value?: number;
  [key: string]: unknown;
}

interface GtagConfigParams {
  page_path?: string;
  page_title?: string;
  send_page_view?: boolean;
  [key: string]: unknown;
}

interface Gtag {
  (command: 'config', targetId: string, config?: GtagConfigParams): void;
  (command: 'event', eventName: string, eventParams?: GtagEventParams): void;
  (command: 'js', date: Date): void;
  (command: string, ...args: unknown[]): void;
}

declare global {
  interface Window {
    gtag: Gtag;
    dataLayer: unknown[];
  }
}

export {};
