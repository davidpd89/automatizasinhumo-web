// Plantillas creativas del estudio: una fábrica con las mismas piezas que el resto de
// plantillas (useTemplateBase, Section, TemplateProvider) y una descripción por variante.
// Dos esquemas:
// - Columna a toda altura (`columna`): la página es una fila; la columna lateral la pinta
//   el arte (arte.tsx) de arriba abajo en todas las páginas y la cabecera va dentro de ella
//   o encima del cuerpo.
// - Apilada: cabecera a todo el ancho (con su arte detrás) y debajo cuerpo + tarjeta lateral
//   que se estira hasta el pie.
// Cada variante elige arte SVG, títulos, nombre a dos tonos, marcador, tipo de nivel…
// Propias del estudio (no vienen de Reactive Resume), bajo la misma licencia del proyecto.
import type { Style } from "@react-pdf/types";
import type { TemplatePageProps } from "../../document";
import type { TemplateColorRoles, TemplateStyleContext, TemplateStyleSlots } from "../shared/types";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { Page, StyleSheet, Text as PdfText, View } from "#react-pdf-renderer";
import { useRender } from "../../context";
import { useRenderedSectionIds, useResolvedNode } from "../../semantic/context";
import { semanticNodeKeys } from "../../semantic/node-keys";
import {
	CustomFieldContactItem,
	EmailContactItem,
	LocationContactItem,
	PhoneContactItem,
	WebsiteContactItem,
} from "../shared/contact-item";
import { TemplatePlacementProvider, TemplateProvider } from "../shared/context";
import { filterSections } from "../shared/filtering";
import { getTemplateMetrics } from "../shared/metrics";
import { hasTemplatePicture } from "../shared/picture";
import {
	Heading,
	SemanticContactListView,
	SemanticHeaderPicture,
	SemanticHeaderView,
	SemanticRegionView,
	Text,
} from "../shared/primitives";
import { Section } from "../shared/sections";
import { composeStyles, headerNameLineHeight, resolvePlacementColor } from "../shared/styles";
import { createIconSlot, useTemplateBase } from "../shared/template-base";
import { type Arte, capasArte, mezclar, paleta } from "./arte";

export type Nivel = "progress-bar" | "rectangle-full" | "circle" | "square" | "rectangle";

export type Variante = {
	/** banda: a todo el ancho (con color o con arte detrás) · centrada · izquierda · lateral: dentro de la columna. */
	cabecera: "banda" | "centrada" | "izquierda" | "lateral";
	lateral: "izquierda" | "derecha" | "ninguno";
	/** Columna lateral a toda la altura de la página (la pinta el arte). */
	columna?: boolean;
	/** Fondo de la columna lateral. */
	fondoLateral: "tinte" | "primario" | "oscuro";
	titulos: "etiqueta" | "barra" | "subrayado" | "mayusculas" | "doble" | "punteado" | "pastilla" | "marcador";
	/** Dibujo de fondo (arte.tsx). */
	arte?: Arte;
	/** Alto mínimo de la cabecera (pt), para que encaje con el arte. */
	altoCabecera?: number;
	/** Banda sin color propio: la pinta el arte. "claro" = texto blanco encima. */
	bandaArte?: "claro" | "oscuro";
	/** Margen izquierdo extra de la cabecera (pt), p. ej. para dejar sitio al planeta. */
	sangriaCabecera?: number;
	/** Espacio extra arriba en la columna lateral (pt). */
	lateralArriba?: number;
	/** Círculo con las iniciales junto al nombre. */
	monograma?: boolean;
	/** Secciones del cuerpo en tarjetas con borde redondeado. */
	tarjetas?: boolean;
	/** Multiplica el tamaño del nombre (1,5 × el de los títulos por defecto). */
	nombre?: number;
	/** Apellidos en el color de acento. */
	nombrePartido?: boolean;
	/** Trazo de rotulador bajo el nombre. */
	marcador?: boolean;
	/** Banda con el color oscuro en vez del principal. */
	bandaOscura?: boolean;
	/** Fondo de la página: tinte del color o papel crema. */
	fondoPagina?: "tinte" | "crema";
	/** Cómo se pintan los niveles de habilidades e idiomas. */
	nivel?: Nivel;
	/** Grados de giro del segundo color respecto al principal. */
	giro?: number;
};

const iniciales = (nombre: string) =>
	nombre
		.split(/\s+/)
		.filter((p) => /^\p{L}/u.test(p))
		.slice(0, 2)
		.map((p) => p[0]!.toUpperCase())
		.join("");

/** "Lucía Martín Ortega" → ["Lucía", "Martín Ortega"]; un solo nombre → [nombre, ""]. */
const partirNombre = (nombre: string): [string, string] => {
	const p = nombre.trim().split(/\s+/);
	if (p.length < 2) return [nombre.trim(), ""];
	return [p[0]!, p.slice(1).join(" ")];
};

const TAMANO_PAGINA = { A4: [595.28, 841.89], LETTER: [612, 792] } as const;

type Estilos = Omit<TemplateStyleSlots, "page"> & Record<string, Style | TemplateStyleSlots[keyof TemplateStyleSlots]> & { page: Style };

function usarVariante(v: Variante) {
	const { metadata, r, foreground, background, primary, metrics, base } = useTemplateBase();

	return useMemo(() => {
		const c = paleta(primary, v.giro);
		const lateralFondo = v.fondoLateral === "primario" ? primary : v.fondoLateral === "oscuro" ? c.osc : c.tin;
		const lateralTexto = v.fondoLateral === "tinte" ? foreground : "#ffffff";
		const colors: TemplateColorRoles = { foreground, background, primary, sidebarForeground: lateralTexto, sidebarBackground: lateralFondo };
		const bandaFondo = v.bandaArte ? "transparent" : v.bandaOscura ? c.osc : primary;
		const fh = metadata.typography.heading.fontSize;
		const H = metrics.page.paddingHorizontal;
		const V = metrics.page.paddingVertical;
		const enColumna = !!v.columna && v.lateral !== "ninguno";
		const fondoPagina = v.fondoPagina === "tinte" ? mezclar(primary, "#ffffff", 0.95) : v.fondoPagina === "crema" ? "#fbf8f1" : null;

		const titulo: Style = (() => {
			const t = { fontSize: fh * 0.82, color: primary } as Style;
			switch (v.titulos) {
				case "etiqueta":
					return { ...t, color: "#ffffff", backgroundColor: primary, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 3, alignSelf: "flex-start", textTransform: "uppercase", letterSpacing: 0.8 };
				case "pastilla":
					return { ...t, backgroundColor: c.tin, paddingHorizontal: 10, paddingVertical: 2.5, borderRadius: 99, alignSelf: "flex-start", letterSpacing: 0.4 };
				case "marcador":
					return { ...t, color: c.osc, backgroundColor: mezclar(c.a, "#ffffff", 0.62), paddingHorizontal: 5, paddingVertical: 1, alignSelf: "flex-start", textTransform: "uppercase", letterSpacing: 1 };
				case "barra":
					return { ...t, borderLeftWidth: 4, borderLeftColor: primary, paddingLeft: 7 };
				case "subrayado":
					return { ...t, borderBottomWidth: 1.5, borderBottomColor: primary, paddingBottom: metrics.gapY(0.125) };
				case "mayusculas":
					return { ...t, textTransform: "uppercase", letterSpacing: 2.2, fontSize: fh * 0.74 };
				case "doble":
					return { ...t, textTransform: "uppercase", letterSpacing: 1.4, textAlign: "center", borderTopWidth: 1, borderBottomWidth: 1, borderColor: primary, paddingVertical: 3 };
				case "punteado":
					return { ...t, borderBottomWidth: 1.2, borderBottomColor: primary, borderBottomStyle: "dotted", paddingBottom: metrics.gapY(0.125) };
			}
		})();

		const hoja = StyleSheet.create({
			...base,
			inline: { ...base.inline, columnGap: metrics.gapX(0.25) },
			page: { ...base.page, ...(enColumna ? { flexDirection: r.row, paddingVertical: V } : { paddingHorizontal: H, paddingVertical: V, rowGap: metrics.sectionGap }), backgroundColor: fondoPagina ?? "#ffffff" },
			section: { flexDirection: "column", rowGap: metrics.gapY(0.25) },
			sectionHeading: titulo,
			sectionItems: { paddingTop: metrics.gapY(0.25) },
			item: { rowGap: metrics.gapY(0.125) },
			levelContainer: { width: "78%" },
			columna: { flex: 1, minWidth: 0 },
			lateralTarjeta: { backgroundColor: lateralFondo, borderRadius: 10, paddingHorizontal: metrics.gapX(0.9), paddingVertical: metrics.gapY(0.9) },
			banda: {
				flexDirection: r.row,
				alignItems: "center",
				columnGap: metrics.gapX(1),
				backgroundColor: bandaFondo,
				marginHorizontal: -H,
				marginTop: -V,
				paddingHorizontal: H,
				paddingLeft: H + (v.sangriaCabecera ?? 0),
				paddingVertical: V * 0.9,
				...(v.altoCabecera ? { minHeight: v.altoCabecera } : {}),
			},
			centrada: { alignItems: "center", rowGap: metrics.gapY(0.5), paddingBottom: V * 0.5, ...(v.altoCabecera ? { minHeight: v.altoCabecera - V, justifyContent: "center" } : {}) },
			izquierda: { flexDirection: r.row, alignItems: "center", columnGap: metrics.gapX(1), ...(v.altoCabecera ? { minHeight: v.altoCabecera - V } : {}) },
			enLateral: { rowGap: metrics.gapY(0.6), paddingBottom: metrics.gapY(0.5) },
			titular: { flex: 1, rowGap: metrics.gapY(0.5) },
			identidad: { ...r.headerIdentity, rowGap: metrics.gapY(0.3) },
			nombre: { fontSize: fh * (v.nombre ?? 1.6), lineHeight: headerNameLineHeight },
			contactos: { flexDirection: r.row, flexWrap: "wrap", rowGap: metrics.gapY(0.125), columnGap: metrics.gapX(0.75) },
			contactosCentro: { flexDirection: r.row, flexWrap: "wrap", justifyContent: "center", rowGap: metrics.gapY(0.125), columnGap: metrics.gapX(0.75) },
			contactosColumna: { flexDirection: "column", rowGap: metrics.gapY(0.2) },
			contacto: { flexDirection: r.row, alignItems: "center", columnGap: metrics.gapX(1 / 6) },
			monograma: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
			tarjeta: { borderWidth: 1, borderColor: c.med, borderRadius: 10, padding: metrics.gapY(0.7), backgroundColor: "#ffffff" },
		}) as unknown as Record<string, Style>;

		const textoEn = ({ placement, colors: k }: TemplateStyleContext) => resolvePlacementColor({ placement, defaultForeground: k.foreground, sidebarForeground: k.sidebarForeground });
		const acentoEn = ({ placement, colors: k }: TemplateStyleContext) => resolvePlacementColor({ placement, defaultForeground: k.primary, sidebarForeground: k.sidebarForeground });
		const sobreColor = (k: TemplateStyleContext) => k.placement === "sidebar" && k.colors.sidebarForeground === "#ffffff";

		const styles = {
			...hoja,
			text: (k: TemplateStyleContext) => ({ ...hoja.text, color: textoEn(k) }),
			heading: (k: TemplateStyleContext) => ({ ...hoja.heading, color: textoEn(k) }),
			link: (k: TemplateStyleContext) => ({ ...hoja.link, color: textoEn(k) }),
			richParagraph: (k: TemplateStyleContext) => ({ ...hoja.richParagraph, color: textoEn(k) }),
			richListItemMarker: (k: TemplateStyleContext) => ({ ...hoja.richListItemMarker, color: sobreColor(k) ? textoEn(k) : primary }),
			richListItemContent: (k: TemplateStyleContext) => ({ ...hoja.richListItemContent, color: textoEn(k) }),
			section: (k: TemplateStyleContext) => ({ ...hoja.section, ...(v.tarjetas && k.placement === "main" ? hoja.tarjeta : {}) }),
			splitRow: (k: TemplateStyleContext) => ({ ...hoja.splitRow, ...(k.placement === "sidebar" ? { flexDirection: "column", alignItems: "flex-start", justifyContent: "flex-start" } : {}) }),
			alignEnd: (k: TemplateStyleContext) => ({ ...hoja.alignEnd, ...(k.placement === "sidebar" ? { textAlign: "left" } : {}) }),
			sectionHeading: (k: TemplateStyleContext) => {
				if (!sobreColor(k)) return { ...hoja.sectionHeading, color: v.titulos === "etiqueta" ? "#ffffff" : v.titulos === "marcador" ? c.osc : acentoEn(k) };
				// Sobre fondo de color: el acento pasa a ser el color del texto del lateral.
				const t = textoEn(k);
				const fondo = v.titulos === "etiqueta" || v.titulos === "pastilla" || v.titulos === "marcador" ? { backgroundColor: "rgba(255,255,255,0.2)" } : {};
				return { ...hoja.sectionHeading, color: t, ...fondo, borderBottomColor: t, borderLeftColor: t, borderTopColor: t, borderColor: t };
			},
			levelItem: (k: TemplateStyleContext) => ({ borderColor: sobreColor(k) ? "rgba(255,255,255,0.5)" : c.med, ...(v.nivel === "progress-bar" || v.nivel === "rectangle-full" ? { borderWidth: 0, borderRadius: 2 } : {}) }),
			levelItemActive: (k: TemplateStyleContext) => ({ backgroundColor: sobreColor(k) ? "#ffffff" : primary, borderColor: sobreColor(k) ? "#ffffff" : primary }),
			levelItemInactive: (k: TemplateStyleContext) => ({ backgroundColor: sobreColor(k) ? "rgba(255,255,255,0.22)" : v.nivel === "progress-bar" || v.nivel === "rectangle-full" ? c.tin : "transparent" }),
			icon: createIconSlot({ metadata, accentFor: acentoEn }),
		} as unknown as Estilos;

		return { colors, styles, c, primary, foreground, lateralFondo, lateralTexto, enColumna, fondoPagina };
	}, [metadata, r.row, r.headerIdentity, primary, foreground, background, base, metrics, v]);
}

function Contactos({ estilo, item }: { estilo: Style; item: Style }) {
	const { basics } = useRender();
	return (
		<SemanticContactListView style={estilo}>
			<EmailContactItem email={basics.email} style={item} />
			<PhoneContactItem phone={basics.phone} style={item} />
			<LocationContactItem location={basics.location} style={item} />
			<WebsiteContactItem website={basics.website} style={item} />
			{basics.customFields.map((f) => (
				<CustomFieldContactItem key={f.id} field={f} style={item} />
			))}
		</SemanticContactListView>
	);
}

function Cabecera({ v, e, pageNodeKey }: { v: Variante; e: ReturnType<typeof usarVariante>; pageNodeKey: string }) {
	const { basics, picture } = useRender();
	const s = e.styles as unknown as Record<string, Style>;
	const { c } = e;
	// ¿Sobre qué fondo va la cabecera? Decide el color del texto.
	const oscura =
		v.cabecera === "banda" ? v.bandaArte !== "oscuro" : v.cabecera === "lateral" ? e.lateralTexto === "#ffffff" : false;
	const texto = oscura ? "#ffffff" : e.foreground;
	const acento = oscura ? mezclar(c.a, "#ffffff", 0.55) : c.p;

	const foto = hasTemplatePicture(picture) ? (
		<SemanticHeaderPicture src={picture.url} style={{ width: picture.size, height: picture.size, borderRadius: 999, objectFit: "cover", borderWidth: 3, borderColor: oscura ? "#ffffff" : c.tin }} />
	) : null;
	const ini = iniciales(basics.name);
	const fondoMono = v.arte === "orbita" ? "transparent" : oscura ? "rgba(255,255,255,0.18)" : c.p;
	const mono = (v.monograma || v.arte === "orbita") && !foto && ini ? (
		<View style={{ ...s.monograma, backgroundColor: fondoMono, borderWidth: oscura ? 1.5 : 0, borderColor: "#ffffff" }}>
			<PdfText style={{ fontSize: 17, color: "#ffffff", letterSpacing: 1, fontWeight: 700 }}>{ini}</PdfText>
		</View>
	) : null;

	const [nombre, apellidos] = partirNombre(basics.name);
	const nombreVisible = v.nombrePartido && apellidos ? (
		<Heading style={{ ...s.nombre, color: texto }}>
			{nombre} <PdfText style={{ color: acento }}>{apellidos}</PdfText>
		</Heading>
	) : (
		<Heading style={{ ...s.nombre, color: texto }}>{basics.name}</Heading>
	);
	const conMarcador = v.marcador ? (
		<View style={{ alignSelf: v.cabecera === "centrada" ? "center" : "flex-start" }}>
			<View style={{ position: "absolute", left: -5, right: -5, bottom: 2, height: "42%", backgroundColor: mezclar(c.a, "#ffffff", 0.45), borderRadius: 2 }} />
			{nombreVisible}
		</View>
	) : (
		nombreVisible
	);
	const identidad = (
		<View style={s.identidad}>
			{conMarcador}
			<Text style={{ color: oscura ? "rgba(255,255,255,0.88)" : c.p, letterSpacing: 0.6, textTransform: "uppercase", fontSize: 8.5 }}>{basics.headline}</Text>
		</View>
	);

	// La cabecera usa su propio juego de colores: texto blanco solo si va sobre color.
	const colores: TemplateColorRoles = { ...e.colors, sidebarForeground: texto, primary: oscura ? "#ffffff" : c.p };
	const envoltorio = (hijos: ReactNode, estilo: Style) => (
		<TemplateProvider pageNodeKey={pageNodeKey} styles={e.styles} colors={colores}>
			<SemanticHeaderView style={estilo}>
				<TemplatePlacementProvider placement="sidebar">{hijos}</TemplatePlacementProvider>
			</SemanticHeaderView>
		</TemplateProvider>
	);

	if (v.cabecera === "banda")
		return envoltorio(
			<>
				{foto ?? mono}
				<View style={s.titular}>
					{identidad}
					<Contactos estilo={s.contactos!} item={s.contacto!} />
				</View>
			</>,
			s.banda!,
		);
	if (v.cabecera === "centrada")
		return envoltorio(
			<>
				{foto ?? mono}
				{identidad}
				<Contactos estilo={s.contactosCentro!} item={s.contacto!} />
			</>,
			s.centrada!,
		);
	if (v.cabecera === "izquierda")
		return envoltorio(
			<>
				{foto ?? mono}
				<View style={s.titular}>
					{identidad}
					<Contactos estilo={s.contactos!} item={s.contacto!} />
				</View>
			</>,
			s.izquierda!,
		);
	return envoltorio(
		<>
			{foto ?? mono}
			{identidad}
			<Contactos estilo={s.contactosColumna!} item={s.contacto!} />
		</>,
		s.enLateral!,
	);
}

export function crearPagina(v: Variante) {
	return function PaginaCreativa({ page, pageSize, pageMinHeightStyle, showHeader, pageNumber }: TemplatePageProps) {
		const data = useRender();
		const pageNodeKey = semanticNodeKeys.page(pageNumber);
		const { style: semanticPageStyle, size: semanticPageSize, ...semanticPageProps } = useResolvedNode(pageNodeKey);
		const { metadata } = data;
		const e = usarVariante(v);
		const s = e.styles as unknown as Record<string, Style>;
		const metrics = getTemplateMetrics(metadata.page);
		const principales = useRenderedSectionIds(pageNodeKey, filterSections(page.main, data));
		const laterales = useRenderedSectionIds(pageNodeKey, filterSections(page.sidebar, data));
		const sinLateral = v.lateral === "ninguno" || page.fullWidth;
		const izquierda = v.lateral === "izquierda";
		const cuerpo = sinLateral ? [...principales, ...laterales] : principales;
		const enColumna = e.enColumna && !sinLateral;
		const cabeceraEnLateral = v.cabecera === "lateral" && !sinLateral;

		const [W, H] = typeof pageSize === "string" ? TAMANO_PAGINA[pageSize as keyof typeof TAMANO_PAGINA] ?? TAMANO_PAGINA.A4 : [pageSize.width, TAMANO_PAGINA.A4[1]];
		const anchoLateral = (W * metadata.layout.sidebarWidth) / 100;
		const arte = capasArte(
			v.arte,
			{
				W,
				H,
				c: e.c,
				hc: v.altoCabecera ?? 140,
				mx: metrics.page.paddingHorizontal + (v.sangriaCabecera ?? 0),
				// El fondo de la plantilla va en la página (bajo la decoración del cliente), no en el arte.
				fondo: null,
				...(enColumna ? { lat: { x: izquierda ? 0 : W - anchoLateral, w: anchoLateral, fondo: e.lateralFondo } } : {}),
			},
			showHeader,
		);

		const secciones = (ids: string[], lugar: "main" | "sidebar") => ids.map((sec) => <Section key={sec} section={sec} placement={lugar} />);

		let contenido: ReactNode;
		if (enColumna) {
			const lateral = (
				<SemanticRegionView
					region="sidebar"
					style={{ width: anchoLateral, paddingHorizontal: metrics.gapX(1.1), paddingTop: v.lateralArriba ?? 0, rowGap: metrics.sectionGap }}
				>
					{showHeader && cabeceraEnLateral && <Cabecera v={v} e={e} pageNodeKey={pageNodeKey} />}
					{secciones(laterales, "sidebar")}
				</SemanticRegionView>
			);
			const principal = (
				<SemanticRegionView region="main" style={composeStyles(s.columna, { paddingHorizontal: metrics.page.paddingHorizontal * 0.85, rowGap: metrics.sectionGap })}>
					{showHeader && !cabeceraEnLateral && <Cabecera v={v} e={e} pageNodeKey={pageNodeKey} />}
					{secciones(cuerpo, "main")}
				</SemanticRegionView>
			);
			contenido = izquierda ? (
				<>
					{lateral}
					{principal}
				</>
			) : (
				<>
					{principal}
					{lateral}
				</>
			);
		} else {
			const principal = (
				<SemanticRegionView region="main" style={composeStyles(s.columna, { rowGap: metrics.sectionGap })}>
					{secciones(cuerpo, "main")}
				</SemanticRegionView>
			);
			const lateral = sinLateral ? null : (
				<SemanticRegionView region="sidebar" style={composeStyles(s.lateralTarjeta, { width: `${metadata.layout.sidebarWidth}%`, rowGap: metrics.sectionGap })}>
					{secciones(laterales, "sidebar")}
				</SemanticRegionView>
			);
			contenido = (
				<>
					{showHeader && <Cabecera v={v} e={e} pageNodeKey={pageNodeKey} />}
					<View style={{ flexDirection: "row", columnGap: metrics.columnGap, alignItems: "stretch", flexGrow: 1 }}>
						{izquierda && lateral}
						{principal}
						{!izquierda && lateral}
					</View>
				</>
			);
		}

		return (
			<Page {...semanticPageProps} size={semanticPageSize ?? pageSize} style={composeStyles(e.styles.page, pageMinHeightStyle, semanticPageStyle)}>
				{arte}
				<TemplateProvider pageNodeKey={pageNodeKey} styles={e.styles} colors={e.colors}>
					{contenido}
				</TemplateProvider>
			</Page>
		);
	};
}
