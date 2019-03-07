import isNumber from 'lodash/isNumber'

export function printLogs(...logs) {
    const resultString = logs
        .map(toPrint => isNumber(toPrint)
            ? Array.from(Array(toPrint - 1)).map(() => '\n').join('')
            : toPrint
        )
        .join('\n')

    console.log(resultString)
}
