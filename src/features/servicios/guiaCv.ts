/**
 * Guía con ventanitas del estudio de CV, con Driver.js (la misma librería que el tour de la
 * portada). Se carga solo al pedirla. Los pasos están en GUIA_CV (cv.ts); cada uno señala un
 * bloque `data-guia="<id>"` y se salta si ese bloque no se ve en el paso actual.
 */
const CLAVE_GUIA = 'servicios:cv:guia';

export const guiaPendiente = (): boolean => {
  try {
    return localStorage.getItem(CLAVE_GUIA) === null;
  } catch {
    return false;
  }
};
export const recordarGuia = (valor: 'visto' | 'no') => {
  try {
    localStorage.setItem(CLAVE_GUIA, valor);
  } catch {
    /* sin almacenamiento: se volverá a ofrecer */
  }
};

const visible = (el: Element | null): el is HTMLElement =>
  el instanceof HTMLElement && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';

export async function guiarEstudio(pasos: readonly { guia: string; titulo: string; texto: string }[], raiz: HTMLElement) {
  const { driver } = await import('driver.js');
  await import('driver.js/dist/driver.css');
  const seleccion = pasos.flatMap((p) => {
    const el = raiz.querySelector(`[data-guia="${p.guia}"]`);
    return visible(el) ? [{ element: el, popover: { title: p.titulo, description: p.texto } }] : [];
  });
  if (!seleccion.length) return;
  const previo = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  driver({
    steps: seleccion,
    showProgress: true,
    progressText: '{{current}} de {{total}}',
    nextBtnText: 'Siguiente',
    prevBtnText: 'Anterior',
    doneBtnText: 'Entendido',
    closeBtnLabel: 'Cerrar la guía',
    popoverClass: 'tour-ash',
    animate: !quieto,
    smoothScroll: !quieto,
    allowKeyboardControl: true,
    onDestroyed: () => (previo && previo.isConnected ? previo : null)?.focus({ preventScroll: true }),
  }).drive();
}
