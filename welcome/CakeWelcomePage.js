import { CakeWelcomeWindow } from './welcomeWindow/CakeWelcomeWindow'

import { ipcMain } from 'electron'

async function createCakeWelcomePage() {

    const welcomeWindow = await CakeWelcomeWindow()

    const getSrcFolder = () => {
        welcomeWindow.show()
        return new Promise((resolve, reject) => {            
            ipcMain.once('cakeFilesInput', (event, srcDir) => {
                resolve(srcDir)
            })
        })
    }

    const setSrcFolder = srcFolder => {
        welcomeWindow.show()
        welcomeWindow.webContents.send('cakeFilesSrcFolderLoaded', srcFolder)
    }

    const onReloadRequested = (callback) => {
        ipcMain.once('cakeFilesInputReload', (event, srcFolder) => {
            callback(srcFolder)
        })
    }


    return {
        getSrcFolder
        ,setSrcFolder
        ,onReloadRequested
    }
}

export const CakeWelcomePage = createCakeWelcomePage