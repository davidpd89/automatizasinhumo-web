/**
 * Catálogo nuevo (/servicios): servicios agrupados por familia, en el orden en que se
 * lanzan. Fuente única para la página, el menú y la portada: añadir un servicio es
 * añadir una línea aquí, y su color, viñetas y degradado salen de su familia
 * (tokens --ds-familia-<id> del tema), nunca de la página.
 *
 * Un servicio «pronto» se enseña pero no se enlaza: así el cliente ve lo que viene sin
 * acabar en una página a medias.
 */
import { AUTOSERVICIO, SLUG_WEB } from './autoservicio';
import { EXTRAS_CV, PAQUETES_CV, miniaturaCv } from './cv';

export type IdFamilia = 'cv' | 'webs' | 'tiendas' | 'reservas' | 'automatizar' | 'eventos';

export interface ServicioCatalogo {
  id: string;
  nombre: string;
  texto: string;
  icono: string;
  /** Lo que recibe, en tres puntos como mucho (viñetas con el color de la familia). */
  puntos: readonly string[];
  /** Solo los disponibles tienen enlace y precio. */
  href?: string;
  /** Precio mínimo en céntimos. */
  desde?: number;
  imagen?: string;
}

export interface FamiliaCatalogo {
  id: IdFamilia;
  nombre: string;
  /** Una frase: qué une a los servicios de la familia. */
  texto: string;
  icono: string;
  servicios: readonly ServicioCatalogo[];
}

const desdeCv = Math.min(PAQUETES_CV.disenada.precio, PAQUETES_CV.personalizable.precio);

export const FAMILIAS: readonly FamiliaCatalogo[] = [
  {
    id: 'cv',
    nombre: 'Currículum y marca personal',
    texto: 'Tu CV y lo que lo acompaña: escribes tus datos una vez y sirven para todo.',
    icono: 'id-badge-2',
    servicios: [
      {
        id: 'cv',
        nombre: 'Currículum con buen diseño',
        texto: 'Eliges un diseño, escribes tus datos y lo ves al momento. Lo descargas en PDF.',
        icono: 'file-text',
        puntos: ['29 diseños, 14 creativos, o uno a tu gusto', 'Vista previa mientras escribes', 'PDF listo para enviar'],
        href: '/servicios/cv',
        desde: desdeCv,
        imagen: miniaturaCv('onyx'),
      },
      {
        id: 'tarjeta',
        nombre: 'Tarjeta de visita digital',
        texto: 'Tu contacto en un QR: quien lo escanea te guarda en el móvil con un toque.',
        icono: 'qrcode',
        puntos: ['Con los datos de tu CV', 'Botón «Guardar contacto»', 'QR para imprimir'],
        href: '/servicios/cv#tarjeta',
        desde: EXTRAS_CV[0]!.precio,
      },
      {
        id: 'cv-web',
        nombre: 'Tu CV como página web',
        texto: 'Un enlace para LinkedIn y las ofertas, siempre al día con tu CV.',
        icono: 'world-www',
        puntos: ['Dirección propia incluida', 'Se actualiza con tu CV', 'Se ve bien en el móvil'],
      },
      {
        id: 'dominio',
        nombre: 'Tu nombre como dominio',
        texto: 'tunombre.es para tu CV y tu tarjeta, configurado sin que toques nada.',
        icono: 'link',
        puntos: ['Candado https', 'Configuración automática', 'Renovación sin avisos'],
      },
    ],
  },
  {
    id: 'webs',
    nombre: 'Webs',
    texto: 'Plantillas que editas tú y se publican solas, con el mismo método que el CV.',
    icono: 'world-www',
    servicios: [
      {
        id: 'web-una-pagina',
        nombre: 'Web de una página',
        texto: 'Quién eres, qué ofreces y cómo contactarte, en una sola página clara.',
        icono: 'browser',
        puntos: ['3 diseños, tu color y tu letra', 'Llamada y WhatsApp a un toque', 'Publicada al momento, alojamiento incluido'],
        href: '/servicios/web',
        desde: AUTOSERVICIO[SLUG_WEB]!.precio,
      },
      {
        id: 'portafolio',
        nombre: 'Portafolio',
        texto: 'Tus trabajos con fotos grandes y un formulario para que te escriban.',
        icono: 'photo',
        puntos: ['Galería por proyectos', 'Formulario de contacto', 'Tu dominio o dirección incluida'],
      },
      {
        id: 'carta',
        nombre: 'Carta digital con QR',
        texto: 'La carta de tu bar o restaurante en el móvil, con alérgenos y precios.',
        icono: 'tools-kitchen-2',
        puntos: ['QR para las mesas', 'Cambias un precio y se ve al momento', 'Alérgenos por plato'],
      },
    ],
  },
];

/** Lo que llega después: solo nombre e icono, con su color de familia. */
export const PROXIMAS: readonly { id: IdFamilia; nombre: string; icono: string }[] = [
  { id: 'tiendas', nombre: 'Tiendas online', icono: 'shopping-bag' },
  { id: 'reservas', nombre: 'Reservas y citas', icono: 'calendar-check' },
  { id: 'automatizar', nombre: 'Automatizaciones', icono: 'route' },
  { id: 'eventos', nombre: 'Invitaciones', icono: 'heart' },
];

/** Página del catálogo nuevo: a ella llevan «Ver todos los servicios» del tema. */
export const CATALOGO_HREF = '/servicios';

export const disponible = (s: ServicioCatalogo): s is ServicioCatalogo & { href: string } => Boolean(s.href);
