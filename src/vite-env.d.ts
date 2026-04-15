/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MACHINES_CRM_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
