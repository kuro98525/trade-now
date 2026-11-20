import fs from 'node:fs';
import path from 'node:path';

const SRC = 'D:\\TG AI\\index.html';
const OUTDIR = 'D:\\TG AI\\直接上传';
fs.mkdirSync(OUTDIR, { recursive: true });

let html = fs.readFileSync(SRC, 'utf8');
const before = html.length;

const MIME = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.gif': 'image/gif',
};

let count = 0;
const missing = [];

html = html.replace(/(src|href)="(assets\/[^"]+)"/g, (m, attr, rel) => {
  const p = path.join('D:\\TG AI', rel);
  if (!fs.existsSync(p)) { missing.push(rel); return m; }
  const ext = path.extname(p).toLowerCase();
  const mime = MIME[ext] || 'application/octet-stream';
  const b64 = fs.readFileSync(p).toString('base64');
  count++;
  return `${attr}="data:${mime};base64,${b64}"`;
});

// 兜底：任何残留的 assets/ 引用（css url() 等）报告出来
const leftover = [...html.matchAll(/assets\/[A-Za-z0-9._\/-]+/g)].map(m => m[0]);

fs.writeFileSync(path.join(OUTDIR, 'index.html'), html, 'utf8');

console.log('内联资源:', count, '个');
console.log('缺失:', missing.length ? missing : '无');
console.log('残留 assets/ 引用:', leftover.length ? [...new Set(leftover)] : '无');
console.log('字节:', before, '→', html.length);
