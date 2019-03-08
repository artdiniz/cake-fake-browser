import { BrowserWindow } from 'electron'

import _merge from 'lodash/merge'
import { getIcon, getPackageRootDir } from '../util/getAppPath';

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
            ,icon: getIcon('cake.png')
        }
        , opts
    )

    return new BrowserWindow(mergedOpts)
}

export const GenericBrowserWindow = createGenericBrowserWindow