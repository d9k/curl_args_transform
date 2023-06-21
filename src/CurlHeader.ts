import { trim } from '../deps/lodash.ts';

export class CurlHeader {
  name: string;
  value: string;
  quote = `"`;

  constructor(curlHeaderString: string) {
    this.quote = [`'`, '"'].includes(curlHeaderString[0]) ? curlHeaderString[0] : ``;

    const unquoted = this.quote ? trim(curlHeaderString, this.quote, null) : curlHeaderString;

    [this.name, this.value] = unquoted.split(/:(.*)/s);
  }

  toString() {
    const {quote, name, value} = this;

    return `${quote}${name}:${value}${quote}`;
  }
}