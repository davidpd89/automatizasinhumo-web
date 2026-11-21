/**
 * Estudio de CV (/servicios/cv): catálogo de diseños y precios en un solo sitio.
 * Precios en céntimos. Provisionales hasta que David los confirme.
 * Las miniaturas salen del propio motor (cv-estudio/miniaturas.mjs), así que lo que se ve
 * en la galería es exactamente lo que el cliente descarga.
 */

import { AUTOSERVICIO, SLUG_CV, SLUG_TARJETA } from './autoservicio';

export type ModalidadCv = 'disenada' | 'personalizable';

export interface PaqueteCv {
  id: ModalidadCv;
  nombre: string;
  precio: number;
  /** Ids públicos del producto y la variante en la tienda (para el carrito). */
  producto: string;
  variante: string;
  resumen: string;
  incluye: readonly string[];
}

const CV = AUTOSERVICIO[SLUG_CV]!;
const variante = (m: ModalidadCv) => {
  const v = CV.variantes?.[m];
  if (!v) throw new Error(`autoservicio.json: falta la variante ${m} del CV`);
  return { nombre: v.etiqueta, precio: v.precio, producto: CV.producto, variante: v.id };
};

export const PAQUETES_CV: Record<ModalidadCv, PaqueteCv> = {
  disenada: {
    id: 'disenada',
    ...variante('disenada'),
    resumen: 'Eliges uno de nuestros diseños y lo rellenas con tus datos.',
    incluye: ['PDF listo para enviar', 'Seis estilos de letra, tamaño y espaciado', 'Tus datos guardados en este navegador', 'Cambios de diseño sin volver a escribir'],
  },
  personalizable: {
    id: 'personalizable',
    ...variante('personalizable'),
    resumen: 'Partes de cualquier diseño y le cambias el color, las formas y el sombreado.',
    incluye: ['Todo lo del diseño listo', 'Color principal y de acento a tu elección', '16 formas, arriba, abajo o en ambos lados', 'Sombreado y fondo a tu gusto'],
  },
};

/** Extras que se compran junto al CV y se publican solos con los mismos datos. */
export interface ExtraCv {
  id: 'tarjeta';
  slug: string;
  nombre: string;
  precio: number;
  producto: string;
  resumen: string;
}
const TARJETA = AUTOSERVICIO[SLUG_TARJETA]!;
export const EXTRAS_CV: readonly ExtraCv[] = [
  {
    id: 'tarjeta',
    slug: SLUG_TARJETA,
    nombre: TARJETA.nombre,
    precio: TARJETA.precio ?? 0,
    producto: TARJETA.producto,
    resumen: 'Tu página de contacto con QR y botón «Guardar contacto», publicada al momento con los datos de tu CV.',
  },
];

export interface DisenoCv {
  /** Identificador de la plantilla en el motor. */
  id: string;
  nombre: string;
  estilo: string;
  /** Sobrio (blanco y negro con un toque) o con bloques de color: lo primero que decide el cliente. */
  tono: 'sobrio' | 'color';
  /** Una columna: la que mejor leen los filtros automáticos de las empresas. */
  columnas: 1 | 2;
  /** Plantilla creativa propia del estudio, con dibujo de fondo. */
  creativo?: boolean;
}

/** Los 29 diseños del motor: primero las creativas propias, con nombre propio y una pista de estilo. */
export const DISENOS_CV: readonly DisenoCv[] = [
  { id: 'aurora', nombre: 'Aurora', estilo: 'Ola de color degradada', tono: 'color', columnas: 2, creativo: true },
  { id: 'coral', nombre: 'Coral', estilo: 'Columna con burbujas', tono: 'color', columnas: 2, creativo: true },
  { id: 'cometa', nombre: 'Cometa', estilo: 'Planeta tras tus iniciales', tono: 'color', columnas: 2, creativo: true },
  { id: 'tinta', nombre: 'Tinta', estilo: 'Pinceladas y rotulador', tono: 'color', columnas: 2, creativo: true },
  { id: 'nocturno', nombre: 'Nocturno', estilo: 'Panal degradado oscuro', tono: 'color', columnas: 2, creativo: true },
  { id: 'pixel', nombre: 'Píxel', estilo: 'Píxeles en cascada', tono: 'color', columnas: 2, creativo: true },
  { id: 'lienzo', nombre: 'Lienzo', estilo: 'Arcos sobre papel crema', tono: 'color', columnas: 1, creativo: true },
  { id: 'prisma', nombre: 'Prisma', estilo: 'Diagonales de color', tono: 'color', columnas: 2, creativo: true },
  { id: 'brisa', nombre: 'Brisa', estilo: 'Manchas orgánicas', tono: 'color', columnas: 2, creativo: true },
  { id: 'vertice', nombre: 'Vértice', estilo: 'Franja y nombre gigante', tono: 'color', columnas: 1, creativo: true },
  { id: 'oasis', nombre: 'Oasis', estilo: 'Arco con sol', tono: 'color', columnas: 2, creativo: true },
  { id: 'zafiro', nombre: 'Zafiro', estilo: 'Columna oscura a rayas', tono: 'color', columnas: 2, creativo: true },
  { id: 'mosaico', nombre: 'Mosaico', estilo: 'Mosaico y tarjetas', tono: 'color', columnas: 1, creativo: true },
  { id: 'trazo', nombre: 'Trazo', estilo: 'Trazos a mano alzada', tono: 'color', columnas: 1, creativo: true },
  { id: 'onyx', nombre: 'Ónix', estilo: 'Clásico con columna lateral', tono: 'sobrio', columnas: 2 },
  { id: 'azurill', nombre: 'Celeste', estilo: 'Cabecera centrada', tono: 'sobrio', columnas: 2 },
  { id: 'bronzor', nombre: 'Bronce', estilo: 'Apartados al margen', tono: 'sobrio', columnas: 1 },
  { id: 'chikorita', nombre: 'Hoja', estilo: 'Lateral de color a la derecha', tono: 'color', columnas: 2 },
  { id: 'ditgar', nombre: 'Lavanda', estilo: 'Columna de color con tu nombre', tono: 'color', columnas: 2 },
  { id: 'ditto', nombre: 'Grafito', estilo: 'Banda oscura arriba', tono: 'color', columnas: 2 },
  { id: 'gengar', nombre: 'Violeta', estilo: 'Lateral y cabecera de color', tono: 'color', columnas: 2 },
  { id: 'glalie', nombre: 'Glaciar', estilo: 'Lateral azul', tono: 'color', columnas: 2 },
  { id: 'kakuna', nombre: 'Esencial', estilo: 'Centrado y simétrico', tono: 'sobrio', columnas: 2 },
  { id: 'lapras', nombre: 'Marcos', estilo: 'Bloques enmarcados', tono: 'sobrio', columnas: 2 },
  { id: 'leafish', nombre: 'Brote', estilo: 'Cabecera suave', tono: 'color', columnas: 2 },
  { id: 'meowth', nombre: 'Elegante', estilo: 'Títulos en mayúsculas', tono: 'sobrio', columnas: 2 },
  { id: 'pikachu', nombre: 'Ámbar', estilo: 'Cabecera en bloque', tono: 'color', columnas: 2 },
  { id: 'rhyhorn', nombre: 'Lineal', estilo: 'Una columna, sin adornos', tono: 'sobrio', columnas: 1 },
  { id: 'scizor', nombre: 'Carmín', estilo: 'Filete de color, títulos marcados', tono: 'sobrio', columnas: 1 },
];

export const DISENO_POR_DEFECTO = 'aurora';

/** Filtros de la galería de diseños. `cumple` es la única fuente: la página y el script la usan tal cual. */
export const FILTROS_DISENO = [
  { id: 'todos', nombre: 'Todos', cumple: () => true },
  { id: 'creativo', nombre: 'Creativos', cumple: (d: DisenoCv) => d.creativo === true },
  { id: 'sobrio', nombre: 'Sobrios', cumple: (d: DisenoCv) => d.tono === 'sobrio' },
  { id: 'color', nombre: 'Con color', cumple: (d: DisenoCv) => d.tono === 'color' },
  { id: 'una-columna', nombre: 'Una columna', cumple: (d: DisenoCv) => d.columnas === 1 },
] as const;
export const filtrosDe = (d: DisenoCv) => FILTROS_DISENO.filter((f) => f.cumple(d)).map((f) => f.id).join(' ');

/** Letra, tamaño y espaciado: el mismo catálogo que usa el motor, para que página y PDF no se desfasen. */
export { ESPACIADOS, ESTILOS_LETRA, FORMATO_INICIAL, TAMANOS } from '../../../cv-estudio/src/catalogo-formato';
export const MOTOR_CV = '/cv/estudio/motor/estudio.js';
export const miniaturaCv = (id: string) => `/cv/estudio/miniaturas/${id}.jpg`;

/** Formas, posición, sombreado y fondo de la personalizable: el mismo catálogo que dibuja el motor. */
export { DECORACION_VACIA, FONDOS, FORMAS, POSICIONES, SOMBREADOS } from '../../../cv-estudio/src/catalogo-decoracion';

/** Colores sugeridos para la personalizable (el selector admite cualquiera). */
export const COLORES_CV: readonly { valor: string; nombre: string }[] = [
  { valor: '#176b5a', nombre: 'Verde pino' },
  { valor: '#b34a28', nombre: 'Terracota' },
  { valor: '#1f4e8c', nombre: 'Azul tinta' },
  { valor: '#6b3fa0', nombre: 'Violeta' },
  { valor: '#a3123a', nombre: 'Granate' },
  { valor: '#2f3b45', nombre: 'Pizarra' },
];

/**
 * Límites del contenido: lo que cabe sin que el diseño se rompa (dos páginas como mucho) y lo que un
 * seleccionador lee de verdad. La página los pone en los campos y el estudio los aplica al pegar o importar.
 */
export const LIMITES_CV = {
  items: { experiencia: 6, formacion: 5, habilidades: 12, idiomas: 5 },
  /** Caracteres. */
  resumen: 600,
  descripcion: 700,
  /** Líneas (logros) por experiencia. */
  lineasDescripcion: 6,
} as const;

/**
 * Guía con ventanitas (Driver.js, la misma del resto de la web): por paso, qué es cada zona y qué
 * hacer. `guia` es el atributo `data-guia` del bloque al que señala; si no se ve, se salta.
 */
export interface PasoGuiaCv {
  guia: string;
  titulo: string;
  texto: string;
}
export const GUIA_CV: Record<string, readonly PasoGuiaCv[]> = {
  diseno: [
    { guia: 'vista', titulo: 'Así queda tu CV', texto: 'Aquí ves el diseño con un ejemplo. Se actualiza solo cada vez que cambias algo. La marca de agua desaparece en el PDF que compras.' },
    { guia: 'filtros', titulo: 'Filtra los diseños', texto: 'Creativos, sobrios, con color o de una columna (la que mejor leen los filtros automáticos de las empresas).' },
    { guia: 'galeria', titulo: 'Elige uno', texto: 'Toca el que te guste y míralo a la derecha. Desplázate: hay 25. Puedes cambiarlo cuando quieras sin perder lo que escribas.' },
    { guia: 'letra', titulo: 'Letra, tamaño y espaciado', texto: 'Pruébalos: la vista previa cambia al momento. Con mucho texto, un tamaño menor y espaciado compacto te ahorran una página.' },
    { guia: 'personalizar', titulo: 'Ponle tu toque', texto: 'Activa esta casilla para cambiar los colores, añadir formas, sombreado y fondo. Si no lo activas, el diseño va tal cual.' },
    { guia: 'siguiente', titulo: 'Y ahora, tus datos', texto: 'Cuando te guste, sigue: escribirás tus datos una sola vez y el diseño se queda como lo has dejado.' },
  ],
  datos: [
    { guia: 'importar', titulo: 'No empieces de cero', texto: 'Sube tu CV actual (PDF, Word o la exportación de LinkedIn) y rellenamos los campos por ti; o prueba con un ejemplo. Se lee en tu navegador, no se envía a ningún sitio.' },
    { guia: 'sobre-ti', titulo: 'Tus datos básicos', texto: 'Solo el nombre es obligatorio. Los contadores te avisan de lo que cabe sin que el diseño se estropee.' },
    { guia: 'listas', titulo: 'Experiencia, formación y más', texto: 'Añade cada puesto o estudio con su botón. Hay un máximo por apartado para que el CV se lea bien en dos páginas.' },
    { guia: 'vista', titulo: 'Lo ves mientras escribes', texto: 'La vista previa se actualiza con tus datos. Todo se guarda en este navegador.' },
  ],
  revisa: [
    { guia: 'repaso', titulo: 'Un repaso rápido', texto: 'Te decimos qué falta (contacto, resumen, experiencia…). No es obligatorio, pero ayuda mucho.' },
    { guia: 'vista', titulo: 'Revisa página a página', texto: 'Mira que todo está donde quieres. Si no, vuelve atrás desde la barra de pasos: no pierdes nada.' },
  ],
  descarga: [
    { guia: 'comprar', titulo: 'Compra y descarga', texto: 'Pagas una vez y descargas el PDF sin marca de agua. Puedes volver a descargarlo con cambios.' },
    { guia: 'extras', titulo: 'Tarjeta digital con QR', texto: 'Márcala y aparece su configurador: eliges modelo, color y datos, y la ves al momento. Se publica al pagar.' },
    { guia: 'tarjeta', titulo: 'Diseña tu tarjeta', texto: 'Prueba los seis modelos con tu color y tus datos. Con el QR, quien lo escanee guarda tu contacto en un toque.' },
  ],
};

export const PASOS_CV = [
  { id: 'diseno', titulo: 'Diseño y estilo' },
  { id: 'datos', titulo: 'Tus datos' },
  { id: 'revisa', titulo: 'Revisa' },
  { id: 'descarga', titulo: 'Descarga' },
] as const;

export const euros = (centimos: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: centimos % 100 ? 2 : 0 }).format(
    centimos / 100,
  );
