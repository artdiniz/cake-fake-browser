import fs from 'fs'
import { resolvePathFromCwd } from './resolvePathFromCwd'
import { CakeInputFilesWindow } from '../window/inputFilesWindow/CakeInputFilesWindow'

import { ipcMain } from 'electron'

function createCakeWelcomePage() {
    const getInputFilesFromCakeInitWindow = () => {
        return new Promise((resolve, reject) => {
            const inputFilesWindow = CakeInputFilesWindow()
    
            inputFilesWindow.once('ready-to-show', () => {
                ipcMain.once('cakeFilesInput', (event, srcDir) => {
                    resolve(srcDir)
                })
            })
    
        })
    }

    return {
        getInputFilesFromCakeInitWindow
    }
}

const CakeWelcomePage = createCakeWelcomePage

const cakeWelcomePage = CakeWelcomePage()

export async function getFolderPathFromUser() {
    const argsDir = resolvePathFromCwd(process.argv.slice(2)[0])

    const srcDir = fs.existsSync(argsDir)
        ? argsDir
        : await cakeWelcomePage.getInputFilesFromCakeInitWindow()
    
    return srcDir
}
