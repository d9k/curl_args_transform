export type QuoteArgOpts = {
  noEscapeDollarSign?: boolean;
};

/** Based on https://stackoverflow.com/a/7685469/1760643 */
export function doubleQuoteArg(
  cmd: string,
  { noEscapeDollarSign }: QuoteArgOpts = {},
) {
  const symbols = ['\'', '"', '\\\\'];

  if (!noEscapeDollarSign) {
    symbols.push('$');
  }

  const regExp = new RegExp(`([${symbols.join('')}])`, 'g');

  return '"' + cmd.replace(regExp, '\\$1') + '"';
}
