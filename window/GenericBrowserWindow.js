import { BrowserWindow } from 'electron'

import _merge from 'lodash/merge'

function createGenericBrowserWindow (opts = {}) {
    const {screen} = require('electron')
    const screenSize = screen.getPrimaryDisplay().size

    const mergedOpts = _merge(
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
    )
    
    return new BrowserWindow(mergedOpts)
}

export const GenericBrowserWindow = createGenericBrowserWindow