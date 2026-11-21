/**
 * Modelos de la tarjeta digital (/c/<slug>) y colores derivados del acento. Datos puros, sin DOM:
 * los usan la validación del servidor, la página pública, el configurador del estudio y sus pruebas.
 */
export const MODELOS_TARJETA = [
  { id: 'clasica', nombre: 'Clásica', resumen: 'Banda de color arriba' },
  { id: 'degradado', nombre: 'Degradado', resumen: 'Cabecera con degradado' },
  { id: 'bloque', nombre: 'Bloque', resumen: 'Todo en tu color' },
  { id: 'oscura', nombre: 'Noche', resumen: 'Fondo oscuro, acento vivo' },
  { id: 'tinte', nombre: 'Suave', resumen: 'Tinte claro de tu color' },
  { id: 'minimal', nombre: 'Minimal', resumen: 'Blanca y sobria' },
] as const;
export type ModeloTarjeta = (typeof MODELOS_TARJETA)[number]['id'];
export const MODELO_TARJETA_POR_DEFECTO: ModeloTarjeta = 'clasica';
export const esModeloTarjeta = (v: unknown): v is ModeloTarjeta => MODELOS_TARJETA.some((m) => m.id === v);

/** Límites de los campos (la validación del servidor y los `maxlength` del formulario salen de aquí). */
export const LIMITES_TARJETA = { nombre: 80, cargo: 100, ubicacion: 80, resumen: 280 } as const;

const canal = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const aHex = (c: number[]) => `#${c.map((n) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, '0')).join('')}`;

/**
 * Texto legible sobre el acento (blanco salvo acento claro) y un segundo tono para degradados,
 * que se aleja del texto: más oscuro si el texto es claro y viceversa, así el contraste se mantiene.
 */
export function coloresTarjeta(acento: string): { sobre: string; acento2: string } {
  const [r, g, b] = canal(acento).map((n) => n / 255) as [number, number, number];
  const claro = 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.55;
  const a2 = canal(acento).map((n) => (claro ? n * 0.82 : n * 0.62));
  return { sobre: claro ? '#111827' : '#ffffff', acento2: aHex(a2) };
}
