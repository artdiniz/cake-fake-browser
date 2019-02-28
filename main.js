import { WithDisabledContentSecurityPolicy } from './session/WithDisabledContentSecurityPolicy'
import { WithDisabledResponseHeaders } from './session/WithDisabledResponseHeaders'
import { InterceptableResponseSession } from './session/InterceptableResponseSession'
import { AmnesicSession } from './session/AmnesicSession'

import {app} from 'electron'

import { CakeBrowserWindow } from './window/CakeBrowserWindow'
import { getFolderPathFromUser, setupCakeFiles } from './cakeBrowserInputFiles'
import { createCleanupOnEventHandler } from './util/createOnEventCleanupHandler'


process.on('unhandledRejection', (error, rejectedPromise) => {
    console.error('Unhandled Rejection at:', rejectedPromise, 'reason:', error);
    process.exit(1)
})

async function init () {

    const srcDir = getFolderPathFromUser()
    
    const cakeFiles = await setupCakeFiles({in: srcDir})

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
        mainWindow = null;
    })

    app.on('will-quit', createCleanupOnEventHandler(
        async function cleanSessionStorage(event, cleanupLogger){ 

            const forgotOrigins = await session.forgetEverything()

            cleanupLogger.log(forgotOrigins
                .map(origin => `Cleared all storge info for "${origin}"`)
                .join('\n')
            )
        }
        ,{ whenDone: app.quit }
    ))

    app.on('will-quit', createCleanupOnEventHandler(
        function cleanCakeFilesWatcher(event, cleanupLogger){ 
            const cleanedWatchers = cakeFiles.cleanup()

            cleanupLogger.log(cleanedWatchers
                .map(watcher => `Closed ${watcher}`)
                .join('\n')
            )
        }
        ,{ whenDone: app.quit }
    ))
        
    app.on('will-quit', event => {
        if(!event.defaultPrevented){
            console.log('Good Bye! 🎂')
        }
    })
}

app.on('ready', init)