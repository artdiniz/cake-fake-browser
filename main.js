import { app } from 'electron'
import { stripIndent } from 'common-tags'

import { WithDisabledContentSecurityPolicy } from './session/WithDisabledContentSecurityPolicy'
import { WithDisabledResponseHeaders } from './session/WithDisabledResponseHeaders'
import { InterceptableResponseSession } from './session/InterceptableResponseSession'
import { AmnesicSession } from './session/AmnesicSession'

import { RestartableApp } from './util/RestartableApp'
import { printLogs } from './util/printLogs'
import { CakeWelcomePage } from './welcome/CakeWelcomePage'
import { resolveFolderPath, setupCakeFilesServer } from './cakeBrowserInputFiles'
import { CakeBrowserWindow } from './window/CakeBrowserWindow'

process.on('unhandledRejection', (error, rejectedPromise) => {
    console.error('Unhandled Rejection at:', rejectedPromise, 'reason:', error);
    process.exit(1)
})

const cakeApp = RestartableApp(app)

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

    const srcDir = await resolveFolderPath({
        appArguments: args
        ,promptUserFunction: cakeWelcomePage.getSrcFolder
    })

    cakeWelcomePage.setLoading(srcDir)
    
    const cakeFilesServer = await setupCakeFilesServer({in: srcDir})

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

    const session = AmnesicSession(
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