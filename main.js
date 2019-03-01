import { WithDisabledContentSecurityPolicy } from './session/WithDisabledContentSecurityPolicy'
import { WithDisabledResponseHeaders } from './session/WithDisabledResponseHeaders'
import { InterceptableResponseSession } from './session/InterceptableResponseSession'
import { AmnesicSession } from './session/AmnesicSession'

import {app} from 'electron'

import { CakeBrowserWindow } from './window/CakeBrowserWindow'
import { resolveFolderPath, setupCakeFiles } from './cakeBrowserInputFiles'
import { createCleanupOnEventHandler } from './util/createCleanupOnEventHandler'

import { CakeWelcomePage } from './welcome/CakeWelcomePage'


process.on('unhandledRejection', (error, rejectedPromise) => {
    console.error('Unhandled Rejection at:', rejectedPromise, 'reason:', error);
    process.exit(1)
})

let restartFlag = false

async function init () {

    const cakeWelcomePage = await CakeWelcomePage()

    const srcDir = await resolveFolderPath({
        promptUserFunction: cakeWelcomePage.getSrcFolder
    })

    cakeWelcomePage.onReloadRequested(() => {
        restartFlag = true
        app.quit()
    })
    
    const cakeFiles = await setupCakeFiles({in: srcDir})

    cakeWelcomePage.setSrcFolder(srcDir)

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

    app.on('will-quit', createCleanupOnEventHandler(
        async function cleanSessionStorage(event, cleanupLogger){ 

            const forgotOrigins = await session.forgetEverything()

            cleanupLogger.log(
                ...forgotOrigins.map(origin => `Cleared all storge info for "${origin}"`)
            )
        }
        ,{ whenDone: app.quit }
    ))

    app.on('will-quit', createCleanupOnEventHandler(
        function cleanCakeFilesWatcher(event, cleanupLogger){ 
            const cleanedWatchers = cakeFiles.cleanup()

            cleanupLogger.log(
                ...cleanedWatchers.map(watcher => `Closed ${watcher}`)
            )
        }
        ,{ whenDone: app.quit }
    ))
}

app.on('quit', event => {
    if(restartFlag){
        event.preventDefault()
        restartFlag = false
        init()
    }
})

app.on('quit', event => {
    console.log('Good Bye! 🎂')
})

app.on('ready', init)