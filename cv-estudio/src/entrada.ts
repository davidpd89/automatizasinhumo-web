// API del motor del estudio de CV para la página (/servicios/cv).
// window.CvEstudio = { plantillas, formas, estilosLetra, tamanos, espaciados, datosEjemplo, crearDatos, formEjemplo, formVacio, crearPdf, pintarPdf, importar }.
import { createResumePdfBlob } from "../vendor/pdf/browser";
import { parseResumeData, type ResumeData } from "../vendor/schema/resume/data";
import { newResume, sanitizeResume } from "./adoptado/resume-model";
import { reactiveTemplates } from "./adoptado/templates";
import { ESPACIADOS, ESTILOS_LETRA, TAMANOS } from "./catalogo-formato";
import { FORMAS, MARCA_POR_DEFECTO, fijarCapas, type Decoracion } from "./decoracion";
import { crearDatos, FORM_EJEMPLO, FORM_VACIO } from "./formulario";
import { VARIANTES } from "../vendor/pdf/templates/creativos/variantes";

export const plantillas = reactiveTemplates.map((t) => ({ id: t.id, color: t.color }));
export const formas = FORMAS;

const id = () => crypto.randomUUID();
const web = { url: "", label: "", inlineLink: false };

/** CV de ejemplo en español: el mismo para todas las miniaturas y la vista previa inicial. */
export function datosEjemplo(plantilla = "onyx"): ResumeData {
	const d = newResume(plantilla);
	d.metadata.page.locale = "es-ES";
	d.basics = {
		...d.basics,
		name: "Lucía Martín Ortega",
		headline: "Responsable de atención al cliente",
		email: "lucia.martin@correo.es",
		phone: "+34 600 123 456",
		location: "Valencia",
	};
	d.summary.content =
		"<p>Ocho años coordinando equipos de atención al cliente en comercio electrónico. He reducido los tiempos de respuesta a la mitad y mantengo una satisfacción superior al 95 %.</p>";
	const s = d.sections;
	s.experience.items = [
		{ id: id(), hidden: false, company: "Tienda Levante S. L.", position: "Responsable de atención al cliente", location: "Valencia", period: "2021 – actualidad", website: web, roles: [], description: "<ul><li><p>Dirijo un equipo de 9 personas en chat, correo y teléfono.</p></li><li><p>Implanté respuestas guiadas: tiempo medio de respuesta de 6 h a 2,5 h.</p></li></ul>" },
		{ id: id(), hidden: false, company: "Moda Norte", position: "Agente de atención al cliente", location: "Bilbao", period: "2017 – 2021", website: web, roles: [], description: "<ul><li><p>Gestión de devoluciones e incidencias de envío.</p></li><li><p>Formación de nuevas incorporaciones.</p></li></ul>" },
	] as never[];
	s.education.items = [
		{ id: id(), hidden: false, school: "Universitat de València", degree: "Grado", area: "Administración y Dirección de Empresas", grade: "", location: "Valencia", period: "2012 – 2016", website: web, description: "" },
	] as never[];
	s.skills.items = [
		{ id: id(), hidden: false, icon: "", iconColor: "", name: "Atención multicanal", proficiency: "Avanzado", level: 5, keywords: ["Zendesk", "Chat", "Teléfono"] },
		{ id: id(), hidden: false, icon: "", iconColor: "", name: "Gestión de equipos", proficiency: "Avanzado", level: 4, keywords: ["Turnos", "Formación"] },
		{ id: id(), hidden: false, icon: "", iconColor: "", name: "Análisis de datos", proficiency: "Intermedio", level: 3, keywords: ["Excel", "Looker Studio"] },
	] as never[];
	s.languages.items = [
		{ id: id(), hidden: false, language: "Español", fluency: "Nativo", level: 5 },
		{ id: id(), hidden: false, language: "Inglés", fluency: "C1", level: 4 },
		{ id: id(), hidden: false, language: "Valenciano", fluency: "C1", level: 4 },
	] as never[];
	s.certifications.items = [
		{ id: id(), hidden: false, title: "Customer Experience Professional", issuer: "CXPA", date: "2023", website: web, description: "" },
	] as never[];
	s.interests.items = [
		{ id: id(), hidden: false, icon: "", iconColor: "", name: "Fotografía", keywords: [] },
		{ id: id(), hidden: false, icon: "", iconColor: "", name: "Senderismo", keywords: [] },
		{ id: id(), hidden: false, icon: "", iconColor: "", name: "Voluntariado", keywords: [] },
	] as never[];
	nivelDePlantilla(d);
	return parseResumeData(d);
}

/** Las plantillas creativas traen su forma de nivel (barras, puntos, cuadros…). */
function nivelDePlantilla(d: ResumeData) {
	const nivel = VARIANTES[d.metadata.template]?.nivel;
	if (nivel) d.metadata.design.level.type = nivel;
}

let cola: Promise<unknown> = Promise.resolve();

export type OpcionesPdf = {
	datos: unknown;
	plantilla?: string;
	/** Color principal de la plantilla (#rrggbb). */
	color?: string;
	decoracion?: Partial<Decoracion> | null;
	/**
	 * Texto de la marca de agua. El motor del navegador SIEMPRE la pone (vacío o null usan
	 * MARCA_POR_DEFECTO): el PDF final sin marca no se genera en el cliente.
	 */
	marcaAgua?: string | null;
	/** Ids de catalogo-formato.ts. Si faltan o no existen, se queda lo que traigan los datos. */
	letra?: string;
	tamano?: string;
	espaciado?: string;
};

/** Aplica letra, tamaño y espaciado del catálogo a los metadatos del CV. */
function aplicarFormato(d: ResumeData, { letra, tamano, espaciado }: Pick<OpcionesPdf, "letra" | "tamano" | "espaciado">) {
	const t = d.metadata.typography;
	const estilo = ESTILOS_LETRA.find((e) => e.id === letra);
	if (estilo) {
		t.heading.fontFamily = estilo.titulos;
		t.body.fontFamily = estilo.texto;
	}
	const medida = TAMANOS.find((m) => m.id === tamano);
	if (medida) {
		t.body.fontSize = medida.texto;
		t.heading.fontSize = medida.titulos;
	}
	const aire = ESPACIADOS.find((e) => e.id === espaciado);
	if (aire) {
		t.body.lineHeight = aire.interlineado;
		d.metadata.page.marginX = aire.margenX;
		d.metadata.page.marginY = aire.margenY;
	}
}

/** Genera el PDF. Los renders van en cola porque la decoración es estado del módulo. */
export function crearPdf({ datos, plantilla, color, decoracion, marcaAgua, letra, tamano, espaciado }: OpcionesPdf): Promise<Blob> {
	const trabajo = cola
		.catch(() => {})
		.then(async () => {
			const d = sanitizeResume(datos);
			d.metadata.page.locale = "es-ES";
			if (plantilla && plantillas.some((p) => p.id === plantilla)) d.metadata.template = plantilla as ResumeData["metadata"]["template"];
			nivelDePlantilla(d);
			if (color && /^#[0-9a-f]{6}$/i.test(color)) d.metadata.design.colors.primary = color;
			aplicarFormato(d, { letra, tamano, espaciado });
			fijarCapas(decoracion as Decoracion | undefined, marcaAgua?.trim() || MARCA_POR_DEFECTO);
			return createResumePdfBlob({ data: d });
		});
	cola = trabajo;
	return trabajo;
}

// El worker se copia junto a estudio.js; la URL se calcula aquí (entrada), no en un chunk de c/.
const WORKER_PDF = new URL("./pdf.worker.min.mjs", import.meta.url).href;

/** pdf.js con el worker ya apuntado. Único punto de carga para la vista previa y el importador. */
async function cargarPdfjs() {
	const pdfjs = await import("pdfjs-dist");
	pdfjs.GlobalWorkerOptions.workerSrc = WORKER_PDF;
	return pdfjs;
}

/** Pinta las páginas de un PDF en lienzos (sirve en móvil, donde no hay visor de PDF). */
export async function pintarPdf(blob: Blob, contenedor: HTMLElement, { ancho = 800, maxPaginas = 3 } = {}) {
	const pdfjs = await cargarPdfjs();
	const tarea = pdfjs.getDocument({ data: await blob.arrayBuffer(), useSystemFonts: true });
	try {
		const pdf = await tarea.promise;
		const frag = document.createDocumentFragment();
		const n = Math.min(pdf.numPages, maxPaginas);
		for (let i = 1; i <= n; i++) {
			const pagina = await pdf.getPage(i);
			const base = pagina.getViewport({ scale: 1 });
			const vista = pagina.getViewport({ scale: ancho / base.width });
			const lienzo = document.createElement("canvas");
			lienzo.width = Math.round(vista.width);
			lienzo.height = Math.round(vista.height);
			lienzo.setAttribute("role", "img");
			lienzo.setAttribute("aria-label", `Vista previa del CV, página ${i} de ${pdf.numPages}`);
			await pagina.render({ canvas: lienzo, viewport: vista }).promise;
			frag.append(lienzo);
		}
		contenedor.replaceChildren(frag);
		return pdf.numPages;
	} finally {
		void tarea.destroy();
	}
}

declare global {
	interface Window {
		CvEstudio: typeof api;
	}
}
/** Lee un CV que el cliente ya tiene (PDF, Word, LinkedIn .zip, JSON Resume). Carga los lectores solo al usarlo. */
const importar = async (fichero: Blob & { name?: string }) => (await import("./importar")).importarCv(fichero, cargarPdfjs);

const api = { plantillas, formas, estilosLetra: ESTILOS_LETRA, tamanos: TAMANOS, espaciados: ESPACIADOS, datosEjemplo, crearDatos, formEjemplo: FORM_EJEMPLO, formVacio: FORM_VACIO, crearPdf, pintarPdf, importar };
window.CvEstudio = api;
