import path from 'path'
import tmp from 'tmp'
import expandTilde from 'expand-tilde'

import { move } from './move'
import { log } from './log'
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

const onFSUpdate = function(globPath, callback) {
    let watcher = chokidar.watch(globPath, {
        ignoreInitial: true
        ,awaitWriteFinish: true
    })

    watcher.on('all', callback)

    return () => {
        if(watcher !== null) {
            watcher.close()
            watcher = null
            log(
                1
                , `Closing watcher: ${globPath}`
                ,1
            )
        }
    }
}

export const setupCakeFiles = async function ({in: srcDir}) {
    const tmpCakeDir = await createTmpCakeDirFrom(expandTilde(srcDir))

    const indexFilePath = await getIndexFilePathAsyncIn(tmpCakeDir.name)

    const cakeIndexFileBuilder = CakeIndexFileBuilder({indexFilePath})

    const cleanupIndexFileWatcher = onFSUpdate(indexFilePath, (eventName) => {
        log(`[Update Index File][${eventName}]: `, chalk.cyan(chalk.underline(indexFilePath)), 2)
        cakeIndexFileBuilder.reloadIndexFile()
    })

    const cleanupSrcFilesWatcher = onFSUpdate(path.join(srcDir, '**/*'), (eventName, filePath) => {
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
        
        ,cleanup: () => {
           cleanupIndexFileWatcher()
           cleanupSrcFilesWatcher()
        }
    }
}