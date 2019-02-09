import fs from 'fs'
import path from 'path'
import tmp from 'tmp'
import gulp from 'gulp'
import memoize from "memoizee"
import glob from "glob"

import cheerio from 'cheerio'

import expandTilde from 'expand-tilde'

import gulpDebug from 'gulp-debug'

function createCakeIndexFileBuilder({indexFileDirPath} = {}) {
    
    const defaultIndexFileContent = (() => {
        // TODO search any html?
        const browserIndexRelativeFilePath = glob.sync(
            '**/index.html'
            , {cwd: indexFileDirPath}
        )[0]

        const browserIndexFilePath = path.join(indexFileDirPath, browserIndexRelativeFilePath)
        
        const browserIndexFileContent = fs.readFileSync(browserIndexFilePath)
        const $defaultPage = cheerio.load(browserIndexFileContent)
        $defaultPage('iframe')
            .attr('sandbox', 'allow-scripts allow-same-origin allow-popups allow-pointer-lock allow-forms')
    
        return $defaultPage.html()
    })()


    const createwithOpenURL = memoize(function createIndexFile(destDir, iframeSRC) {        
        const newIndex = tmp.fileSync({template: path.join(destDir, `index-XXXXXX.html`)})

        const $page = cheerio.load(defaultIndexFileContent)

        if(iframeSRC !== undefined && iframeSRC !== null) {
            $page('iframe').attr('src', iframeSRC)
        }

        fs.writeFileSync(newIndex.fd, $page.html())

        return newIndex
    })

    return {
        withOpenURL: (openURL) => createwithOpenURL(indexFileDirPath, openURL)
    }
}

async function createTmpCakeDirFrom (srcDir) {
    const tmpDir = await new Promise((resolve, reject) => {
        const tmpFolder = tmp.dirSync()
        console.log(`\nLoading files from: ${srcDir} \n`)
    
        gulp.src(path.join(srcDir, '**/*'))
            .pipe(gulpDebug({title: "-> ", }))
            .pipe(gulp.dest(tmpFolder.name))
            .on('end', result => {
                console.log(`\nMoved files to: ${tmpFolder.name} \n`)
                resolve({
                    path: tmpFolder.name
                })
            })
            .on('error', error => {
                reject(error)
            })
    })

    return {
        getPath: () => tmpDir.path
    }
}

async function createAndSetupFileIn(srcDir) {

    const tmpCakeDir = await createTmpCakeDirFrom(expandTilde(srcDir))
    
    const cakeIndexFileBuilder = createCakeIndexFileBuilder({indexFileDirPath: tmpCakeDir.getPath()})

    function getIndexPath({withOpenURL: openURL} = {}) {
        let indexFile

        if(openURL !== undefined && openURL !== null) {
            indexFile = cakeIndexFileBuilder.withOpenURL(openURL)
        } else {
            indexFile = cakeIndexFileBuilder.withOpenURL()
        }

        return indexFile.name
    }

    return {
        getIndexPath: getIndexPath
    }
}

export const CakeBrowserInputFilesSetup = {
    in: createAndSetupFileIn
}