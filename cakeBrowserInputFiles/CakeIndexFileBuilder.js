import path from 'path'
import fs from 'fs'

import tmp from 'tmp'
import chalk from 'chalk'
import { stripIndent } from 'common-tags'
import chokidar from 'chokidar'
import memoize from "memoizee"

import { log } from './log'
import { CakeIndexFileContent } from './CakeIndexFileContent';

const getIndexFilePathAsyncIn = function (folderPath) {
    return new Promise((resolve, reject) => {
        const fileNames = ['index', 'main', 'cake', 'browser']
        const fileNamesWithExtension = fileNames.map(name => `${name}.html`)

        log(
            1
            ,stripIndent`
                Looking in ${chalk.grey(folderPath)} for ${fileNamesWithExtension.length > 1 ? 'files' : 'file'}:

                    ${
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
            awaitWriteFinish: true
        })
        
        indexWatcher
            .once('all', (eventName, indexFilePath) => {
                indexWatcher.close()
                log('Found file: ', chalk.cyan(chalk.underline(indexFilePath)), 2)
                resolve(path.join(folderPath, indexFilePath))
            })
            .once('error', (error) => {
                indexWatcher.close()
                reject(error)
            })
    })
}

export const CakeIndexFileBuilder = function ({ indexFileDirPath } = {}) {

    const indexPathAsync = getIndexFilePathAsyncIn(indexFileDirPath)


    const createwithOpenURL = memoize(async function createIndexFile(destDir, iframeSRC) {
        const parsedIndexContentAsync = indexPathAsync
            .then(indexFilePath => fs.readFileSync(indexFilePath))
            .then(indexContent => CakeIndexFileContent.withSandboxedIframe(indexContent))

        console.log('ICreated new file for: ', chalk.cyan(iframeSRC))

        const newIndex = tmp.fileSync({ template: path.join(destDir, `index-XXXXXX.html`) })
        
        const parsedIndexContent = await parsedIndexContentAsync
        
        const newIndexContent = CakeIndexFileContent.withIframeSrc(parsedIndexContent, iframeSRC)

        fs.writeFileSync(newIndex.fd, newIndexContent)

        return newIndex

    }, { promise: true })

    
    indexPathAsync.then(indexFilePath => {
        const indexWatcher = chokidar.watch(indexFilePath, {
            ignoreInitial: true,
            awaitWriteFinish: true
        })
        
        indexWatcher
            .on('all', (eventName, indexFilePath) => {
                log(`I[Update][${eventName}]: `, chalk.cyan(chalk.underline(indexFilePath)), 2)
                createwithOpenURL.clear()
            })
    })
    


    return {
        withOpenURL: (openURL) => createwithOpenURL(indexFileDirPath, openURL)
    }
}
