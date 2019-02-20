import fs from 'fs'
import path from 'path'
import tmp from 'tmp'
import gulp from 'gulp'
import memoize from "memoizee"
import {stripIndent} from 'common-tags'

import cheerio from 'cheerio'

import expandTilde from 'expand-tilde'

import gulpDebug from 'gulp-debug'

import chokidar from 'chokidar'

function createCakeIndexFileBuilder({indexFileDirPath} = {}) {
    
    const defaultIndexFileContent = (async function() {
        const browserIndexRelativeFilePath = await new Promise((resolve, reject) => {
            const fileNames = ['index']

            const fileNamesWithExtension = fileNames.map(name => `${name}.html`)

            console.log(stripIndent`
                Waiting for ${fileNamesWithExtension.length > 1 ? 'files': 'file'}: ${
                    fileNamesWithExtension
                        .map(name => `"${name}"`).join(' or ')
                }

            `)

            // TODO search any html?
            const indexWatcher = chokidar.watch(fileNamesWithExtension, {
                ignoreInitial: false
                ,cwd: indexFileDirPath
                ,awaitWriteFinish: true
            })

            indexWatcher.once('add', (path) => {
                resolve(path)
                indexWatcher.close()
            })
        })

        console.log('Found index file: ' + browserIndexRelativeFilePath)

        const browserIndexFilePath = path.join(indexFileDirPath, browserIndexRelativeFilePath)
        
        const browserIndexFileContent = fs.readFileSync(browserIndexFilePath)
        const $defaultPage = cheerio.load(browserIndexFileContent)
        $defaultPage('iframe')
            .attr('sandbox', 'allow-scripts allow-same-origin allow-popups allow-pointer-lock allow-forms')
    
        return $defaultPage.html()
    })()


    const createwithOpenURL = memoize(async function createIndexFile(destDir, iframeSRC) {        
        const newIndex = tmp.fileSync({template: path.join(destDir, `index-XXXXXX.html`)})

        const $page = cheerio.load(await defaultIndexFileContent)

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

const move = function moveWithGulp({src, dest, logPrefix = '' }){
    return new Promise((resolve, reject) => {
        gulp.src(src)
            .pipe(gulpDebug({title: `${logPrefix} -> `}))
            .pipe(gulp.dest(dest))
            .on('end', result => {
                console.log(`\nMoved files to: ${dest} \n`)
                resolve()
            })
            .on('error', error => {
                reject(error)
            })
    })
}

const createTmpCakeDirFrom = async function(srcDir) {
    
    const tmpFolder = tmp.dirSync({unsafeCleanup: true})
    
    console.log(`\nLoading files from: ${srcDir} \n`)

    await move({
        src: path.join(srcDir, '**/*')
        ,dest: tmpFolder.name
        ,logPrefix: '[Initial setup]'
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
            ,logPrefix: `[Update][${eventName.toUpperCase()}]`
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