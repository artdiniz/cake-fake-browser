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

function createCakeWelcomePage() {

    const welcomeWindow = CakeWelcomeWindow()

    const getSrcFolder = async () => {
        await welcomeWindow.show()
        return await new Promise((resolve, reject) => {            
            ipcMain.once('cakeFilesInput', (event, srcDir) => {
                resolve(srcDir)
            })
        })
    }

    const showLoading = async (srcFolder, message) => {
        await welcomeWindow.show()
        welcomeWindow.webContents.send('cakeFilesSrcFolderLoading', srcFolder, message)
    }

    const showLoaded = async (srcFolder) => {
        await welcomeWindow.show()
        welcomeWindow.webContents.send('cakeFilesSrcFolderLoaded', srcFolder)
    }

    const onReloadRequested = (callback) => {
        ipcMain.once('cakeFilesInputReload', (event, srcFolder) => {
            callback(srcFolder)
        })
    }

    return {
        getSrcFolder
        ,showLoaded: showLoaded
        ,showLoading: showLoading
        ,onReloadRequested
        ,messages
    }
}

export const CakeWelcomePage = createCakeWelcomePage