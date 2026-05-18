import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const apiBaseUrl = process.env.API_BASE_INTERNAL_URL || process.env.API_BASE_URL || 'http://backend:8000';
const normalizedBaseUrl = apiBaseUrl.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');

execSync(
  `pnpm openapi-typescript ${normalizedBaseUrl}/openapi.json -o app/shared/types/schema.ts`,
  { stdio: 'inherit', cwd: root }
);
