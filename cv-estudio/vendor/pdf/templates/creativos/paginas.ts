import type { TemplatePage } from "../../document";
import { crearPagina } from "./fabrica";
import { VARIANTES } from "./variantes";

export const paginasCreativas: Record<string, TemplatePage> = Object.fromEntries(
	Object.entries(VARIANTES).map(([id, v]) => [id, crearPagina(v)]),
);
