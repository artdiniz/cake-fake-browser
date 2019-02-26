import gulp from 'gulp'
import {stripIndent} from 'common-tags'
import chalk from 'chalk'
import gulpDebug from 'gulp-debug'
import { log } from './log'
import path from 'path'

export const move = function moveWithGulp({src = './', dest = './dist', base = path.dirname(src), fileLogPrefix = '', logStartTitle = 'Copying files', logEndTitle = 'Copying successfull'}){
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

        gulp.src(src, {base: base})
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