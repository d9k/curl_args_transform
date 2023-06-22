import * as shellQuote from 'npm:shell-quote@1.8.1';

import { trim } from '../deps/lodash.ts';
import { CurlHeader } from './CurlHeader.ts';

export type CurlArgsTransformArgs = {
    cutDuplicateHeaders?: boolean;
    cutArgs?: string[];

    /** in lowercase */
    cutHeaders?: string[];
}

export const CURL_ARGS_TRANSFORM_ARGS_DEFAULT: Required<CurlArgsTransformArgs> = {
    cutDuplicateHeaders: true,
    cutArgs: ['compressed'],
    cutHeaders: [
        'sec-ch-ua',
        'sec-ch-ua-mobile',
        'sec-ch-ua-platform',
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
    ],
};

/** https://stackoverflow.com/a/7685469/1760643 */
function quoteArg (cmd: string) {
    return '"'+cmd.replace(/(["'$`\\])/g,'\\$1')+'"';
}

function hyphens(flagName: string) {
    return (flagName.length > 1) ? '--' : '-';
}

export function curlArgsTransform (curlCommandString: string, args: CurlArgsTransformArgs = {})  {
    const { cutDuplicateHeaders, cutHeaders, cutArgs } = {
        ...CURL_ARGS_TRANSFORM_ARGS_DEFAULT,
        ...args
    };

    const curlCommandStringWithoutReturns = curlCommandString.replace(/\\[\n\r]+/gm, " ")

    const argsList = shellQuote.parse(curlCommandStringWithoutReturns);

    const restArgs= [...argsList];
    const cmd = restArgs.shift();

    const headers: CurlHeader[] = [];
    const lowercaseHeadersNames: string[] = [];

    const positionalArgs = [];
    const keyArgs: {[key: string]: string} = {};

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
                const headerObject = new CurlHeader(argValue);
                const headerLowercaseName = headerObject.lowercaseName;
                if (cutDuplicateHeaders && lowercaseHeadersNames.includes(headerLowercaseName)) {
                    continue;
                }
                if (cutHeaders.includes(headerLowercaseName)) {
                    continue;
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

    const S = " \\\n  ";
    const H = `${S}-H `;

    // TODO escape
    // TODO long keys => --
    const headersText = `${H}${headers.map((h) => quoteArg(`${h}`)).join(H)}`;
    const keyArgsText = Object.entries(keyArgs).map(
        ([key, value]) => {
            const argValueText = value ? ` ${quoteArg(value)}` : '';
            return `${hyphens(key)}${key}${argValueText}`;
        }
    ).join(S);
    const positionalArgsText = positionalArgs.map(quoteArg).join(S);

    return `${cmd}${S}${positionalArgsText}${S}${keyArgsText}${headersText}`;
}