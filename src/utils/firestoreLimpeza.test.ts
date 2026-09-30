import { describe, it, expect } from 'vitest';
import { removeUndefinedFields } from './firestoreLimpeza';

describe('removeUndefinedFields', () => {
  it('remove undefined do primeiro nível', () => {
    expect(removeUndefinedFields({ a: 1, b: undefined })).toEqual({ a: 1 });
  });

  it('remove undefined dentro de objetos e listas aninhados', () => {
    const r = removeUndefinedFields({
      terceiros: [{ plate: 'AAA1A11', document: undefined }, { plate: 'BBB2B22' }],
      meta: { x: undefined, y: 2 },
    });
    expect(r).toEqual({ terceiros: [{ plate: 'AAA1A11' }, { plate: 'BBB2B22' }], meta: { y: 2 } });
  });

  it('mantém null, zero, false e texto vazio', () => {
    expect(removeUndefinedFields({ a: null, b: 0, c: false, d: '' })).toEqual({ a: null, b: 0, c: false, d: '' });
  });

  it('não mexe em datas', () => {
    const d = new Date('2026-01-01');
    const r = removeUndefinedFields({ quando: d });
    expect(r.quando).toBe(d);
  });
});
