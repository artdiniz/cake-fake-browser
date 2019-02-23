import path from 'path'
import tmp from 'tmp'
import gulp from 'gulp'

import {stripIndent} from 'common-tags'

import chalk from 'chalk'

import expandTilde from 'expand-tilde'

import gulpDebug from 'gulp-debug'

import chokidar from 'chokidar'

import { log } from './log'
import { CakeFiles } from './CakeFiles'

const move = function moveWithGulp({src, dest, fileLogPrefix = '', logStartTitle = 'Copying files', logEndTitle = 'Copying successfull'}){
    return new Promise((resolve, reject) => {
        log(
            2
            ,stripIndent`
            ${chalk.bgBlack(chalk.green(logStartTitle))}

            From: ${
                chalk.grey(src)
            }
            To: ${
                chalk.grey(dest)
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
    
    return tmpFolder
}


export const setupCakeFiles = async function ({in: srcDir}) {
    const tmpCakeDir = await createTmpCakeDirFrom(expandTilde(srcDir))

    const srcWatcher = chokidar.watch('**/*', {
        ignoreInitial: true
        ,cwd: srcDir
        ,awaitWriteFinish: true
    })

    srcWatcher.on('all', (eventName, filePath) => {
        move({
            src: path.join(srcDir, filePath)
            ,dest: tmpCakeDir.name
            ,logStartTitle: `[Update][${eventName.toUpperCase()}] Starting copying files`
            ,fileLogPrefix: `[Update][${eventName.toUpperCase()}]`
            ,logEndTitle: `[Update][${eventName.toUpperCase()}] Copy succesfull`
        })
    })

    return CakeFiles({path: tmpCakeDir.name})
}