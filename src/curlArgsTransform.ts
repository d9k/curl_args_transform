import * as shellQuote from 'npm:shell-quote@1.8.1';

import { trim } from '../deps/lodash.ts';

export type CurlArgsTransformArgs = {
    cutDuplicateHeaders?: boolean;
    cutHeaders?: string[];
}

export const CURL_ARGS_TRANSFORM_ARGS_DEFAULT: Required<CurlArgsTransformArgs> = {
    cutDuplicateHeaders: true,
    cutHeaders: ['x-user-agent'],
};

/** https://stackoverflow.com/a/7685469/1760643 */
function quoteArg (cmd: string) {
    return '"'+cmd.replace(/(["'$`\\])/g,'\\$1')+'"';
}

export async function curlArgsTransform (curlCommandString: string, args: CurlArgsTransformArgs = {})  {
    const { cutDuplicateHeaders, cutHeaders } = {
        ...CURL_ARGS_TRANSFORM_ARGS_DEFAULT,
        ...args
    };

    const argsList = shellQuote.parse(curlCommandString);

    const restArgs= [...argsList];
    const cmd = restArgs.shift();

    const headers = [];

    const positionalArgs = [];
    const keyArgs: {[key: string]: string} = {};

    while (restArgs.length) {
        const arg = restArgs.shift();

        if (arg[0] !== '-') {
            positionalArgs.push(arg);
            continue;
        }

        const argTrimmed = trim(arg, '-', null);
        const argValue = restArgs.shift();

        switch (argTrimmed) {
            case 'H':
            case 'header':
                headers.push(argValue);
                break;
            default:
                keyArgs[argTrimmed] = argValue;
        }
    }

    const S = "\n  ";
    const H = `${S}-H `;

    // TODO escape
    // TODO long keys => --
    const headersText = `${H}${headers.map(quoteArg).join(H)}`;
    const keyArgsText = Object.entries(keyArgs).map(
        ([key, value]) => `-${key} ${quoteArg(value)}`
    ).join(S);
    const positionalArgsText = positionalArgs.map(quoteArg).join(S);

    return `${cmd}${S}${keyArgsText}${headersText}${S}${positionalArgsText}`;
}