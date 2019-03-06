import { CakeWelcomeWindow } from './welcomeWindow/CakeWelcomeWindow'

import { ipcMain } from 'electron'

import { stripIndent } from 'common-tags'

import path from 'path'

const messages = {
    waitingForIndexFileCreation: (possibleIndexFileNames) => {
        const filesString = possibleIndexFileNames
                    .map(name => `<strong>${name}.html</strong>`)
                    .join(' ou ')

        return stripIndent`
            Pasta selecionada! Agora, crie o arquivo principal com o nome:
                ${ filesString }
        `
    }
    ,startingServer: (indexFilePath) => {
        return `Achamos o arquivo <strong>${path.basename(indexFilePath)}</strong>`
    }
}

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

    const setLoaded = srcFolder => {
        welcomeWindow.show()
        welcomeWindow.webContents.send('cakeFilesSrcFolderLoaded', srcFolder)
    }

    const setLoading = (srcFolder, message) => {
        welcomeWindow.show()
        welcomeWindow.webContents.send('cakeFilesSrcFolderLoading', srcFolder, message)
    }

    const onReloadRequested = (callback) => {
        ipcMain.once('cakeFilesInputReload', (event, srcFolder) => {
            callback(srcFolder)
        })
    }

    return {
        getSrcFolder
        ,setLoaded: setLoaded
        ,setLoading: setLoading
        ,onReloadRequested
        ,messages
    }
}

export const CakeWelcomePage = createCakeWelcomePage