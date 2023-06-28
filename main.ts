import { curlArgsTransform } from './src/curlArgsTransform.ts';

/** https://stackoverflow.com/a/59902638/1760643 */
function buffersConcat(
  arrays: Uint8Array[],
): Uint8Array | null {
  // sum of individual array lengths
  let totalLength = arrays.reduce(
    (acc, value) => acc + value.length,
    0,
  );

  if (!arrays.length) {
    return null;
  }

  let result = new Uint8Array(totalLength);

  // for each array - copy it over result
  // next array is copied right after the previous one
  let length = 0;
  for (let array of arrays) {
    result.set(array, length);
    length += array.length;
  }

  return result;
}

/** From https://stackoverflow.com/a/58033584/1760643 */
async function readInputPipe(): Promise<string | null> {
  const buffers: Uint8Array[] = [];

  let n;

  do {
    const buf = new Uint8Array(1024);
    /* Reading into `buf` from start.
      * buf.subarray(0, n) is the read result.
      * If n is instead Deno.EOF, then it means that stdin is closed.
      */
    n = await Deno.stdin.read(buf);
    if (n !== null) {
      buffers.push(buf.subarray(0, n));
      // console.log('input:', inputText);
    }
  } while (n !== null);

  const bigBuffer = buffersConcat(buffers);

  return bigBuffer
    ? new TextDecoder().decode(bigBuffer)
    : null;
}

window.onload = async function main() {
  // console.log('args', Deno.args);

  const filePath = Deno.args[0];

  const inputText = filePath
    ? Deno.readTextFileSync(filePath)
    : await readInputPipe();

  if (inputText) {
    Deno.stdout.write(
      new TextEncoder().encode(
        curlArgsTransform(inputText),
      ),
    );
  } else {
    throw Error('No input text');
  }
};
