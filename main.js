import { WithDisabledContentSecurityPolicy } from './session/WithDisabledContentSecurityPolicy'
import { WithDisabledResponseHeaders } from './session/WithDisabledResponseHeaders'
import { InterceptableResponseSession } from './session/InterceptableResponseSession'
import { AmnesicSession } from './session/AmnesicSession'

import {app} from 'electron'

import { CakeBrowserWindow } from './window/CakeBrowserWindow'
import { resolveFolderPath, setupCakeFiles } from './cakeBrowserInputFiles'
import { createCleanupOnEventHandler } from './util/createCleanupOnEventHandler'

import { CakeWelcomePage } from './welcome/CakeWelcomePage'
import { printLogs } from './util/printLogs';


process.on('unhandledRejection', (error, rejectedPromise) => {
    console.error('Unhandled Rejection at:', rejectedPromise, 'reason:', error);
    process.exit(1)
})

let restartFlag = false

async function init () {

    app.on('window-all-closed', () => { 
        app.quit()
    })
    
    app.once('quit', event => {
        console.log('Good Bye! 🎂')
    })

    const cakeWelcomePage = await CakeWelcomePage()

    const srcDir = await resolveFolderPath({
        promptUserFunction: cakeWelcomePage.getSrcFolder
    })
    
    const cakeFiles = await setupCakeFiles({in: srcDir})

    cakeWelcomePage.setSrcFolder(srcDir)

    cakeWelcomePage.onReloadRequested(() => {
        restartFlag = true
        app.quit()
    })

    let mainWindow = CakeBrowserWindow({
        getIndexFilePathFn: cakeFiles.getIndexPath
    })

    const session = (
        AmnesicSession(
        WithDisabledResponseHeaders(['Access-Control-Allow-Origin', 'X-Frame-Options'],
        WithDisabledContentSecurityPolicy(['frame-ancestors', 'frame-src', 'default-src'],
        InterceptableResponseSession(
            mainWindow.webContents.session
        ))))
    )

    mainWindow.on('closed', function() {
        mainWindow.removeAllListeners()
        mainWindow = null;
    })

    const sessionStorageCleanOnQuit = new Promise((resolve, reject) => {
        app.on('will-quit', createCleanupOnEventHandler(
            async function cleanSessionStorage(event, cleanupLogger){ 
    
                const forgotOrigins = await session.forgetEverything()
    
                cleanupLogger.log(
                    ...forgotOrigins.map(origin => `Cleared all storge info for "${origin}"`)
                )
            }, { 
                whenDone: () => resolve()
            }
        ))
    })

    const watchersCleanOnQuit = new Promise((resolve, reject) => {
        app.on('will-quit', createCleanupOnEventHandler(
            function cleanCakeFilesWatcher(event, cleanupLogger){ 
                const cleanedWatchers = cakeFiles.cleanup()

                cleanupLogger.log(
                    ...cleanedWatchers.map(watcher => `Closed ${watcher}`)
                )
            }
            ,{ whenDone: () => resolve() }
        ))
    })

    const cleanupOnQuitPromise = Promise.all([sessionStorageCleanOnQuit, watchersCleanOnQuit])

    app.on('will-quit', event => {
        if(restartFlag){
            event.preventDefault()

            printLogs(1, '* Reload requested. Starting cleanup: *', 1)

            cleanupOnQuitPromise
                .then(() => {
                    printLogs(1, '* Reload cleanup succesfull! Reloading: *', 1)
                    restartFlag = false
                    app.removeAllListeners()
                    return init()
                })
                .then(() => {
                    printLogs(1, '* Reload successfull *', 1)
                })
        } else {
            event.preventDefault()

            printLogs(1, '* Quit requested. Starting cleanup: *', 1)

            cleanupOnQuitPromise
                .then(() => {
                    printLogs(1, '* Quit cleanup succesfull! *', 1)
                    app.removeAllListeners()
                    app.once('quit', event => {
                        console.log('Good Bye! 🎂')
                    })
                    app.quit()
                })

        }
    })
}

app.on('ready', init)