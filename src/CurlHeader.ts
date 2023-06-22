import { boolean } from 'https://deno.land/x/cliffy@v0.25.4/flags/types/boolean.ts';
import { trim } from '../deps/lodash.ts';
import startsWith from 'https://raw.githubusercontent.com/lodash/lodash/4.17.21-es/startsWith.js';

export type CurlHeaderOptions = {
  replaceAuthTokenWithVariable?: boolean;
};

export class CurlHeader {
  hasAuthToken?: boolean;
  name: string;
  lowercaseName: string;
  value: string;
  curlHeaderOptions: CurlHeaderOptions;
  authTokenValue = '';
  withVariable = false;

  constructor(
    curlHeaderString: string,
    curlHeaderOptions: CurlHeaderOptions = {},
  ) {
    this.curlHeaderOptions = curlHeaderOptions;

    [this.name, this.value] = curlHeaderString.split(
      /:(.*)/s,
    ).map((el) => trim(el, ' ', null));

    const { replaceAuthTokenWithVariable } =
      curlHeaderOptions;

    this.lowercaseName = this.name.toLowerCase();

    if (this.lowercaseName === 'authorization') {
      if (this.value.startsWith('Bearer')) {
        this.hasAuthToken = true;
        this.authTokenValue = this.value.replace(
          /^Bearer\s+/,
          '',
        );
      }
    }

    if (replaceAuthTokenWithVariable) {
      if (this.lowercaseName === 'authorization') {
        this.withVariable = true;
        this.value = 'Bearer $AUTH_TOKEN';
      }
    }
  }

  toString() {
    const { name, value } = this;

    return `${name}: ${value}`;
  }
}
