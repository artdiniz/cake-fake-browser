import fs from 'fs'
import path from 'path'
import tmp from 'tmp'
import gulp from 'gulp'
import memoize from "memoizee"
import {stripIndent, } from 'common-tags'

import chalk from 'chalk'

import cheerio from 'cheerio'

import expandTilde from 'expand-tilde'

import gulpDebug from 'gulp-debug'

import chokidar from 'chokidar'
import isNumber from 'lodash/isNumber'

function log(...params) {
    const resultString = params
        .map(toPrint => isNumber(toPrint)
            ? Array.from(Array(toPrint)).map(() => '\n').join('')
            : toPrint
        )
        .join('')

    console.log(resultString)
}

const getIndexFilePathAsyncIn = function(folderPath) {
    return new Promise((resolve, reject) => {
        
        const fileNames = ['index', 'main', 'cake', 'browser']
        const fileNamesWithExtension = fileNames.map(name => `${name}.html`)

        log(
            1
            ,stripIndent`
            Looking in ${chalk.grey(chalk.underline(folderPath))} for ${fileNamesWithExtension.length > 1 ? 'files': 'file'}: ${
                fileNamesWithExtension
                    .map(name => chalk.cyan(chalk.underline(name)))
                    .join(' or ')
            }
            `
            ,1
        )

        const indexWatcher = chokidar.watch(`+(${fileNamesWithExtension.join('|')})`, {
            ignoreInitial: false
            ,cwd: folderPath
            ,awaitWriteFinish: true
        })

        indexWatcher.once('all', (eventName, indexFilePath) => {
            indexWatcher.close()
            log(
                    'Found file: '
                    ,chalk.cyan(chalk.underline(indexFilePath))
                    ,2
                )
            resolve(path.join(folderPath, indexFilePath))
        })
    })
}

const createCakeIndexFileBuilder = function({indexFileDirPath} = {}) {
    const browserIndexFilePathPromise = getIndexFilePathAsyncIn(indexFileDirPath)
    
    const defaultIndexFileContent = (async function() {
        const browserIndexFilePath = await browserIndexFilePathPromise
        
        const browserIndexFileContent = fs.readFileSync(browserIndexFilePath)
        const $defaultPage = cheerio.load(browserIndexFileContent)
        $defaultPage('iframe')
            .attr('sandbox', 'allow-scripts allow-same-origin allow-popups allow-pointer-lock allow-forms')
    
        return $defaultPage.html()
    })()

    const createwithOpenURL = memoize(async function createIndexFile(destDir, iframeSRC) {        
        
        const $page = cheerio.load(await defaultIndexFileContent)

        const newIndex = tmp.fileSync({template: path.join(destDir, `index-XXXXXX.html`)})

        if(iframeSRC !== undefined && iframeSRC !== null) {
            $page('iframe').attr('src', iframeSRC)
        }

        fs.writeFileSync(newIndex.fd, $page.html())

        return newIndex
    }, {promise: true})

    return {
        withOpenURL: (openURL) => createwithOpenURL(indexFileDirPath, openURL)
    }
}

const move = function moveWithGulp({src, dest, fileLogPrefix = '', logStartTitle = 'Copying files', logEndTitle = 'Copying successfull'}){
    return new Promise((resolve, reject) => {
        log(
            2
            ,stripIndent`
            ${chalk.bgBlack(chalk.green(logStartTitle))}

            From: ${
                chalk.grey(chalk.underline(src))
            }
            To: ${
                chalk.grey(chalk.underline(dest))
            }
            `, 
            1
        )

        gulp.src(src)
            .pipe(gulpDebug({
                title: `${fileLogPrefix} -> `
            }))
            .pipe(gulp.dest(dest))
            .on('end', result => {
                log(
                    1
                    ,chalk.bgBlack(chalk.green(logEndTitle))
                    ,2
                )
                resolve()
            })
            .on('error', error => {
                reject(error)
            })
    
        })
}

const createTmpCakeDirFrom = async function(srcDir) {
    
    const tmpFolder = tmp.dirSync({unsafeCleanup: true})

    await move({
        src: path.join(srcDir, '**/*')
        ,dest: tmpFolder.name
        ,logStartTitle: '[Initial setup] Copying files.'
        ,fileLogPrefix: '[Initial setup]'
        ,logEndTitle: '[Initial setup] Copy succesfull'
    })
    
    return {
        getPath: () => tmpFolder.name
        ,remove: () => tmpFolder.removeCallback()
    }
}


export const createAndSetupFilesIn = async function (srcDir) {

    const tmpCakeDir = await createTmpCakeDirFrom(expandTilde(srcDir))

    const srcWatcher = chokidar.watch('**/*', {
        ignoreInitial: true
        ,cwd: srcDir
        ,awaitWriteFinish: true
    })

    srcWatcher.on('all', (eventName, filePath) => {
        move({
            src: path.join(srcDir, filePath)
            ,dest: tmpCakeDir.getPath()
            ,logStartTitle: `[Update][${eventName.toUpperCase()}] Starting copying files`
            ,fileLogPrefix: `[Update][${eventName.toUpperCase()}]`
            ,logEndTitle: `[Update][${eventName.toUpperCase()}] Copy succesfull`
        })
    })
    
    const cakeIndexFileBuilder = createCakeIndexFileBuilder({indexFileDirPath: tmpCakeDir.getPath()})

    async function getIndexPath({withOpenURL: openURL} = {}) {
        let indexFile

        if(openURL !== undefined && openURL !== null) {
            indexFile = await cakeIndexFileBuilder.withOpenURL(openURL)
        } else {
            indexFile = await cakeIndexFileBuilder.withOpenURL()
        }

        return indexFile.name
    }

    function deleteAll() {
        tmpCakeDir.remove()
    }

    return {
        getIndexPath: getIndexPath
        ,deleteAll: deleteAll 
    }
}