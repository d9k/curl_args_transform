import * as shellQuote from 'npm:shell-quote@1.8.1';

import { trim } from '../deps/lodash.ts';
import { CurlHeader } from './CurlHeader.ts';

export type CurlArgsTransformArgs = {
    cutDuplicateHeaders?: boolean;

    /** in lowercase */
    cutHeaders?: string[];
}

export const CURL_ARGS_TRANSFORM_ARGS_DEFAULT: Required<CurlArgsTransformArgs> = {
    cutDuplicateHeaders: true,
    cutHeaders: ['x-user-agent', 'uber-trace-id'],
};

/** https://stackoverflow.com/a/7685469/1760643 */
function quoteArg (cmd: string) {
    return '"'+cmd.replace(/(["'$`\\])/g,'\\$1')+'"';
}

function hyphens(flagName: string) {
    return (flagName.length > 1) ? '--' : '-';
}

export function curlArgsTransform (curlCommandString: string, args: CurlArgsTransformArgs = {})  {
    const { cutDuplicateHeaders, cutHeaders } = {
        ...CURL_ARGS_TRANSFORM_ARGS_DEFAULT,
        ...args
    };

    const argsList = shellQuote.parse(curlCommandString);

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

        const argTrimmed = trim(arg, '-', null);
        let argValue = restArgs.shift();

        if (argValue[0] == '-') {
            restArgs.unshift(argValue);
            argValue = '';
        }

        switch (argTrimmed) {
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
                keyArgs[argTrimmed] = argValue;
        }
    }

    const S = "\n  ";
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

    return `${cmd}${S}${keyArgsText}${headersText}${S}${positionalArgsText}`;
}