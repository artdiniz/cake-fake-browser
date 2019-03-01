import { GenericBrowserWindow } from "../../window/GenericBrowserWindow"

const createCakeWelcomeWindow = () => {    
    let inputFilesWindow = GenericBrowserWindow()

    const cakePagePath = require.resolve('./page/index.html')

    inputFilesWindow.loadURL('file://' + cakePagePath)

    inputFilesWindow.on('closed', () => {
        inputFilesWindow.removeAllListeners()
        inputFilesWindow = null
    })

    return new Promise((resolve, reject) => {
        inputFilesWindow.once('ready-to-show', () => resolve(inputFilesWindow))
    })
}

export const CakeWelcomeWindow = createCakeWelcomeWindow