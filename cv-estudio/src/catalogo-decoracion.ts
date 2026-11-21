// Catálogo de la decoración de la plantilla personalizable: datos puros (sin react-pdf), para que
// el motor y la página /servicios/cv compartan las mismas opciones.

export const FORMAS = {
	ninguna: "Sin formas",
	circulos: "Círculos",
	burbujas: "Burbujas",
	rombos: "Rombos",
	triangulos: "Triángulos",
	hexagonos: "Hexágonos",
	destellos: "Destellos",
	arcos: "Arcos",
	ondas: "Ondas",
	zigzag: "Zigzag",
	puntos: "Puntos",
	rayas: "Rayas",
	esquinas: "Esquinas",
	diagonal: "Diagonal",
	bloque: "Banda de color",
	franja: "Franja lateral",
	marco: "Marco",
} as const;
export type Forma = keyof typeof FORMAS;

export const POSICIONES = { arriba: "Arriba", abajo: "Abajo", ambas: "Arriba y abajo" } as const;
export type Posicion = keyof typeof POSICIONES;

export const SOMBREADOS = {
	ninguno: "Sin sombreado",
	cabecera: "Cabecera",
	pie: "Pie",
	ambos: "Cabecera y pie",
	diagonal: "Diagonal",
} as const;
export type Sombreado = keyof typeof SOMBREADOS;

export const FONDOS = { blanco: "Blanco", papel: "Papel", gris: "Gris suave", tinte: "Tinte de tu color" } as const;
export type Fondo = keyof typeof FONDOS;

export type Decoracion = {
	forma: Forma;
	/** Color principal, en #rrggbb. */
	color: string;
	/** Color de acento (algunas piezas de cada forma); si falta, el principal. */
	color2: string;
	/** Intensidad de 0 a 1: tamaño y opacidad de las formas y del sombreado. */
	intensidad: number;
	posicion: Posicion;
	sombreado: Sombreado;
	fondo: Fondo;
};

export const DECORACION_VACIA: Decoracion = {
	forma: "ninguna",
	color: "#176b5a",
	color2: "#176b5a",
	intensidad: 0.5,
	posicion: "ambas",
	sombreado: "ninguno",
	fondo: "blanco",
};
