import { trim } from '../deps/lodash.ts';

export class CurlHeader {
  name: string;
  lowercaseName: string;
  value: string;

  constructor(curlHeaderString: string) {
    [this.name, this.value] = curlHeaderString.split(/:(.*)/s);

    this.lowercaseName = this.name.toLowerCase();
  }

  toString() {
    const {name, value} = this;

    return `${name}:${value}`;
  }
}