const fs = require('fs')
const path = require('path')
const tmp = require('tmp')
const gulp = require('gulp')
const memoize = require("memoizee")

const cheerio = require('cheerio')

const gulpDebug = require('gulp-debug')

const BrowserInputFiles = (() => {
    // TODO get this from atom or ask user
    const input = 'browser/index.html'

    if(!fs.existsSync(input)) {
        throw new Error("Esse arquivo não exsiste")
    }
    
    const browserFolderPath = path.dirname(input)
    const browserIndexFilePath = input

    const defaultIndexFileContent = (() => {
        const browserIndexFileContent = fs.readFileSync(browserIndexFilePath)
        const $defaultPage = cheerio.load(browserIndexFileContent)
        $defaultPage('iframe').attr('sandbox', 'allow-scripts allow-same-origin allow-popups allow-pointer-lock allow-forms')

        return $defaultPage.html()
    })()

    const tmpFolderCreationPromise = new Promise((resolve, reject) => {
        const tmpFolder = tmp.dirSync()

        console.log('Tmp folder path: ' + tmpFolder.name)

        gulp.src(path.join(browserFolderPath, '**/*'))
            .pipe(gulpDebug({title: "Moved: "}))
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

    const createIndexFile = memoize(async function createIndexFile(iframeSRC) {
        const tmpFolderPath = (await tmpFolderCreationPromise).path
        const newIndex = tmp.fileSync({template: path.join(tmpFolderPath, `index-XXXXXX.html`)})

        const $page = cheerio.load(defaultIndexFileContent)

        if(iframeSRC !== undefined && iframeSRC !== null) {
            $page('iframe').attr('src', iframeSRC)
        }

        fs.writeFileSync(newIndex.fd, $page.html())

        return newIndex
    }, {promise: true})
    
    async function getIndex({iframeSRC} = {}) {
        let indexFile

        if(iframeSRC !== undefined && iframeSRC !== null) {
            indexFile = await createIndexFile(iframeSRC)
        } else {
            indexFile = await createIndexFile()
        }

        return indexFile.name
    }

    return {
        getIndex: getIndex
    }

})()

exports.BrowserInputFiles = BrowserInputFiles