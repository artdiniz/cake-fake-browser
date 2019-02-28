import path from 'path'
import { GenericBrowserWindow } from "../GenericBrowserWindow"

const createCakeInputFilesWindow = () => {
    let inputFilesWindow = GenericBrowserWindow()

    const cakePagePath = require.resolve('./page/index.html')

    inputFilesWindow.loadURL('file://' + cakePagePath)
    inputFilesWindow.once('ready-to-show', () => inputFilesWindow.show())

    inputFilesWindow.on('closed', () => {
        inputFilesWindow.removeAllListeners()
        inputFilesWindow = null
    })

    return inputFilesWindow
}

export const CakeInputFilesWindow = createCakeInputFilesWindow