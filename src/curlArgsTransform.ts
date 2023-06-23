import { trim } from '../deps/lodash.ts';
import {
  CurlHeader,
  CurlHeaderOptions,
} from './CurlHeader.ts';
import { doubleQuoteArg } from './doubleQuoteArg.ts';
import * as shellQuote from '../deps/shell-quote.ts';

export type CurlArgsTransformArgs =
  & Pick<CurlHeaderOptions, 'replaceAuthTokenWithVariable'>
  & {
    cutDuplicateHeaders?: boolean;
    cutArgs?: string[];

    /** in lowercase */
    cutHeaders?: string[];
  };

export const CURL_ARGS_TRANSFORM_ARGS_DEFAULT: Required<
  CurlArgsTransformArgs
> = {
  cutDuplicateHeaders: true,
  cutArgs: ['compressed'],
  cutHeaders: [
    'sec-ch-ua',
    'sec-ch-ua-arch',
    'sec-ch-ua-bitness',
    'sec-ch-ua-full-version',
    'sec-ch-ua-full-version-list',
    'sec-ch-ua-mobile',
    'sec-ch-ua-model',
    'sec-ch-ua-model;',
    'sec-ch-ua-platform',
    'sec-ch-ua-platform-version',
    'sec-ch-ua-wow64',
    'sec-fetch-dest',
    'sec-fetch-mode',
    'sec-fetch-site',
    'uber-trace-id',
    'user-agent',
    'x-requested-with',
    'x-user-agent',
    // TODO probably make ability to enable these more useful headers
    'accept',
    'accept-language',
    'authority',
    'cache-control',
    'pragma',
    'origin',
    'referer',
    'x-origin',
  ],
  replaceAuthTokenWithVariable: true,
};

function hyphens(flagName: string) {
  return (flagName.length > 1) ? '--' : '-';
}

export function curlArgsTransform(
  curlCommandString: string,
  args: CurlArgsTransformArgs = {},
) {
  const {
    cutArgs,
    cutDuplicateHeaders,
    cutHeaders,
    replaceAuthTokenWithVariable,
  } = {
    ...CURL_ARGS_TRANSFORM_ARGS_DEFAULT,
    ...args,
  };

  const curlCommandStringWithoutReturns = curlCommandString
    .replace(
      /\\[\n\r]+/gm,
      ' ',
    );

  const argsList = shellQuote.parse(
    curlCommandStringWithoutReturns,
  );

  const restArgs = [...argsList];
  const cmd = restArgs.shift();

  const headers: CurlHeader[] = [];
  const lowercaseHeadersNames: string[] = [];

  const positionalArgs = [];
  const keyArgs: { [key: string]: string } = {};

  const curlHeaderOptions: CurlHeaderOptions = {
    replaceAuthTokenWithVariable,
  };

  let authTokenValue = '';

  while (restArgs.length) {
    const arg = restArgs.shift();

    if (arg[0] !== '-') {
      positionalArgs.push(arg);
      continue;
    }

    const argNameTrimmed = trim(arg, '-', null);

    let argValue = '';

    if (restArgs.length) {
      argValue = restArgs.shift();

      if (argValue[0] == '-') {
        restArgs.unshift(argValue);
        argValue = '';
      }
    }

    switch (argNameTrimmed) {
      case 'H':
      case 'header': {
        const headerObject = new CurlHeader(
          argValue,
          curlHeaderOptions,
        );
        const headerLowercaseName =
          headerObject.lowercaseName;
        if (
          cutDuplicateHeaders &&
          lowercaseHeadersNames.includes(
            headerLowercaseName,
          )
        ) {
          continue;
        }
        if (cutHeaders.includes(headerLowercaseName)) {
          continue;
        }
        if (headerObject.hasAuthToken) {
          authTokenValue = headerObject.authTokenValue;
        }
        lowercaseHeadersNames.push(headerLowercaseName);
        headers.push(headerObject);
        break;
      }
      default:
        if (cutArgs.includes(argNameTrimmed)) {
          continue;
        }

        keyArgs[argNameTrimmed] = argValue;
    }
  }

  const S = ' \\\n  ';
  const H = `${S}-H `;

  const headersText = `${H}${
    headers.map(
      (h) =>
        doubleQuoteArg(`${h}`, {
          noEscapeDollarSign: h.withVariable,
        }),
    ).join(H)
  }`;

  const keyArgsText = Object.entries(keyArgs).map(
    ([key, value]) => {
      const argValueText = value
        ? ` ${doubleQuoteArg(value)}`
        : '';
      return `${hyphens(key)}${key}${argValueText}`;
    },
  ).join(S);
  const positionalArgsText = positionalArgs.map((a) =>
    doubleQuoteArg(a)
  ).join(
    S,
  );

  const codeLines: string[] = [];

  if (replaceAuthTokenWithVariable && authTokenValue) {
    codeLines.push(
      `export AUTH_TOKEN=${doubleQuoteArg(authTokenValue)}`,
    );
  }

  const codeLinesText = codeLines.length
    ? `${codeLines.join('\n')}\n\n`
    : '';

  return `${codeLinesText}${cmd}${S}${positionalArgsText}${S}${keyArgsText}${headersText}`;
}
