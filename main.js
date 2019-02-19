import { WithDisabledContentSecurityPolicy } from './session/WithDisabledContentSecurityPolicy'
import { WithDisabledResponseHeaders } from './session/WithDisabledResponseHeaders'
import { InterceptableResponseSession } from './session/InterceptableResponseSession'
import { AmnesicSession } from './session/AmnesicSession'

import { CakeBrowserInputFilesSetup } from './cakeBrowserInputFiles/CakeBrowserInputFilesSetup'
import { CakeBrowserWindow } from './window/CakeBrowserWindow'

import {app, dialog} from 'electron'

import fs from 'fs'
import expandTilde from 'expand-tilde'


async function init () {

    const argsDir = process.argv.slice(2)[0]
    const expandedArgsDir = argsDir !== undefined && expandTilde(argsDir)

    const srcDir =  fs.existsSync(expandedArgsDir)
        ? expandedArgsDir
        : dialog.showOpenDialog({
            properties: ['openDirectory']
        })[0]
    
    let cakeFiles = await CakeBrowserInputFilesSetup.in(srcDir)

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
        cakeFiles.deleteAll()
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