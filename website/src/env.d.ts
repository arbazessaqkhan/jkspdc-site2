/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly BACKEND_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const process: {
  readonly env?: Record<string, string | undefined>;
};

declare namespace App {
  interface Locals {
    user?: {
      userId: string;
      email: string;
      name: string;
      role: string;
    };
  }
}
