import { WithDisabledContentSecurityPolicy } from './session/WithDisabledContentSecurityPolicy'
import { WithDisabledResponseHeaders } from './session/WithDisabledResponseHeaders'
import { InterceptableResponseSession } from './session/InterceptableResponseSession'
import { AmnesicSession } from './session/AmnesicSession'

import {app} from 'electron'

import { CakeBrowserWindow } from './window/CakeBrowserWindow'
import { getFolderPathFromUser, setupCakeFiles } from './cakeBrowserInputFiles'

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
        mainWindow.removeAllListeners()
        mainWindow = null;
    })

    let cleanedAllStorage = false
    let storageCleanError = false

    app.on('will-quit', (event) => {
        if(!cleanedAllStorage && !storageCleanError) {
            event.preventDefault()
            console.log("––––––––––––––– BEGIN BEFORE QUIT")

            session
                .forgetEverything()
                .then(() => {
                    cleanedAllStorage = true
                    console.log("–––––––––––––––  END BEFORE QUIT")                    
                    app.quit()                    
                })
                .catch((e) => {
                    console.log("Could not clear storage", e)
                    storageCleanError = true
                })
        }
    })
}

app.on('ready', init)