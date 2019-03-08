import path from 'path'

import { printLogs } from '../util/printLogs'
import { stripIndent } from 'common-tags'
import chokidar from 'chokidar'
import chalk from 'chalk'

export const getIndexFilePathAsyncIn = function (folderPath, {fileNames = []} = {fileNames: []}) {
    return new Promise((resolve, reject) => {
        const fileNamesWithExtension = fileNames.map(name => `${name}.html`)

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

        const indexWatcher = chokidar.watch(`+(${fileNamesWithExtension.join('|')})`, {
            ignoreInitial: false,
            cwd: folderPath,
            awaitWriteFinish: false
        })

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