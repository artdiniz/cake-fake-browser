import { BrowserWindow } from 'electron'

import _merge from 'lodash/merge'

function createGenericBrowserWindow (opts = {}) {
    const {screen} = require('electron')
    const screenSize = screen.getPrimaryDisplay().size
    
    return new BrowserWindow(_merge(
        {
            width: screenSize.width
            ,height: screenSize.height
            ,webPreferences: {
                webSecurity: false
            }
            ,sandbox: true
            ,show: false
        }
        , opts
    ))
}

export const GenericBrowserWindow = createGenericBrowserWindow