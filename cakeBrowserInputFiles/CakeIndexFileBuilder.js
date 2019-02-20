import path from 'path'
import fs from 'fs'

import tmp from 'tmp'
import cheerio from 'cheerio'
import chalk from 'chalk'
import { stripIndent } from 'common-tags'
import chokidar from 'chokidar'
import memoize from "memoizee"

import { log } from './log'

const getIndexFilePathAsyncIn = function (folderPath) {

    return new Promise((resolve, reject) => {
        const fileNames = ['index', 'main', 'cake', 'browser']
        const fileNamesWithExtension = fileNames.map(name => `${name}.html`)

        log(
            1
            ,stripIndent`
            Looking in ${chalk.grey(chalk.underline(folderPath))} for ${fileNamesWithExtension.length > 1 ? 'files' : 'file'}: ${fileNamesWithExtension
                .map(name => chalk.cyan(chalk.underline(name)))
                .join(' or ')}
            `
            ,1
        )

        const indexWatcher = chokidar.watch(`+(${fileNamesWithExtension.join('|')})`, {
            ignoreInitial: false,
            cwd: folderPath,
            awaitWriteFinish: true
        })
        
        indexWatcher.once('all', (eventName, indexFilePath) => {
            indexWatcher.close()
            log('Found file: ', chalk.cyan(chalk.underline(indexFilePath)), 2)
            resolve(path.join(folderPath, indexFilePath))
        })
    })
}

export const CakeIndexFileBuilder = function ({ indexFileDirPath } = {}) {

    const browserIndexFilePathPromise = getIndexFilePathAsyncIn(indexFileDirPath)

    const defaultIndexFileContent = (async function () {
        const browserIndexFilePath = await browserIndexFilePathPromise
        const browserIndexFileContent = fs.readFileSync(browserIndexFilePath)
        const $defaultPage = cheerio.load(browserIndexFileContent)

        $defaultPage('iframe')
            .attr('sandbox', 'allow-scripts allow-same-origin allow-popups allow-pointer-lock allow-forms')

        return $defaultPage.html()
    })()

    const createwithOpenURL = memoize(async function createIndexFile(destDir, iframeSRC) {

        const $page = cheerio.load(await defaultIndexFileContent)

        const newIndex = tmp.fileSync({ template: path.join(destDir, `index-XXXXXX.html`) })
        
        if (iframeSRC !== undefined && iframeSRC !== null) {
            $page('iframe').attr('src', iframeSRC)
        }

        fs.writeFileSync(newIndex.fd, $page.html())

        return newIndex

    }, { promise: true })

    return {
        withOpenURL: (openURL) => createwithOpenURL(indexFileDirPath, openURL)
    }
}
