import fs from 'fs';
import path from 'path';

const STORE_PATH = path.resolve('./domain_store.json');

export function getStoredDomain() {
  if (!fs.existsSync(STORE_PATH)) return null;
  const data = JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
  return data.domain_name || null;
}

export function setStoredDomain(domain) {
  fs.writeFileSync(
    STORE_PATH,
    JSON.stringify({ domain_name: domain }, null, 2)
  );
}