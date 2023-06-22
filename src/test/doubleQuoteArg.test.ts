import { assertEquals } from '../../dev_deps/asserts.ts';
import { doubleQuoteArg } from '../doubleQuoteArg.ts';

Deno.test('doubleQuoteArg(): no special symbols', () => {
  assertEquals(
    doubleQuoteArg('zaoza'),
    '"zaoza"',
  );
});

Deno.test('doubleQuoteArg(): double quotes', () => {
  assertEquals(
    doubleQuoteArg('za"o"za'),
    '"za\\"o\\"za"',
  );
});

Deno.test('doubleQuoteArg(): single quotes', () => {
  assertEquals(
    doubleQuoteArg('za\'o\'za'),
    '"za\\\'o\\\'za"',
  );
});

Deno.test('doubleQuoteArg(): dollar sign', () => {
  assertEquals(
    doubleQuoteArg('$zaoza$'),
    '"\\\$zaoza\\\$"',
  );
});

Deno.test('doubleQuoteArg(): backslash', () => {
  assertEquals(
    doubleQuoteArg('zaoza\\'),
    '"zaoza\\\\"',
  );
});

Deno.test('doubleQuoteArg(): dollar sign: substitution disabled', () => {
  assertEquals(
    doubleQuoteArg('$za"oza$', {
      noEscapeDollarSign: true,
    }),
    '"\$za\\"oza\$"',
  );
});
