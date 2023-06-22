window.onload = async function main() {
  const buf = new Uint8Array(1024);
  /* Reading into `buf` from start.
     * buf.subarray(0, n) is the read result.
     * If n is instead Deno.EOF, then it means that stdin is closed.
     */
  const n = await Deno.stdin.read(buf);
  if (n == null) {
    // if (n == Deno.EOF) {
    console.log('Standard input closed');
  } else {
    console.log(
      'READ:',
      new TextDecoder().decode(buf.subarray(0, n)),
    );
  }
};
