import type { Variante } from "./fabrica";

// Catorce plantillas creativas del estudio, cada una con su dibujo SVG (arte.tsx), su forma
// de cabecera, títulos y niveles. El id es el que ve el motor; nombre y descripción están en
// src/adoptado/templates.ts.
export const VARIANTES: Record<string, Variante> = {
	aurora: { cabecera: "banda", bandaArte: "claro", arte: "ola", altoCabecera: 150, lateral: "derecha", fondoLateral: "tinte", titulos: "pastilla", monograma: true, nivel: "progress-bar" },
	coral: { cabecera: "lateral", columna: true, lateral: "izquierda", fondoLateral: "primario", arte: "burbujas", titulos: "marcador", nombrePartido: true, monograma: true, lateralArriba: 8, nivel: "rectangle-full", giro: 24 },
	lienzo: { cabecera: "centrada", arte: "arcos", altoCabecera: 170, lateral: "ninguno", fondoLateral: "tinte", fondoPagina: "crema", titulos: "doble", monograma: true, nombre: 1.8, nivel: "circle" },
	nocturno: { cabecera: "lateral", columna: true, lateral: "izquierda", fondoLateral: "oscuro", arte: "hexagonos", titulos: "barra", nombrePartido: true, lateralArriba: 8, nivel: "progress-bar" },
	mosaico: { cabecera: "izquierda", arte: "mosaico", altoCabecera: 130, lateral: "ninguno", fondoLateral: "tinte", titulos: "etiqueta", tarjetas: true, monograma: true, fondoPagina: "tinte", nivel: "square", giro: 60 },
	prisma: { cabecera: "banda", bandaArte: "claro", arte: "diagonal", altoCabecera: 150, lateral: "izquierda", fondoLateral: "tinte", titulos: "subrayado", nombrePartido: true, nivel: "rectangle" },
	brisa: { cabecera: "centrada", arte: "manchas", altoCabecera: 165, lateral: "izquierda", fondoLateral: "tinte", titulos: "pastilla", monograma: true, nivel: "circle", giro: 70 },
	vertice: { cabecera: "izquierda", arte: "franja", altoCabecera: 150, lateral: "ninguno", fondoLateral: "tinte", titulos: "barra", nombre: 2.1, nombrePartido: true, nivel: "rectangle-full" },
	oasis: { cabecera: "izquierda", columna: true, lateral: "derecha", fondoLateral: "tinte", arte: "arco", titulos: "punteado", monograma: true, lateralArriba: 110, nivel: "progress-bar", giro: 90 },
	zafiro: { cabecera: "lateral", columna: true, lateral: "derecha", fondoLateral: "oscuro", arte: "rayas", titulos: "mayusculas", lateralArriba: 14, nivel: "rectangle-full" },
	tinta: { cabecera: "izquierda", arte: "pinceladas", altoCabecera: 140, lateral: "derecha", fondoLateral: "tinte", titulos: "marcador", marcador: true, nombre: 1.9, nivel: "square", giro: 150 },
	pixel: { cabecera: "lateral", columna: true, lateral: "izquierda", fondoLateral: "primario", arte: "pixeles", titulos: "etiqueta", monograma: true, lateralArriba: 8, nivel: "square", giro: 180 },
	cometa: { cabecera: "banda", bandaArte: "oscuro", arte: "orbita", altoCabecera: 140, sangriaCabecera: 20, lateral: "derecha", fondoLateral: "tinte", titulos: "subrayado", nombrePartido: true, nivel: "progress-bar", giro: 200 },
	trazo: { cabecera: "centrada", arte: "trazos", altoCabecera: 160, lateral: "ninguno", fondoLateral: "tinte", titulos: "pastilla", nombre: 1.8, marcador: true, nivel: "circle", giro: 120 },
};
export const IDS_CREATIVOS = Object.keys(VARIANTES);
