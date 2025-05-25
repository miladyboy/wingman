import { filterThreadsByName } from '../threadUtils';

describe('filterThreadsByName', () => {
  const threads = [
    { id: 1, name: 'First Chat' },
    { id: 2, name: 'Second Chat' },
    { id: 3, name: 'Another Thread' },
    { id: 4, name: 'Chat with AI' },
    { id: 5, name: '' },
    { id: 6 },
  ];

  it('devuelve todos los threads si la query está vacía', () => {
    expect(filterThreadsByName(threads, '')).toEqual(threads);
    expect(filterThreadsByName(threads, '   ')).toEqual(threads);
  });

  it('filtra por coincidencia parcial, sin distinguir mayúsculas/minúsculas', () => {
    expect(filterThreadsByName(threads, 'chat')).toEqual([
      threads[0], threads[1], threads[3]
    ]);
    expect(filterThreadsByName(threads, 'CHAT')).toEqual([
      threads[0], threads[1], threads[3]
    ]);
    expect(filterThreadsByName(threads, 'first')).toEqual([
      threads[0]
    ]);
    expect(filterThreadsByName(threads, 'another')).toEqual([
      threads[2]
    ]);
  });

  it('devuelve un array vacío si no hay coincidencias', () => {
    expect(filterThreadsByName(threads, 'nope')).toEqual([]);
  });

  it('maneja entradas inválidas', () => {
    expect(filterThreadsByName(null, 'chat')).toBe(null);
    expect(filterThreadsByName(undefined, 'chat')).toBe(undefined);
    expect(filterThreadsByName(threads, null)).toBe(threads);
    expect(filterThreadsByName(threads, undefined)).toBe(threads);
  });

  it('ignora threads sin nombre', () => {
    expect(filterThreadsByName([{ id: 1 }, { id: 2, name: 'Test' }], 'test')).toEqual([
      { id: 2, name: 'Test' }
    ]);
  });
}); 