import { CakeWelcomeWindow } from './welcomeWindow/CakeWelcomeWindow'

import { ipcMain } from 'electron'

function createCakeWelcomePage() {

    const welcomeWindow = CakeWelcomeWindow()

    const getSrcFolder = () => {
        return new Promise((resolve, reject) => {            
            ipcMain.once('cakeFilesInput', (event, srcDir) => {
                resolve(srcDir)
            })
        })
    }

    const setSrcFolder = srcFolder => {
        welcomeWindow.webContents.send('cakeFilesSrcFolderSet', srcFolder)
    }



    return {
        getSrcFolder
        ,setSrcFolder
    }
}

export const CakeWelcomePage = createCakeWelcomePage