const fs = require('fs')
const path = require('path')
const tmp = require('tmp')
const gulp = require('gulp')
const memoize = require("memoizee")
const glob = require("glob")

const cheerio = require('cheerio')

const expandTilde = require('expand-tilde')

const gulpDebug = require('gulp-debug')

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
        console.log('Tmp folder path: ' + tmpFolder.name)
    
        gulp.src(path.join(srcDir, '**/*'))
            .pipe(gulp.dest(tmpFolder.name))
            .on('end', result => {
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

async function BrowserInputFilesIn(srcDir) {

    const tmpCakeDir = await createTmpCakeDirFrom(expandTilde(srcDir))
    
    const cakeIndexFileBuilder = createCakeIndexFileBuilder({indexFileDirPath: tmpCakeDir.getPath()})

    function getIndex({openURL} = {}) {
        let indexFile

        if(openURL !== undefined && openURL !== null) {
            indexFile = cakeIndexFileBuilder.withOpenURL(openURL)
        } else {
            indexFile = cakeIndexFileBuilder.withOpenURL()
        }

        return indexFile.name
    }

    return {
        getIndex: getIndex
    }
}

const BrowserInputFiles = {
    in: BrowserInputFilesIn
}

exports.BrowserInputFiles = BrowserInputFiles