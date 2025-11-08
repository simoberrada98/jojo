import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

// Load environment variables for CLI scripts.
// Priority: .env.local (if present) then .env
function load(filePath: string) {
  try {
    if (fs.existsSync(filePath)) {
      dotenv.config({ path: filePath });
    }
  } catch {
    // ignore file system errors; scripts can still rely on existing process.env
  }
}

const root = process.cwd();
load(path.join(root, '.env.local'));
load(path.join(root, '.env'));
