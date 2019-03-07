import path from 'path'
import fs from 'fs'

import tmp from 'tmp'
import chalk from 'chalk'
import memoize from "memoizee"

import { CakeIndexFileContent } from './CakeIndexFileContent';

export const CakeIndexFileBuilder = function ({ indexFilePath } = {}) {

    let currentIndexFilePath = indexFilePath
    
    const createdIndexesWithIframSrc = []

    const getContent = (indexFilePath, iframeSRC) => {
        const indexContent = fs.readFileSync(indexFilePath)

        const newIndexContent = CakeIndexFileContent(indexContent)
            .withSandboxedIframe()
            .withIframeSrc(iframeSRC)
            .withInjectedScripts([
                require.resolve('./injectedScripts/injectTest.js')
            ])
            .toString()

        return newIndexContent
    }

    const createwithOpenURL = memoize(function createIndexFile(indexFilePath, iframeSRC) {
        const newIndexContent = getContent(indexFilePath, iframeSRC)
            
        const newIndex = tmp.fileSync({ 
            template: path.join(
                path.dirname(indexFilePath)
                , `index-XXXXXX.html`
            ) 
        })

        createdIndexesWithIframSrc.push([newIndex.name, iframeSRC])
            
        console.log('[IndexFileBuilder] Created new file with open URL: ', chalk.cyan(iframeSRC))

        fs.writeFileSync(newIndex.fd, newIndexContent)

        return newIndex

    })

    return {
        withOpenURL: (openURL) => createwithOpenURL(currentIndexFilePath, openURL)
        ,reloadIndexFile: (newIndexPath = false) => {
            currentIndexFilePath = newIndexPath || currentIndexFilePath

            createdIndexesWithIframSrc.forEach(([path, iframeSrc]) => {
                fs.writeFileSync(path, getContent(currentIndexFilePath, iframeSrc))
            })
        }
    }
}
