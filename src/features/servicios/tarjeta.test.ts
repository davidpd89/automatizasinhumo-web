import { describe, expect, it } from 'vitest';
import { GUIA_CV, PASOS_CV } from './cv';
import { MODELOS_TARJETA, coloresTarjeta } from './modelosTarjeta';
import { validarTarjeta } from './publicados';

const base = { nombre: 'Marta Ruiz', email: 'marta@correo.es' };

describe('validarTarjeta: modelo y QR', () => {
  it('sin modelo ni qr usa la clásica con QR', () => {
    const r = validarTarjeta(base);
    expect(r.ok && r.datos.modelo).toBe('clasica');
    expect(r.ok && r.datos.qr).toBe(true);
  });
  it('acepta cada modelo del catálogo y rechaza los desconocidos', () => {
    for (const m of MODELOS_TARJETA) {
      const r = validarTarjeta({ ...base, modelo: m.id });
      expect(r.ok && r.datos.modelo).toBe(m.id);
    }
    const r = validarTarjeta({ ...base, modelo: '<script>' });
    expect(r.ok && r.datos.modelo).toBe('clasica');
  });
  it('qr solo se desactiva con false explícito', () => {
    const r = validarTarjeta({ ...base, qr: false });
    expect(r.ok && r.datos.qr).toBe(false);
  });
});

describe('coloresTarjeta', () => {
  it('texto blanco sobre acento oscuro y oscuro sobre acento claro', () => {
    expect(coloresTarjeta('#176b5a').sobre).toBe('#ffffff');
    expect(coloresTarjeta('#fde047').sobre).toBe('#111827');
  });
  it('el segundo tono del degradado es siempre #rrggbb', () => {
    for (const c of ['#000000', '#ffffff', '#c2410c']) expect(coloresTarjeta(c).acento2).toMatch(/^#[0-9a-f]{6}$/);
  });
});

describe('guía del estudio', () => {
  it('cada paso del estudio tiene guía y cada ventanita tiene título y texto', () => {
    for (const p of PASOS_CV) expect(GUIA_CV[p.id]?.length, p.id).toBeGreaterThan(0);
    for (const pasos of Object.values(GUIA_CV)) for (const g of pasos) expect(g.guia && g.titulo && g.texto).toBeTruthy();
  });
});
