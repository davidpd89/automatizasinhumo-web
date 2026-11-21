/**
 * Tarjeta digital publicada por el cliente desde el estudio del CV, en /c/<slug>.
 * Aquí solo lo propio de la tarjeta (validación y vCard); la publicación y la dirección
 * son las comunes a todas las páginas publicadas (paginas.ts).
 */
import {
  EMAIL,
  SLUG_PAGINA_VALIDO,
  TELEFONO,
  paginaDePedido,
  paginaPorSlug,
  publicarPagina,
  slugBase as slugComun,
  texto,
  urlSegura,
} from './paginas';
import { LIMITES_TARJETA, MODELO_TARJETA_POR_DEFECTO, esModeloTarjeta, type ModeloTarjeta } from './modelosTarjeta';

export { urlSegura };

export interface EnlaceTarjeta {
  etiqueta: string;
  url: string;
}
export interface DatosTarjeta {
  nombre: string;
  cargo: string;
  email: string;
  telefono: string;
  web: string;
  ubicacion: string;
  resumen: string;
  enlaces: EnlaceTarjeta[];
  /** Color de acento #rrggbb (el del diseño elegido en el estudio). */
  color: string;
  /** Aspecto de la tarjeta (modelosTarjeta.ts). */
  modelo: ModeloTarjeta;
  /** Si la tarjeta muestra el QR para compartirla. */
  qr: boolean;
}

export const COLOR_POR_DEFECTO = '#2563eb';
const MAX_ENLACES = 6;

export type ResultadoTarjeta = { ok: true; datos: DatosTarjeta } | { ok: false; error: string };

export function validarTarjeta(x: unknown): ResultadoTarjeta {
  if (!x || typeof x !== 'object') return { ok: false, error: 'datos' };
  const o = x as Record<string, unknown>;
  const nombre = texto(o.nombre, LIMITES_TARJETA.nombre);
  if (!nombre) return { ok: false, error: 'nombre' };
  const email = texto(o.email, 254);
  if (email && !EMAIL.test(email)) return { ok: false, error: 'email' };
  const telefono = texto(o.telefono, 24);
  if (telefono && !TELEFONO.test(telefono)) return { ok: false, error: 'telefono' };
  const web = urlSegura(o.web);
  const enlaces = (Array.isArray(o.enlaces) ? o.enlaces : [])
    .map((e) => {
      const r = (e ?? {}) as Record<string, unknown>;
      const url = urlSegura(r.url);
      return { etiqueta: texto(r.etiqueta, 40) || (url ? new URL(url).hostname.replace(/^www\./, '') : ''), url };
    })
    .filter((e) => e.url && e.url !== web)
    .slice(0, MAX_ENLACES);
  if (!email && !telefono && !web && !enlaces.length) return { ok: false, error: 'contacto' };
  const color = typeof o.color === 'string' && /^#[0-9a-f]{6}$/i.test(o.color) ? o.color.toLowerCase() : COLOR_POR_DEFECTO;
  return {
    ok: true,
    datos: {
      nombre,
      cargo: texto(o.cargo, LIMITES_TARJETA.cargo),
      email,
      telefono,
      web,
      ubicacion: texto(o.ubicacion, LIMITES_TARJETA.ubicacion),
      resumen: texto(o.resumen, LIMITES_TARJETA.resumen),
      enlaces,
      color,
      modelo: esModeloTarjeta(o.modelo) ? o.modelo : MODELO_TARJETA_POR_DEFECTO,
      qr: o.qr !== false,
    },
  };
}

/** «José Pérez Núñez» → «jose-perez-nunez». */
export const slugBase = (nombre: string) => slugComun(nombre, 'tarjeta');

export const SLUG_TARJETA_VALIDO = SLUG_PAGINA_VALIDO;

const escVcard = (s: string) => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1');

/** vCard 3.0 (la que abren bien iOS y Android al pulsar «Guardar contacto»). */
export function vcard(d: DatosTarjeta, url: string): string {
  const partes = d.nombre.split(/\s+/);
  const nombre = partes.shift() ?? '';
  const l = ['BEGIN:VCARD', 'VERSION:3.0', `N:${escVcard(partes.join(' '))};${escVcard(nombre)};;;`, `FN:${escVcard(d.nombre)}`];
  if (d.cargo) l.push(`TITLE:${escVcard(d.cargo)}`);
  if (d.email) l.push(`EMAIL;TYPE=INTERNET:${escVcard(d.email)}`);
  if (d.telefono) l.push(`TEL;TYPE=CELL:${escVcard(d.telefono)}`);
  if (d.web) l.push(`URL:${escVcard(d.web)}`);
  for (const e of d.enlaces) l.push(`URL;TYPE=${escVcard(e.etiqueta).replace(/[^A-Za-z0-9-]/g, '') || 'OTRO'}:${escVcard(e.url)}`);
  if (d.ubicacion) l.push(`ADR;TYPE=WORK:;;;${escVcard(d.ubicacion)};;;`);
  if (d.resumen) l.push(`NOTE:${escVcard(d.resumen)}`);
  l.push(`SOURCE:${escVcard(url)}`, 'END:VCARD');
  return l.join('\r\n') + '\r\n';
}

export interface TarjetaPublicada {
  slug: string;
  datos: DatosTarjeta;
  updated_at: string;
}

export const tarjetaPorSlug = (db: D1Database, slug: string): Promise<TarjetaPublicada | null> =>
  paginaPorSlug(db, 'tarjeta', slug, validarTarjeta);

export const tarjetaDePedido = (db: D1Database, pedido: string): Promise<TarjetaPublicada | null> =>
  paginaDePedido(db, 'tarjeta', pedido, validarTarjeta);

/** La dirección se fija con el nombre la primera vez; republicar no la cambia (el QR impreso sigue valiendo). */
export const publicarTarjeta = (db: D1Database, pedido: string, datos: DatosTarjeta): Promise<string> =>
  publicarPagina(db, 'tarjeta', pedido, datos.nombre, datos);
