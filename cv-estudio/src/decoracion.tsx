// Decoración de la plantilla personalizable: formas, sombreado y fondo en SVG vectorial
// (react-pdf), fijos en cada página y siempre detrás del texto.
// El estado se fija antes de cada render; los renders van en cola, nunca a la vez.
//
// La intensidad (0–1) cambia de verdad lo que se ve: escala el tamaño de las formas
// (0,7× → 1,3×) y su opacidad (de casi un susurro a un color franco). Cada forma se dibuja
// en coordenadas de «arriba a la derecha» y se refleja para «abajo» o «ambas».
import { createElement as h } from "react";
import { Circle, Defs, G, LinearGradient, Path, Polygon, Rect, Stop, Svg, Text, View } from "@react-pdf/renderer";

import { DECORACION_VACIA, FONDOS, FORMAS, POSICIONES, SOMBREADOS, type Decoracion, type Fondo, type Forma, type Posicion, type Sombreado } from "./catalogo-decoracion";
export { DECORACION_VACIA, FONDOS, FORMAS, POSICIONES, SOMBREADOS };
export type { Decoracion, Fondo, Forma, Posicion, Sombreado };

let actual: Decoracion = DECORACION_VACIA;
export const MARCA_POR_DEFECTO = "VISTA PREVIA";
let marca: string = MARCA_POR_DEFECTO;

const HEX = /^#[0-9a-f]{6}$/i;
const en = <T extends string>(v: unknown, tabla: Record<T, string>, defecto: T): T => (typeof v === "string" && v in tabla ? (v as T) : defecto);

/** Admite el estado antiguo (sombreado booleano, sin posición ni fondo) y sanea todo. */
export function normalizar(entrada: Partial<Record<keyof Decoracion, unknown>> | null | undefined): Decoracion {
	const e = entrada ?? {};
	const color = typeof e.color === "string" && HEX.test(e.color) ? e.color : DECORACION_VACIA.color;
	const antiguo = e.sombreado === true ? "cabecera" : e.sombreado === false ? "ninguno" : e.sombreado;
	return {
		forma: en(e.forma, FORMAS, "ninguna"),
		color,
		color2: typeof e.color2 === "string" && HEX.test(e.color2) ? e.color2 : color,
		intensidad: Math.min(1, Math.max(0, Number(e.intensidad) || 0)),
		posicion: en(e.posicion, POSICIONES, "ambas"),
		sombreado: en(antiguo, SOMBREADOS, "ninguno"),
		fondo: en(e.fondo, FONDOS, "blanco"),
	};
}

export function fijarCapas(decoracion: Partial<Record<keyof Decoracion, unknown>> | null | undefined, marcaAgua: string | null | undefined) {
	actual = normalizar(decoracion);
	// Nunca sin marca: el PDF limpio no sale del navegador.
	marca = String(marcaAgua ?? "").trim().slice(0, 60) || MARCA_POR_DEFECTO;
}

// Lienzo lógico A4 en puntos; el SVG se estira a la página real (A4 o carta).
const W = 595;
const H = 842;
const capa = { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 } as const;

type Pieza = ReturnType<typeof h>;
const poli = (k: string | number, pts: [number, number][], p: object) => h(Polygon, { key: k, points: pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" "), ...p });
const regular = (cx: number, cy: number, r: number, lados: number, giro = -Math.PI / 2): [number, number][] =>
	Array.from({ length: lados }, (_, i) => [cx + r * Math.cos(giro + (i * 2 * Math.PI) / lados), cy + r * Math.sin(giro + (i * 2 * Math.PI) / lados)]);

/**
 * Piezas de una forma en la esquina superior derecha (y, si hace falta, el borde superior).
 * `k` escala el tamaño; `o(x)` convierte una opacidad base en la real según la intensidad.
 */
function esquinaSuperior(f: Forma, c: string, c2: string, k: number, o: (x: number) => number): Pieza[] {
	const R = (n: number) => n * k;
	switch (f) {
		case "circulos":
			return [
				h(Circle, { key: 1, cx: W - R(20), cy: R(30), r: R(130), fill: c, fillOpacity: o(0.14) }),
				h(Circle, { key: 2, cx: W - R(135), cy: -R(10), r: R(70), fill: c2, fillOpacity: o(0.12) }),
				h(Circle, { key: 3, cx: W - R(60), cy: R(150), r: R(26), fill: "none", stroke: c, strokeWidth: 2, strokeOpacity: o(0.3) }),
			];
		case "burbujas":
			return [
				h(Circle, { key: 1, cx: W - R(50), cy: R(40), r: R(46), fill: c, fillOpacity: o(0.16) }),
				h(Circle, { key: 2, cx: W - R(120), cy: R(95), r: R(24), fill: c2, fillOpacity: o(0.18) }),
				h(Circle, { key: 3, cx: W - R(30), cy: R(120), r: R(14), fill: c2, fillOpacity: o(0.22) }),
				h(Circle, { key: 4, cx: W - R(170), cy: R(30), r: R(16), fill: "none", stroke: c, strokeWidth: 1.6, strokeOpacity: o(0.34) }),
				h(Circle, { key: 5, cx: W - R(95), cy: R(20), r: R(8), fill: c, fillOpacity: o(0.2) }),
			];
		case "rombos": {
			const rombo = (x: number, y: number, r: number, key: number, a: number, col: string, hueco = false) =>
				poli(key, [[x, y - r], [x + r, y], [x, y + r], [x - r, y]], hueco ? { fill: "none", stroke: col, strokeWidth: 1.6, strokeOpacity: o(a * 2) } : { fill: col, fillOpacity: o(a) });
			return [rombo(W - R(45), R(55), R(78), 1, 0.14, c), rombo(W - R(125), R(25), R(36), 2, 0.12, c2, true), rombo(W - R(40), R(150), R(24), 3, 0.18, c2)];
		}
		case "triangulos":
			return [
				poli(1, [[W - R(150), 0], [W, 0], [W, R(150)]], { fill: c, fillOpacity: o(0.16) }),
				poli(2, [[W - R(210), 0], [W - R(120), 0], [W - R(165), R(80)]], { fill: c2, fillOpacity: o(0.13) }),
				poli(3, [[W - R(60), R(160)], [W, R(160)], [W, R(230)]], { fill: c2, fillOpacity: o(0.12) }),
			];
		case "hexagonos":
			return [
				poli(1, regular(W - R(50), R(60), R(80)), { fill: c, fillOpacity: o(0.14) }),
				poli(2, regular(W - R(140), R(115), R(40)), { fill: "none", stroke: c2, strokeWidth: 1.8, strokeOpacity: o(0.4) }),
				poli(3, regular(W - R(150), R(30), R(24)), { fill: c2, fillOpacity: o(0.16) }),
			];
		case "destellos": {
			const estrella = (cx: number, cy: number, r: number, key: number, a: number, col: string) =>
				poli(key, [[cx, cy - r], [cx + r * 0.22, cy - r * 0.22], [cx + r, cy], [cx + r * 0.22, cy + r * 0.22], [cx, cy + r], [cx - r * 0.22, cy + r * 0.22], [cx - r, cy], [cx - r * 0.22, cy - r * 0.22]], { fill: col, fillOpacity: o(a) });
			return [estrella(W - R(70), R(70), R(60), 1, 0.2, c), estrella(W - R(150), R(40), R(22), 2, 0.26, c2), estrella(W - R(40), R(150), R(16), 3, 0.3, c2), estrella(W - R(135), R(130), R(11), 4, 0.3, c)];
		}
		case "arcos":
			return [0, 1, 2, 3, 4].map((i) => h(Circle, { key: i, cx: W, cy: 0, r: R(60 + i * 38), fill: "none", stroke: i % 2 ? c2 : c, strokeWidth: 2.4, strokeOpacity: o(0.34 - i * 0.04) }));
		case "ondas":
			return [
				h(Path, { key: 1, d: `M0 0 L ${W} 0 L ${W} ${R(60)} C ${W * 0.75} ${R(105)}, ${W * 0.55} ${R(10)}, ${W * 0.3} ${R(55)} S ${W * 0.05} ${R(70)}, 0 ${R(50)} Z`, fill: c, fillOpacity: o(0.14) }),
				h(Path, { key: 2, d: `M${W * 0.4} 0 L ${W} 0 L ${W} ${R(95)} C ${W * 0.85} ${R(55)}, ${W * 0.65} ${R(110)}, ${W * 0.4} ${R(30)} Z`, fill: c2, fillOpacity: o(0.12) }),
			];
		case "zigzag": {
			const paso = 22 * k;
			const pts: string[] = [];
			for (let i = 0, x = 0; x <= W + paso; i++, x += paso) pts.push(`${x.toFixed(1)} ${(i % 2 ? R(26) : R(8)).toFixed(1)}`);
			return [
				h(Path, { key: 1, d: `M${pts.join(" L ")}`, fill: "none", stroke: c, strokeWidth: 3, strokeOpacity: o(0.4) }),
				h(Path, { key: 2, d: `M${pts.map((p) => p.replace(/ (\S+)$/, (_, y) => ` ${(parseFloat(y) + R(12)).toFixed(1)}`)).join(" L ")}`, fill: "none", stroke: c2, strokeWidth: 2, strokeOpacity: o(0.28) }),
			];
		}
		case "puntos": {
			const puntos: Pieza[] = [];
			for (let i = 0; i < 7; i++)
				for (let j = 0; j < 7; j++) puntos.push(h(Circle, { key: `${i}-${j}`, cx: W - 24 - i * 13 * k, cy: 24 + j * 13 * k, r: 2.2 * k, fill: (i + j) % 3 === 0 ? c2 : c, fillOpacity: o(0.4) }));
			return puntos;
		}
		case "rayas":
			return Array.from({ length: 9 }, (_, i) => h(Path, { key: i, d: `M${W - R(170) + i * R(20)} 0 L ${W} ${R(170) - i * R(20)}`, stroke: i % 3 === 0 ? c2 : c, strokeWidth: 3.2, strokeOpacity: o(0.34) }));
		case "esquinas":
			return [
				poli(1, [[W - R(150), 0], [W, 0], [W, R(150)]], { fill: c, fillOpacity: o(0.17) }),
				poli(2, [[W - R(90), 0], [W, 0], [W, R(90)]], { fill: c2, fillOpacity: o(0.2) }),
			];
		case "diagonal":
			return [poli(1, [[0, 0], [W * 0.78, 0], [0, R(230)]], { fill: c, fillOpacity: o(0.13) }), poli(2, [[0, 0], [W * 0.45, 0], [0, R(120)]], { fill: c2, fillOpacity: o(0.15) })];
		case "bloque":
			return [h(Rect, { key: 1, x: 0, y: 0, width: W, height: R(115), fill: c, fillOpacity: o(0.17) }), h(Rect, { key: 2, x: 0, y: R(115), width: W, height: 4, fill: c2, fillOpacity: o(0.6) })];
		default:
			return [];
	}
}

function formas(d: Decoracion, o: (x: number) => number, k: number): Pieza[] {
	const { forma, color: c, color2: c2, posicion } = d;
	if (forma === "ninguna") return [];
	if (forma === "franja") return [h(Rect, { key: "f1", x: 0, y: 0, width: 8 * k + 4, height: H, fill: c, fillOpacity: o(0.8) }), h(Rect, { key: "f2", x: 8 * k + 4, y: 0, width: 3, height: H, fill: c2, fillOpacity: o(0.6) })];
	if (forma === "marco") {
		const m = 16 * k;
		return [
			h(Rect, { key: "m1", x: m, y: m, width: W - 2 * m, height: H - 2 * m, fill: "none", stroke: c, strokeWidth: 1.6 * k, strokeOpacity: o(0.5) }),
			h(Rect, { key: "m2", x: m + 6, y: m + 6, width: W - 2 * m - 12, height: H - 2 * m - 12, fill: "none", stroke: c2, strokeWidth: 0.8, strokeOpacity: o(0.4) }),
		];
	}
	const arriba = esquinaSuperior(forma, c, c2, k, o);
	const abajo = h(G, { key: "abajo", transform: `translate(${W} ${H}) scale(-1 -1)` }, ...esquinaSuperior(forma, c, c2, k, (x) => o(x * 0.85)));
	// Las que ocupan todo el ancho (ondas, bloque, zigzag) se reflejan solo en vertical.
	const abajoAncho = h(G, { key: "abajo", transform: `translate(0 ${H}) scale(1 -1)` }, ...esquinaSuperior(forma, c, c2, k, (x) => o(x * 0.85)));
	const ancha = forma === "ondas" || forma === "bloque" || forma === "zigzag";
	const espejo = ancha ? abajoAncho : abajo;
	if (posicion === "arriba") return arriba;
	if (posicion === "abajo") return [espejo];
	return [...arriba, espejo];
}

const FONDO_PLANO: Partial<Record<Fondo, string>> = { papel: "#fbf6ec", gris: "#f1f3f5" };

export function capaDecoracion() {
	const d = actual;
	if (d.forma === "ninguna" && d.sombreado === "ninguno" && d.fondo === "blanco") return null;
	const i = d.intensidad;
	const k = +(0.7 + i * 0.6).toFixed(3);
	const o = (x: number) => +Math.min(0.85, x * (0.55 + i * 1.9)).toFixed(3);
	const sombra = +(0.07 + i * 0.3).toFixed(3);
	const hijos: Pieza[] = [];
	const defs: Pieza[] = [];

	const plano = FONDO_PLANO[d.fondo];
	if (plano) hijos.push(h(Rect, { key: "fondo", x: 0, y: 0, width: W, height: H, fill: plano }));
	else if (d.fondo === "tinte") hijos.push(h(Rect, { key: "fondo", x: 0, y: 0, width: W, height: H, fill: d.color, fillOpacity: 0.06 + i * 0.06 }));

	const degradado = (id: string, x2: number, y2: number, y1 = 0, x1 = 0) =>
		h(LinearGradient, { key: id, id, x1, y1, x2, y2 }, h(Stop, { offset: 0, stopColor: d.color, stopOpacity: sombra }), h(Stop, { offset: 1, stopColor: d.color, stopOpacity: 0 }));
	if (d.sombreado === "cabecera" || d.sombreado === "ambos") {
		defs.push(degradado("s-arriba", 0, 1));
		hijos.push(h(Rect, { key: "s1", x: 0, y: 0, width: W, height: 330, fill: "url(#s-arriba)" }));
	}
	if (d.sombreado === "pie" || d.sombreado === "ambos") {
		defs.push(degradado("s-abajo", 0, 0, 1));
		hijos.push(h(Rect, { key: "s2", x: 0, y: H - 330, width: W, height: 330, fill: "url(#s-abajo)" }));
	}
	if (d.sombreado === "diagonal") {
		defs.push(degradado("s-diag", 1, 1));
		hijos.push(h(Rect, { key: "s3", x: 0, y: 0, width: W, height: H, fill: "url(#s-diag)" }));
	}

	hijos.push(...formas(d, o, k));
	return h(Svg, { fixed: true, style: capa, viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: "none" }, ...(defs.length ? [h(Defs, { key: "defs" }, ...defs)] : []), ...hijos);
}

export function capaMarcaAgua() {
	if (!marca) return null;
	const filas = [];
	// Mosaico mayor que la página (rotado) para que no quede ninguna esquina limpia.
	for (let i = 0; i < 14; i++)
		filas.push(
			h(Text, { key: i, style: { fontSize: 22, fontFamily: "Helvetica-Bold", color: "#000000", opacity: 0.08, marginBottom: 52, textAlign: "center" } }, `${marca}   ·   ${marca}   ·   ${marca}`),
		);
	return h(
		View,
		{ fixed: true, style: { ...capa, justifyContent: "center", alignItems: "center", overflow: "hidden" } },
		h(View, { style: { transform: "rotate(-32deg)", width: 1300, alignItems: "center" } }, ...filas),
	);
}
