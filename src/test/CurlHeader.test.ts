import {
  assertEquals,
  assertObjectMatch,
} from '../../dev_deps/asserts.ts';
import { CurlHeader } from '../CurlHeader.ts';

Deno.test('CurlHeader: content-type', () => {
  const input =
    `content-type: application/x-www-form-urlencode`;

  const obj = new CurlHeader(input);

  const parts: Partial<CurlHeader> = {
    name: 'content-type',
    value: 'application/x-www-form-urlencode',
  };

  assertObjectMatch(obj, parts);

  assertEquals(`${obj}`, input);
});

Deno.test('CurlHeader: authorization bearer', () => {
  const input =
    `authorization:Bearer some_heavily_encoded_bearer`;
  const output = `authorization: Bearer $AUTH_TOKEN`;

  const obj = new CurlHeader(input, {
    replaceAuthTokenWithVariable: true,
  });

  const parts: Partial<CurlHeader> = {
    authTokenValue: 'some_heavily_encoded_bearer',
    name: 'authorization',
    value: 'Bearer $AUTH_TOKEN',
  };

  assertObjectMatch(
    obj,
    parts,
  );

  assertEquals(`${obj}`, output);
});

Deno.test('CurlHeader: authorization non-bearer', () => {
  const input =
    `authorization: SAPISIDHASH 1687505148_e96d6ed1cdc3b700d8d56094325729ba1754d9c9`;

  const obj = new CurlHeader(input, {
    replaceAuthTokenWithVariable: true,
  });

  const parts: Partial<CurlHeader> = {
    name: 'authorization',
    value:
      'SAPISIDHASH 1687505148_e96d6ed1cdc3b700d8d56094325729ba1754d9c9',
  };

  assertObjectMatch(obj, parts);

  assertEquals(`${obj}`, input);
});
