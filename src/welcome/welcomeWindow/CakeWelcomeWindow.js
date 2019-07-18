import { GenericBrowserWindow } from '../../window/GenericBrowserWindow'
import { WithNoFOUCOnShowWindow } from '../../window/WithNoFOUCOnShowWindow'

import { textHandlingContextMenuFor } from '../../menu/contextMenus'

const createCakeWelcomeWindow = () => {    
    let welcomeWindow = WithNoFOUCOnShowWindow(
        GenericBrowserWindow()
    )

    textHandlingContextMenuFor(welcomeWindow)

    const cakePagePath = require.resolve('./page/index.html')
    welcomeWindow.loadURL('file://' + cakePagePath)

    welcomeWindow.on('closed', () => {
        welcomeWindow.removeAllListeners()
        welcomeWindow = null
    })

    return welcomeWindow
}

export const CakeWelcomeWindow = createCakeWelcomeWindow