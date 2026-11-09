// Shared paths and a tiny static server for the Playwright tests.
// Run tests from anywhere:  node tests/full.js   (build first: python tools/build_all.py)
const path = require('path'), fs = require('fs'), http = require('http'), { pathToFileURL } = require('url');

const ROOT = path.resolve(__dirname, '..');
// Standalone copy inside the VR site (apex-vr-lab/tools/): serve the VR site itself, iwer.min.js next to this file.
const STANDALONE = !fs.existsSync(path.join(ROOT, 'tools', 'paths.py'));
const DIST_WEB = path.join(ROOT, 'dist', 'website');
const DIST_VR = STANDALONE ? ROOT : path.join(ROOT, 'dist', 'vr');
const WEB = pathToFileURL(DIST_WEB).href;                                   // file:///…/dist/website
const SINGLE = pathToFileURL(path.join(ROOT, 'dist', 'single', 'APEX-Hydraulics-Lab.html')).href;
const VENDOR = STANDALONE ? __dirname : path.join(ROOT, 'vendor');
const OUT = path.join(__dirname, 'out');                                    // screenshots / json results
fs.mkdirSync(OUT, { recursive: true });

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.css': 'text/css', '.png': 'image/png', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.svg': 'image/svg+xml' };

// Serve `dir` on http://localhost:port (the VR page needs http, not file://). Does not keep node alive.
function serve(dir = DIST_VR, port = 8765) {
  return new Promise((resolve, reject) => {
    const s = http.createServer((q, r) => {
      let u = decodeURIComponent(q.url.split('?')[0]); if (u.endsWith('/')) u += 'index.html';
      const f = path.join(dir, u);
      if (!f.startsWith(dir) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
      r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
      fs.createReadStream(f).pipe(r);
    });
    s.on('error', reject); s.listen(port, () => { s.unref(); resolve(s); });
  });
}

module.exports = { ROOT, DIST_WEB, DIST_VR, WEB, SINGLE, VENDOR, OUT, serve };
