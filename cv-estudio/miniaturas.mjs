// Genera las miniaturas de la galería del estudio de CV (public/cv/estudio/miniaturas/)
// con el propio motor y el CV de ejemplo: así la galería pinta al momento sin cargar el
// motor y las miniaturas son exactamente lo que el cliente va a obtener.
// Uso: npm run construir && npm run miniaturas
// Navegador: el Chromium de Playwright; si no está, Edge (CHROMIUM=ruta para forzar uno).
import { createServer } from 'node:http';
import { mkdirSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const publico = fileURLToPath(new URL('../public/', import.meta.url));
const salida = path.join(publico, 'cv/estudio/miniaturas');
const ANCHO = 480; // 2x del ancho de la tarjeta en la galería

// Muestra de la plantilla personalizable: una base con formas, sombreado y color propio.
const PERSONALIZABLE = { plantilla: 'onyx', color: '#b34a28', decoracion: { forma: 'burbujas', color: '#b34a28', color2: '#e0a526', intensidad: 0.8, posicion: 'ambas', sombreado: 'cabecera', fondo: 'papel' } };

const tipos = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.woff': 'font/woff', '.woff2': 'font/woff2' };
const srv = createServer((req, res) => {
  const ruta = decodeURIComponent((req.url ?? '/').split('?')[0]);
  if (ruta === '/') {
    res.writeHead(200, { 'content-type': 'text/html' });
    return res.end('<!doctype html><meta charset=utf-8><div id=v></div><script type=module src="/cv/estudio/motor/estudio.js"></script>');
  }
  try {
    const fichero = path.join(publico, path.normalize(ruta).replace(/^[\\/]+/, ''));
    if (!fichero.startsWith(publico)) throw new Error('fuera');
    res.writeHead(200, { 'content-type': tipos[path.extname(ruta)] ?? 'application/octet-stream' });
    res.end(readFileSync(fichero));
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${srv.address().port}/`;

async function abrir() {
  if (process.env.CHROMIUM) return chromium.launch({ executablePath: process.env.CHROMIUM });
  try {
    return await chromium.launch();
  } catch {
    return chromium.launch({ channel: 'msedge' });
  }
}

const nav = await abrir();
try {
  const p = await nav.newPage({ viewport: { width: ANCHO, height: 800 } });
  const errores = [];
  p.on('pageerror', (e) => errores.push(String(e)));
  await p.goto(base);
  await p.waitForFunction(() => window.CvEstudio, null, { timeout: 60000 });
  rmSync(salida, { recursive: true, force: true });
  mkdirSync(salida, { recursive: true });

  const ids = await p.evaluate(() => window.CvEstudio.plantillas.map((t) => t.id));
  const trabajos = [...ids.map((id) => ({ nombre: id, plantilla: id })), { nombre: 'personalizable', ...PERSONALIZABLE }];
  for (const t of trabajos) {
    await p.evaluate(
      async ({ plantilla, color, decoracion, ancho }) => {
        const E = window.CvEstudio;
        const blob = await E.crearPdf({ datos: E.datosEjemplo(plantilla), plantilla, color, decoracion, marcaAgua: null });
        await E.pintarPdf(blob, document.getElementById('v'), { ancho, maxPaginas: 1 });
      },
      { ...t, ancho: ANCHO },
    );
    await p.locator('#v canvas').first().screenshot({ path: path.join(salida, `${t.nombre}.jpg`), type: 'jpeg', quality: 80 });
  }
  if (errores.length) throw new Error(`Errores en el navegador:\n${errores.join('\n')}`);
  console.log(`${trabajos.length} miniaturas en public/cv/estudio/miniaturas/`);
} finally {
  await nav.close();
  srv.close();
}
