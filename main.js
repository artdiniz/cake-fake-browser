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
        mainWindow = null;
    })

    let cleanedAllStorage = false
    let cleanedAllStorageError = false

    let stoppedCakeFilesWatcher = false

    app.on('will-quit', (event) => {
        
        if(!stoppedCakeFilesWatcher) {
            event.preventDefault()
            
            cakeFiles.cleanup()
            stoppedCakeFilesWatcher = true

            app.quit()
        }
        
        if(!cleanedAllStorage && !cleanedAllStorageError) {
            
            event.preventDefault()
            console.log("––––––––––––––– BEGIN Storage cleanup")

            session.forgetEverything()
                .then(() => {
                    cleanedAllStorage = true
                    console.log("––––––––––––––– END Storage cleanup")

                    // TODO fix quit call not working when user Quits (CMD+Q) without navigating to other site in cake browser
                    app.quit()
                })
                .catch((e) => {
                    cleanedAllStorageError = true
                    console.log("––––––––––––––– END ERROR Storage cleanup", e)
                    
                    // TODO fix quit call not working when user Quits (CMD+Q) without navigating to other site in cake browser
                    app.quit()
                })

            app.quit()
        } 


        if(stoppedCakeFilesWatcher && (cleanedAllStorage || cleanedAllStorageError)) {
            console.log('Cake Browser cleanup finished.')
        }

        if(!event.defaultPrevented){
            console.log('Quiting!')
        }

    })
}

app.on('ready', init)