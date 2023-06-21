// import * as shellQuote from 'https://raw.githubusercontent.com/ljharb/shell-quote/main/index.js';
import * as shellQuote from 'npm:shell-quote@1.8.1';
// import * as denoFlagsMod from "https://deno.land/std@0.184.0/flags/mod.ts"

// import argsParser from 'npm:args-parser@1.3.0'
// import yargs from 'npm:yargs@17.7.2'
// import yargs from 'https://deno.land/x/yargs@v17.7.2-deno/yargs.js'
// import yargs from 'https://cdn.deno.land/yargs/versions/yargs-v16.2.1-deno/raw/deno.ts';
// import { Command } from "https://deno.land/x/cliffy@v0.25.4/command/mod.ts";
// import cliArgs from 'npm:command-line-args@5.2.1';
import { trim } from '../deps/lodash.ts';
// import { quote } from 'https://raw.githubusercontent.com/ljharb/shell-quote/main/index.js';

export type CurlArgsTransformArgs = {
    cutDuplicateHeaders?: boolean;
    cutHeaders?: string[];
}

export const CURL_ARGS_TRANSFORM_ARGS_DEFAULT: Required<CurlArgsTransformArgs> = {
    cutDuplicateHeaders: true,
    cutHeaders: ['x-user-agent'],
};

const quoteArg = (a: string) => {
    return shellQuote.quote([a]);
}

export async function curlArgsTransform (curlCommandString: string, args: CurlArgsTransformArgs = {})  {
    const { cutDuplicateHeaders, cutHeaders } = {
        ...CURL_ARGS_TRANSFORM_ARGS_DEFAULT,
        ...args
    };

    const argsList = shellQuote.parse(curlCommandString);

    // const parsed = denoFlagsMod.parse(argsList);
    // const parsed = argsParser(argsList);
    // const command = new Command();
    // const parsed = await command.parse(argsList);

    // const parsed = cliArgs(
    //     [
    //         { name: 'request', alias: 'X', type: String},
    //         { name: 'header', alias: 'H', type: String, multiple: true, defaultOption: true}
    //     ],
    //     {
    //         argv: restArgs,
    //         partial: true,
    //         stopAtFirstUnknown: false
    //     }
    // );

    // return curlCommandString;

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

    // const curlCommandParts = curlCommandString.split(/\s*\-H\s*/gm);

    // return curlCommandParts.join("\n  -H ");
}