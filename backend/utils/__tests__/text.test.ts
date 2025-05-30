import { stripQuotes } from '../text';

describe('stripQuotes', () => {
  it('removes surrounding double quotes', () => {
    expect(stripQuotes('"hello"')).toBe('hello');
  });

  it('removes surrounding single quotes', () => {
    expect(stripQuotes("'world'")).toBe('world');
  });

  it('trims whitespace but keeps inner quotes', () => {
    expect(stripQuotes('  "hello world"  ')).toBe('hello world');
  });

  it('returns original string when no surrounding quotes', () => {
    expect(stripQuotes('foo')).toBe('foo');
  });
});
