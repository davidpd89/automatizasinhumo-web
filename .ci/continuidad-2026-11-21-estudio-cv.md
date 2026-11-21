# Continuidad 2026-11-21 · Estudio de CV (diseño, guía, tarjeta)

Rama `cv-decoracion` · PR #140 (apilada sobre #139).

## Cambios
- Diseño y estilo en un solo paso con ejemplo; 25 plantillas (10 creativas nuevas con fábrica `cv-estudio/vendor/pdf/templates/creativos/`); personalización (colores, formas, intensidad, posición, sombreado, fondo).
- Límites de contenido (`LIMITES_CV`): máximo de filas por lista, contadores y tope de líneas.
- Guía con ventanitas (Driver.js) por paso: `GUIA_CV` en `cv.ts`, `guiaCv.ts`, aviso la primera vez y botón «Guía de este paso».
- Tarjeta digital: configurador en el paso Descarga al marcar el extra (6 modelos, color, QR opcional, vista en vivo, borrador guardado); se publica al pagar. Maqueta única `TarjetaDigital.astro` + `tarjeta-digital.css`, usada también por `/c/<slug>`. `validarTarjeta` admite `modelo` y `qr`.

## Verificado
- `astro check` sin errores en lo tocado; vitest `src/features/servicios` 6/6; `check-tokens-diseno` ok.
- Playwright local (puerto 4399): guía (6 ventanitas en diseño), límites (6 experiencias → «Añadir» oculto; 8 líneas → 6), configurador de tarjeta (modelos, color, QR, persistencia tras recargar), página pública `/c/<slug>` con modelo oscuro. Sin errores de consola.

## Pendiente
- CI/CodeRabbit/Codex del último commit (d69c777); fusionar #139 y luego #140 en serie (update-branch de uno en uno) y revisar baseline qa-visual en staging.
- Probar a mano: publicar la tarjeta tras un pago real de prueba; móvil del paso 1; migración de localStorage antiguo.
- Al final (diferido): precios «desde» de portada, galería de demos, FAQ, textos de pie, plantillas web y extras automáticos.
- Ruido: hay 11 informes `.ci/continuidad-*` sin añadir al repo.

## Procesos
- Servidor wrangler local (4399) cerrado al terminar; Edge 9241 no está en uso.

## Prompt para seguir
«Continúa en C:\GIT\automatizasinhumo, rama cv-decoracion (PR #140): lee .ci/continuidad-2026-11-21-estudio-cv.md, comprueba CI y comentarios, fusiona #139 y #140 en serie y prueba la publicación de la tarjeta con un pedido de prueba.»
