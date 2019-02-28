import path from 'path'
import tmp from 'tmp'
import expandTilde from 'expand-tilde'

import { move } from './move'
import { printLogs } from '../util/printLogs'
import { stripIndent } from 'common-tags'
import chokidar from 'chokidar'
import chalk from 'chalk'

import { CakeIndexFileBuilder } from './CakeIndexFileBuilder'

const createTmpCakeDirFrom = async function(srcDir) {
    const tmpFolder = tmp.dirSync({unsafeCleanup: true})

    await move({
        src: path.join(srcDir, '**/*')
        ,dest: tmpFolder.name
        ,base: srcDir
        ,logStartTitle: '[Initial setup] Copying files.'
        ,fileLogPrefix: '[Initial setup]'
        ,logEndTitle: '[Initial setup] Copy succesfull'
    })
    
    return tmpFolder
}

const getIndexFilePathAsyncIn = function (folderPath) {
    return new Promise((resolve, reject) => {
        const fileNames = ['index', 'main', 'cake', 'browser']
        const fileNamesWithExtension = fileNames.map(name => `${name}.html`)

        printLogs(
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
                printLogs(`Found file: ${chalk.cyan(chalk.underline(indexFilePath))}`, 2)
                resolve(path.join(folderPath, indexFilePath))
            })
            .once('error', (error) => {
                indexWatcher.close()
                reject(error)
            })
    })
}

const setFileSystemWatcher = function(globPath, callback) {
    let chokidarWatcher = chokidar.watch(globPath, {
        ignoreInitial: true
        ,awaitWriteFinish: true
    })

    chokidarWatcher.on('all', callback)

    const watcher = {
        clear: () => {
            if(chokidarWatcher !== null) {
                chokidarWatcher.close()
                chokidarWatcher = null                    
            }
            return true
        }
        ,toString: () => `FS Watcher on: ${globPath}`
    }

    return watcher
}

export const setupCakeFiles = async function ({in: srcDir}) {
    const tmpCakeDir = await createTmpCakeDirFrom(expandTilde(srcDir))

    const indexFilePath = await getIndexFilePathAsyncIn(tmpCakeDir.name)

    const cakeIndexFileBuilder = CakeIndexFileBuilder({indexFilePath})

    const indexFileWatcher = setFileSystemWatcher(indexFilePath, (eventName) => {
        printLogs(`[Update Index File][${eventName}]: `, chalk.cyan(chalk.underline(indexFilePath)), 2)
        cakeIndexFileBuilder.reloadIndexFile()
    })

    const srcFilesWatcher = setFileSystemWatcher(path.join(srcDir, '**/*'), (eventName, filePath) => {
        move({
            src: filePath
            ,base: srcDir
            ,dest: tmpCakeDir.name
            ,logStartTitle: `[Update][${eventName.toUpperCase()}] Starting copying files`
            ,fileLogPrefix: `[Update][${eventName.toUpperCase()}]`
            ,logEndTitle: `[Update][${eventName.toUpperCase()}] Copy succesfull`
        })
    })


    return {
        getIndexPath: function getIndexPath({withOpenURL: openURL} = {}) {
            let indexFile
    
            if(openURL !== undefined && openURL !== null) {
                indexFile = cakeIndexFileBuilder.withOpenURL(openURL)
            } else {
                indexFile = cakeIndexFileBuilder.withOpenURL()
            }
    
            return indexFile.name
        }
        
        ,cleanup: () => [
            indexFileWatcher.clear() && indexFileWatcher
            ,srcFilesWatcher.clear() && srcFilesWatcher
        ]
    }
}