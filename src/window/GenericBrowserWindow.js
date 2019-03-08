import { BrowserWindow } from 'electron'

import _merge from 'lodash/merge'
import { getIcon } from '../util/getAppPath';

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
            ,icon: getIcon('icon.png', __dirname)
        }
        , opts
    )

    console.log(getIcon('icon.png'))

    return new BrowserWindow(mergedOpts)
}

export const GenericBrowserWindow = createGenericBrowserWindow