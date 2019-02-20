import isNumber from 'lodash/isNumber'

export function log(...params) {
    const resultString = params
        .map(toPrint => isNumber(toPrint)
            ? Array.from(Array(toPrint)).map(() => '\n').join('')
            : toPrint)
        .join('');
    console.log(resultString);
}
