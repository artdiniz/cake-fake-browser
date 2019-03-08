import { GenericBrowserWindow } from '../../window/GenericBrowserWindow'
import { textHandlingContextMenuFor } from '../../menu/contextMenus'

const createCakeWelcomeWindow = () => {    
    let welcomeWindow = GenericBrowserWindow()

    textHandlingContextMenuFor(welcomeWindow)

    const cakePagePath = require.resolve('./page/index.html')
    welcomeWindow.loadURL('file://' + cakePagePath)

    welcomeWindow.on('closed', () => {
        welcomeWindow.removeAllListeners()
        welcomeWindow = null
    })

    return new Promise((resolve, reject) => {
        welcomeWindow.once('ready-to-show', () => resolve(welcomeWindow))
    })
}

export const CakeWelcomeWindow = createCakeWelcomeWindow