// Arte vectorial de las plantillas creativas: cada una tiene su propio fondo (olas, burbujas,
// arcos, hexágonos, mosaico, diagonales, manchas, franjas, arco, rayas, pinceladas, píxeles,
// órbita y trazos) dibujado en SVG detrás del contenido. Se divide en dos capas:
// - fija: se repite en todas las páginas (columna lateral a toda altura, fondo de página);
// - cabecera: solo en la página con la cabecera (olas, diagonales…).
// Todo depende del color principal elegido, así que cualquier color queda coherente.
import type { ReactElement } from "react";
import { Circle, ClipPath, Defs, G, Line, LinearGradient, Path, Polygon, Rect, Stop, Svg, View } from "#react-pdf-renderer";

export type Arte =
	| "ola"
	| "burbujas"
	| "arcos"
	| "hexagonos"
	| "mosaico"
	| "diagonal"
	| "manchas"
	| "franja"
	| "arco"
	| "rayas"
	| "pinceladas"
	| "pixeles"
	| "orbita"
	| "trazos";

export type Paleta = {
	/** Principal. */
	p: string;
	/** Segundo acento: el principal girado en el círculo cromático. */
	a: string;
	osc: string;
	/** Tinte muy claro del principal. */
	tin: string;
	/** Tinte medio. */
	med: string;
};

export type Lienzo = {
	W: number;
	H: number;
	c: Paleta;
	/** Alto de la cabecera (pt) cuando la plantilla la tiene a todo el ancho. */
	hc: number;
	/** Columna lateral a toda altura: x y ancho en pt. */
	lat?: { x: number; w: number; fondo: string };
	/** Fondo de toda la página (null = blanco). */
	fondo?: string | null;
	/** Margen horizontal de la página. */
	mx: number;
};

// ---------- color ----------
const aRgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as [number, number, number];
const aHex = (r: number, g: number, b: number) => `#${[r, g, b].map((x) => Math.round(Math.max(0, Math.min(1, x)) * 255).toString(16).padStart(2, "0")).join("")}`;

function aHsl(hex: string): [number, number, number] {
	const [r, g, b] = aRgb(hex);
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const l = (max + min) / 2;
	if (max === min) return [0, 0, l];
	const d = max - min;
	const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
	const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
	return [h * 60, s, l];
}

function deHsl(h: number, s: number, l: number) {
	const f = (n: number) => {
		const k = (n + h / 30) % 12;
		const a = s * Math.min(l, 1 - l);
		return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
	};
	return aHex(f(0), f(8), f(4));
}

export const mezclar = (hex: string, con: string, t: number) => {
	const a = aRgb(hex);
	const b = aRgb(con);
	return aHex(...(a.map((x, i) => x + (b[i]! - x) * t) as [number, number, number]));
};

/** Paleta completa a partir del color principal. `giro`: grados del segundo acento. */
export function paleta(p: string, giro = 38): Paleta {
	const [h, s, l] = aHsl(p);
	const a = s < 0.12 ? mezclar(p, "#ffffff", 0.45) : deHsl((h + giro + 360) % 360, Math.max(s, 0.5), Math.min(Math.max(l, 0.42), 0.6));
	return { p, a, osc: mezclar(p, "#0b1020", 0.62), tin: mezclar(p, "#ffffff", 0.9), med: mezclar(p, "#ffffff", 0.62) };
}

// ---------- utilidades ----------
/** Pseudoaleatorio estable (mismo dibujo en cada render). */
const azar = (i: number) => {
	const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
	return x - Math.floor(x);
};
const hexagono = (cx: number, cy: number, r: number) =>
	Array.from({ length: 6 }, (_, i) => {
		const t = (Math.PI / 3) * i + Math.PI / 6;
		return `${(cx + r * Math.cos(t)).toFixed(1)},${(cy + r * Math.sin(t)).toFixed(1)}`;
	}).join(" ");

type Capas = { fija: ReactElement[]; cabecera: ReactElement[] };

const lateral = (L: Lienzo, k = "lat") => (L.lat ? [<Rect key={k} x={L.lat.x} y={0} width={L.lat.w} height={L.H} fill={L.lat.fondo} />] : []);

// ---------- cada arte ----------
const ARTES: Record<Arte, (L: Lienzo) => Capas> = {
	// Cabecera en degradado con borde inferior en ola doble.
	ola: ({ W, hc, c }) => ({
		fija: [],
		cabecera: [
			<Defs key="d">
				<LinearGradient id="olaG" x1="0" y1="0" x2="1" y2="1">
					<Stop offset="0" stopColor={c.osc} />
					<Stop offset="0.55" stopColor={c.p} />
					<Stop offset="1" stopColor={c.a} />
				</LinearGradient>
			</Defs>,
			<Path key="o2" d={`M0,0 H${W} V${hc + 6} C${W * 0.72},${hc + 40} ${W * 0.38},${hc - 22} 0,${hc + 22} Z`} fill={c.a} opacity={0.35} />,
			<Path key="o1" d={`M0,0 H${W} V${hc - 16} C${W * 0.7},${hc + 26} ${W * 0.34},${hc - 34} 0,${hc + 4} Z`} fill="url(#olaG)" />,
			<Circle key="c1" cx={W - 70} cy={hc * 0.3} r={46} fill="#ffffff" opacity={0.08} />,
			<Circle key="c2" cx={W - 140} cy={hc * 0.78} r={18} fill="#ffffff" opacity={0.1} />,
			<Circle key="c3" cx={W - 26} cy={hc * 0.85} r={9} fill="#ffffff" opacity={0.14} />,
		],
	}),

	// Columna lateral de color con burbujas superpuestas arriba y abajo.
	burbujas: (L) => {
		const { H, c } = L;
		const x = L.lat?.x ?? 0;
		const w = L.lat?.w ?? 180;
		return {
			fija: [
				...lateral(L),
				<Circle key="b1" cx={x + w * 0.92} cy={18} r={74} fill="#ffffff" opacity={0.1} />,
				<Circle key="b2" cx={x + w * 0.12} cy={120} r={44} fill={c.osc} opacity={0.22} />,
				<Circle key="b3" cx={x + w * 0.62} cy={150} r={14} fill="#ffffff" opacity={0.16} />,
				<Circle key="b4" cx={x + w * 0.15} cy={H - 40} r={86} fill={c.a} opacity={0.38} />,
				<Circle key="b5" cx={x + w * 0.85} cy={H - 110} r={30} fill="#ffffff" opacity={0.12} />,
				<Circle key="b6" cx={x + w * 0.7} cy={H - 18} r={12} fill={c.osc} opacity={0.25} />,
			],
			cabecera: [],
		};
	},

	// Arcos concéntricos en dos esquinas y un punto de acento.
	arcos: ({ W, H, c }) => ({
		fija: [
			...[70, 100, 130, 160].map((r, i) => <Circle key={`a${r}`} cx={0} cy={0} r={r} fill="none" stroke={i % 2 ? c.a : c.p} strokeWidth={1.4} opacity={0.55 - i * 0.1} />),
			...[70, 100, 130, 160].map((r, i) => <Circle key={`b${r}`} cx={W} cy={H} r={r} fill="none" stroke={i % 2 ? c.a : c.p} strokeWidth={1.4} opacity={0.55 - i * 0.1} />),
			<Circle key="s" cx={0} cy={0} r={46} fill={c.tin} />,
			<Circle key="t" cx={W} cy={H} r={46} fill={c.tin} />,
		],
		cabecera: [<Circle key="p" cx={W - 64} cy={58} r={5} fill={c.a} />],
	}),

	// Lateral oscuro en degradado con panal de hexágonos abajo.
	hexagonos: (L) => {
		const { H, c } = L;
		const x = L.lat?.x ?? 0;
		const w = L.lat?.w ?? 180;
		const celdas: ReactElement[] = [];
		const r = 15;
		for (let fila = 0; fila < 9; fila++)
			for (let col = 0; col < 8; col++) {
				const cx = x + col * r * 1.75 + (fila % 2 ? r * 0.87 : 0);
				const cy = H - fila * r * 1.5;
				if (cx > x + w + r) continue;
				const op = 0.32 - fila * 0.034;
				if (op <= 0.02) continue;
				const lleno = azar(fila * 9 + col) > 0.82;
				celdas.push(<Polygon key={`h${fila}-${col}`} points={hexagono(cx, cy, r - 1.5)} fill={lleno ? c.a : "none"} stroke="#ffffff" strokeWidth={0.8} opacity={lleno ? op * 1.6 : op} />);
			}
		return {
			fija: [
				<Defs key="d">
					<LinearGradient id="hexG" x1="0" y1="0" x2="0" y2="1">
						<Stop offset="0" stopColor={c.osc} />
						<Stop offset="1" stopColor={mezclar(c.osc, c.p, 0.45)} />
					</LinearGradient>
					<ClipPath id="hexC">
						<Rect x={x} y={0} width={w} height={H} />
					</ClipPath>
				</Defs>,
				<Rect key="l" x={x} y={0} width={w} height={H} fill="url(#hexG)" />,
				<G key="g" clipPath="url(#hexC)">
					{celdas}
				</G>,
			],
			cabecera: [],
		};
	},

	// Mosaico de triángulos en la esquina superior derecha.
	mosaico: ({ W, c }) => {
		const t: ReactElement[] = [];
		const s = 34;
		const tonos = [c.p, c.a, c.med, c.tin, c.osc];
		for (let fila = 0; fila < 5; fila++)
			for (let col = 0; col < 8; col++) {
				if (col < fila * 1.6) continue; // forma de escalera hacia la esquina
				const x = W - (col + 1) * s;
				const y = fila * s;
				const i = fila * 8 + col;
				const tono = tonos[Math.floor(azar(i) * tonos.length)]!;
				const op = 0.95 - fila * 0.15 - (col > 5 ? 0 : 0);
				const arriba = azar(i + 50) > 0.5;
				t.push(
					<Polygon key={`m${i}a`} points={arriba ? `${x},${y} ${x + s},${y} ${x + s},${y + s}` : `${x},${y} ${x + s},${y} ${x},${y + s}`} fill={tono} opacity={op} />,
					<Polygon key={`m${i}b`} points={arriba ? `${x},${y} ${x},${y + s} ${x + s},${y + s}` : `${x + s},${y} ${x + s},${y + s} ${x},${y + s}`} fill={tonos[Math.floor(azar(i + 99) * tonos.length)]!} opacity={op * 0.7} />,
				);
			}
		return { fija: [], cabecera: t.slice(0).reverse() };
	},

	// Cabecera cortada en diagonal con dos planos de color y un filete de acento.
	diagonal: ({ W, hc, c }) => ({
		fija: [],
		cabecera: [
			<Polygon key="f" points={`0,0 ${W},0 ${W},${hc - 30} 0,${hc + 18}`} fill={c.osc} />,
			<Polygon key="p" points={`${W * 0.48},0 ${W},0 ${W},${hc - 30} ${W * 0.3},${hc + 2}`} fill={c.p} opacity={0.9} />,
			<Polygon key="q" points={`${W * 0.78},0 ${W},0 ${W},${hc - 30} ${W * 0.66},${hc - 18}`} fill={c.a} opacity={0.85} />,
			<Line key="l" x1={0} y1={hc + 28} x2={W} y2={hc - 20} stroke={c.a} strokeWidth={2.5} />,
		],
	}),

	// Manchas orgánicas suaves en dos esquinas.
	manchas: ({ W, H, c }) => ({
		fija: [
			<Path key="b1" d={`M${W},${H} H${W - 210} C${W - 190},${H - 52} ${W - 240},${H - 118} ${W - 160},${H - 150} C${W - 96},${H - 176} ${W - 64},${H - 118} ${W},${H - 178} Z`} fill={c.tin} />,
			<Path key="b2" d={`M${W},${H} H${W - 120} C${W - 110},${H - 40} ${W - 130},${H - 70} ${W - 80},${H - 88} C${W - 40},${H - 100} ${W - 30},${H - 70} ${W},${H - 96} Z`} fill={c.a} opacity={0.28} />,
		],
		cabecera: [
			<Path key="a1" d="M0,0 H200 C178,46 222,96 150,130 C92,158 46,118 0,162 Z" fill={c.tin} />,
			<Path key="a2" d="M0,0 H118 C104,30 128,62 84,80 C50,94 26,72 0,96 Z" fill={c.a} opacity={0.3} />,
			<Circle key="d" cx={W - 80} cy={46} r={22} fill={c.tin} />,
			<Circle key="e" cx={W - 52} cy={74} r={8} fill={c.a} opacity={0.4} />,
		],
	}),

	// Franja vertical a toda altura + cuarto de círculo con anillo.
	franja: ({ W, H, c }) => ({
		fija: [
			<Rect key="f" x={0} y={0} width={14} height={H} fill={c.p} />,
			<Rect key="g" x={18} y={0} width={3} height={H} fill={c.a} />,
			<Circle key="q" cx={W} cy={H} r={130} fill={c.tin} />,
			<Circle key="r" cx={W} cy={H} r={168} fill="none" stroke={c.a} strokeWidth={1.5} opacity={0.6} />,
		],
		cabecera: [<Circle key="p" cx={W - 50} cy={52} r={28} fill={c.a} opacity={0.18} />, <Circle key="p2" cx={W - 50} cy={52} r={10} fill={c.p} />],
	}),

	// Columna lateral en forma de arco, con un sol en la cúpula.
	arco: (L) => {
		const { H, c } = L;
		const x = L.lat?.x ?? 0;
		const w = L.lat?.w ?? 180;
		const top = 22;
		const rad = w / 2;
		return {
			fija: [<Rect key="r" x={x} y={top + rad} width={w} height={H} fill={L.lat?.fondo ?? c.tin} />],
			cabecera: [
				<Path key="a" d={`M${x},${top + rad + 1} A${rad},${rad} 0 0 1 ${x + w},${top + rad + 1} Z`} fill={L.lat?.fondo ?? c.tin} />,
				<Circle key="s" cx={x + rad} cy={top + rad + 4} r={rad * 0.42} fill={c.a} opacity={0.32} />,
				<Circle key="s2" cx={x + rad} cy={top + rad + 4} r={rad * 0.24} fill={c.p} opacity={0.75} />,
				<Rect key="h" x={x + rad * 0.3} y={top + rad + 4} width={rad * 1.4} height={rad * 0.5} fill={L.lat?.fondo ?? c.tin} />,
				...[0, 1, 2].map((i) => <Rect key={`o${i}`} x={x + rad * (0.45 + i * 0.12)} y={top + rad + 12 + i * 8} width={rad * (1.1 - i * 0.24)} height={2} fill={c.p} opacity={0.5 - i * 0.12} />),
			],
		};
	},

	// Lateral oscuro con rayas diagonales arriba.
	rayas: (L) => {
		const { c } = L;
		const x = L.lat?.x ?? 0;
		const w = L.lat?.w ?? 180;
		const alto = 230;
		return {
			fija: lateral(L),
			cabecera: [
				<Defs key="d">
					<ClipPath id="rayC">
						<Polygon points={`${x},0 ${x + w},0 ${x + w},${alto * 0.55} ${x},${alto}`} />
					</ClipPath>
				</Defs>,
				<G key="g" clipPath="url(#rayC)">
					{Array.from({ length: 34 }, (_, i) => (
						<Line key={i} x1={x - 200 + i * 13} y1={alto} x2={x + i * 13} y2={0} stroke={i % 5 === 0 ? c.a : "#ffffff"} strokeWidth={i % 5 === 0 ? 3 : 1.2} opacity={i % 5 === 0 ? 0.7 : 0.13} />
					))}
				</G>,
			],
		};
	},

	// Pinceladas gruesas en la esquina, con salpicaduras.
	pinceladas: ({ W, H, c }) => ({
		fija: [<Path key="z" d={`M${W - 150},${H - 26} C${W - 110},${H - 50} ${W - 60},${H - 8} ${W - 22},${H - 34}`} stroke={c.a} strokeWidth={9} strokeLinecap="round" fill="none" opacity={0.45} />],
		cabecera: [
			<Path key="p1" d={`M${W - 250},${54} C${W - 190},${18} ${W - 120},${82} ${W - 36},${30}`} stroke={c.p} strokeWidth={17} strokeLinecap="round" fill="none" opacity={0.9} />,
			<Path key="p2" d={`M${W - 210},${86} C${W - 160},${62} ${W - 100},${104} ${W - 50},${74}`} stroke={c.a} strokeWidth={8} strokeLinecap="round" fill="none" opacity={0.75} />,
			...[
				[W - 268, 34, 4],
				[W - 24, 64, 5],
				[W - 74, 108, 3],
				[W - 284, 70, 2.5],
				[W - 30, 14, 3],
			].map(([cx, cy, r], i) => <Circle key={`s${i}`} cx={cx!} cy={cy!} r={r!} fill={i % 2 ? c.a : c.p} opacity={0.75} />),
		],
	}),

	// Lateral de color con píxeles que se disuelven y un racimo en la esquina.
	pixeles: (L) => {
		const { W, H, c } = L;
		const x = L.lat?.x ?? 0;
		const w = L.lat?.w ?? 180;
		const px: ReactElement[] = [];
		const s = 10;
		const filas = 14;
		for (let f = 0; f < filas; f++)
			for (let k = 0; k * (s + 3) < w; k++) {
				if (azar(f * 31 + k) > 0.15 + f * 0.06) continue;
				px.push(<Rect key={`p${f}-${k}`} x={x + k * (s + 3) + 2} y={H - (f + 1) * (s + 3)} width={s} height={s} fill={azar(f + k * 7) > 0.7 ? c.a : "#ffffff"} opacity={0.12 + (filas - f) * 0.022} />);
			}
		const racimo: ReactElement[] = [];
		for (let f = 0; f < 6; f++)
			for (let k = 0; k < 6; k++) {
				if (k + f > 6 || azar(f * 5 + k + 300) > 0.7) continue;
				racimo.push(<Rect key={`r${f}-${k}`} x={W - (k + 1) * 13} y={f * 13} width={10} height={10} fill={azar(f * 3 + k) > 0.5 ? c.p : c.a} opacity={0.85 - (k + f) * 0.11} />);
			}
		return { fija: [...lateral(L), ...px], cabecera: racimo };
	},

	// Planeta (círculo grande con la foto o iniciales) con órbita y satélite.
	orbita: ({ W, hc, mx, c }) => {
		const cx = mx + 24;
		const cy = hc / 2;
		const ang = -0.6;
		return {
			fija: [<Circle key="g" cx={W + 30} cy={-40} r={150} fill={c.tin} />],
			cabecera: [
				<Circle key="o" cx={cx} cy={cy} r={58} fill="none" stroke={c.a} strokeWidth={1.4} opacity={0.7} />,
				<Circle key="o2" cx={cx} cy={cy} r={78} fill="none" stroke={c.med} strokeWidth={0.8} strokeDasharray="3,4" />,
				<Circle key="p" cx={cx} cy={cy} r={38} fill={c.p} />,
				<Circle key="s" cx={cx + 58 * Math.cos(ang)} cy={cy + 58 * Math.sin(ang)} r={6} fill={c.a} />,
				<Circle key="s2" cx={cx + 78 * Math.cos(2.3)} cy={cy + 78 * Math.sin(2.3)} r={3.5} fill={c.p} opacity={0.6} />,
			],
		};
	},

	// Trazos curvos a mano alzada arriba y abajo de la hoja.
	trazos: ({ W, H, c }) => ({
		fija: [
			<Path key="b1" d={`M-10,${H - 30} C${W * 0.3},${H - 70} ${W * 0.55},${H + 6} ${W + 10},${H - 46}`} stroke={c.p} strokeWidth={2.5} fill="none" opacity={0.55} />,
			<Path key="b2" d={`M-10,${H - 18} C${W * 0.35},${H - 52} ${W * 0.6},${H + 14} ${W + 10},${H - 30}`} stroke={c.a} strokeWidth={1.4} fill="none" opacity={0.55} />,
		],
		cabecera: [
			<Path key="t1" d={`M-10,64 C${W * 0.22},8 ${W * 0.44},118 ${W * 0.68},44 S${W * 0.94},12 ${W + 10},52`} stroke={c.p} strokeWidth={3.2} fill="none" opacity={0.85} />,
			<Path key="t2" d={`M-10,78 C${W * 0.24},26 ${W * 0.46},128 ${W * 0.7},60 S${W * 0.95},28 ${W + 10},70`} stroke={c.a} strokeWidth={1.6} fill="none" opacity={0.8} />,
			<Path key="t3" d={`M-10,90 C${W * 0.26},42 ${W * 0.48},136 ${W * 0.72},74 S${W * 0.96},44 ${W + 10},86`} stroke={c.med} strokeWidth={0.9} fill="none" />,
		],
	}),
};

const capaSvg = (L: Lienzo, hijos: ReactElement[], fija: boolean, clave: string) =>
	hijos.length ? (
		<View key={clave} fixed={fija} style={{ position: "absolute", top: 0, left: 0, width: L.W, height: L.H }}>
			<Svg width={L.W} height={L.H} viewBox={`0 0 ${L.W} ${L.H}`}>
				{hijos}
			</Svg>
		</View>
	) : null;

/** Capas de arte de una plantilla. `conCabecera`: esta página lleva la cabecera. */
export function capasArte(arte: Arte | undefined, L: Lienzo, conCabecera: boolean) {
	const fondo = L.fondo ? [<Rect key="fondo" x={0} y={0} width={L.W} height={L.H} fill={L.fondo} />] : [];
	const capas = arte ? ARTES[arte](L) : { fija: lateral(L), cabecera: [] };
	return (
		<>
			{capaSvg(L, [...fondo, ...capas.fija], true, "arte-fija")}
			{conCabecera ? capaSvg(L, capas.cabecera, false, "arte-cabecera") : null}
		</>
	);
}
