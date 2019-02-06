const { BrowserWindow } = require('electron')

function createGenericBrowserWindow () {
    const {screen} = require('electron')
    const screenSize = screen.getPrimaryDisplay().size
    
    return new BrowserWindow({
        width: screenSize.width
        ,height: screenSize.height
        ,webPreferences: {
            webSecurity: false
        }
        ,sandbox: true
    })
}

exports.GenericBrowserWindow = createGenericBrowserWindow