import { app } from 'electron'
import { stripIndent } from 'common-tags'
import chalk from 'chalk'


import { WithDisabledContentSecurityPolicy } from './session/WithDisabledContentSecurityPolicy'
import { WithDisabledResponseHeaders } from './session/WithDisabledResponseHeaders'
import { InterceptableResponseSession } from './session/InterceptableResponseSession'
import { AmnesicSession } from './session/AmnesicSession'

import { RestartableApp } from './util/RestartableApp'
import { printLogs } from './util/printLogs'
import { CakeWelcomePage } from './welcome/CakeWelcomePage'
import { resolveFolderPath, setupCakeFilesServer, getIndexFilePathAsyncIn } from './cakeBrowserInputFiles'
import { CakeBrowserWindow } from './window/CakeBrowserWindow'

process.on('unhandledRejection', (error, rejectedPromise) => {
    console.error('Unhandled Rejection at:', rejectedPromise, 'reason:', error);
    process.exit(1)
})

const cakeApp = RestartableApp(app)

const log = (message) => {
    printLogs(1, `${chalk.grey('[Initial setup]')} ${message}`, 1)
}

async function init ({args = process.argv.slice(2)}) {

    cakeApp.onWillQuitBeforeCleanup(() => printLogs(1, '* Quit requested. *', 1))
    cakeApp.onWillQuitAfterCleanup(() => printLogs(1, '* Quit cleanup succesfull! *', 1))
    cakeApp.onWillQuitAfterCleanup(() => printLogs('Good Bye! 🎂'))

    const cakeWelcomePage = await CakeWelcomePage()

    cakeWelcomePage.onReloadRequested(newSrcFolder => {
        printLogs(1, '* Reload requested *', 1)
        cakeApp
            .restart({args: [newSrcFolder, ...process.argv.slice(3)]})
            .then(() => {
                printLogs(1, '* Reload successfull *', 1)
            })
    })

    log('Waiting user input of src directory')

    const srcDir = await resolveFolderPath({
        appArguments: args
        ,promptUserFunction: cakeWelcomePage.getSrcFolder
    })

    log(`Received src directory: ${chalk.cyan(srcDir)}`)

    const possibleIndexFileNames = ['index', 'main', 'cake', 'browser']

    cakeWelcomePage.setLoading(
        srcDir
        ,cakeWelcomePage.messages.waitingForIndexFileCreation(possibleIndexFileNames)
    )

    const indexFilePath = await getIndexFilePathAsyncIn(srcDir, {
        fileNames: possibleIndexFileNames
    })

    cakeWelcomePage.setLoading(
        srcDir
        ,cakeWelcomePage.messages.startingServer(indexFilePath)
    )

    log('Starting src files server setup') 

    const cakeFilesServer = await setupCakeFilesServer({in: srcDir, indexFilePath})

    const cakeServerOrigin = cakeFilesServer.getIndexFileURL().origin
    
    log(`Server running at ${chalk.cyan(cakeServerOrigin)}`) 
        
    cakeFilesServer.onError(error => {
        printLogs(
            1
            ,stripIndent`
            Error on cake files server: 
            ${error}
            ` 
            ,1
        )
    })
        
    let mainWindow = CakeBrowserWindow({
        getCakeBrowserURLFn: cakeFilesServer.getIndexFileURL
    })
        
    const session = AmnesicSession({dontForgetOrigins: [cakeServerOrigin]},
                    WithDisabledResponseHeaders(['Access-Control-Allow-Origin', 'X-Frame-Options'],
                    WithDisabledContentSecurityPolicy(['frame-ancestors', 'frame-src', 'default-src'],
                    InterceptableResponseSession(
                        mainWindow.webContents.session
                    ))))

    mainWindow.on('closed', function() {
        mainWindow.removeAllListeners()
        mainWindow = null;
    })

    cakeApp.addCleanupTask(async function cleanSessionStorage(event, cleanupLogger){
        const forgotOrigins = await session.forgetEverything()
        cleanupLogger.log(
            ...forgotOrigins.map(origin => `Cleared all storge info for "${origin}"`)
        )
    })

    cakeApp.addCleanupTask(async function destroyCakeFilesServer(event, cleanupLogger){ 
        const {clearedWatchers, serverShutdownWasGracefull} = await cakeFilesServer.cleanup()
        
        cleanupLogger.log(...[
            `Closed cake files server ${
                serverShutdownWasGracefull 
                    ? 'gracefully' 
                    : 'with a piano in the head'
            }`
            ,...clearedWatchers.map(([watcher, wasClosed]) => wasClosed
                ? `Closed ${watcher}`
                : `Couldn't close src dir watchers`
            )
        ])
    })

    cakeWelcomePage.setLoaded(srcDir)
}

cakeApp.start(init)