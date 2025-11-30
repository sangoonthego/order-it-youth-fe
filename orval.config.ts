import { defineConfig } from 'orval';
import { config as loadEnv } from 'dotenv';

loadEnv();

const DEFAULT_BACKEND_URL = 'http://localhost:4000';
const DEFAULT_OPENAPI_URL = `${DEFAULT_BACKEND_URL}/docs-json`;

const backendBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_BACKEND_URL;
const openapiUrl = process.env.ORVAL_OPENAPI_URL ?? DEFAULT_OPENAPI_URL;

export default defineConfig({
  orderItYouthApi: {
    input: {
      target: openapiUrl,
    },
    output: {
      target: './lib/api/generated/endpoints',
      schemas: './lib/api/generated/models',
      mode: 'split',
      baseUrl: backendBaseUrl,
      client: 'fetch',
      httpClient: 'fetch',
      clean: true,
      prettier: true,
      tsconfig: './tsconfig.json',
    },
  },
});
