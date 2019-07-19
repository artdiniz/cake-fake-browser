import path from 'path'

import { printLogs } from '../util/printLogs'
import { stripIndent } from 'common-tags'
import chokidar from 'chokidar'
import chalk from 'chalk'

let indexWatcher = null

export const getIndexFilePathAsyncIn = function (folderPath, {fileNames = []} = {fileNames: []}) {
    const fileNamesWithExtension = fileNames.map(name => `${name}.html`)
    
    if(indexWatcher !== null) indexWatcher.close()
    
    indexWatcher = chokidar.watch(`+(${fileNamesWithExtension.join('|')})`, {
        ignoreInitial: false,
        cwd: folderPath,
        awaitWriteFinish: false
    })

    printLogs(
        1
        , stripIndent`
            ${chalk.grey('[Initial setup]')} Looking in ${chalk.grey(folderPath)} for ${fileNamesWithExtension.length > 1 ? 'files' : 'file'}:
            ${chalk.grey('[Initial setup]')}    ${
                    fileNamesWithExtension
                        .map(name => chalk.cyan(name))
                        .map(name => `${name}`)
                        .join(' or ')
                }
        `
        ,1
    )

    return new Promise((resolve, reject) => {
        indexWatcher
            .once('all', (eventName, indexFilePath) => {
                indexWatcher.close()
                printLogs(`${chalk.grey('[Initial setup]')} Found file: ${chalk.cyan(chalk.underline(indexFilePath))}`, 2)
                resolve(path.join(folderPath, indexFilePath))
            })
            .once('error', (error) => {
                indexWatcher.close()
                reject(error)
            })
    })
}
