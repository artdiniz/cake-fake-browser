const { WithDisabledContentSecurityPolicy } = require('./session/WithDisabledContentSecurityPolicy')
const { WithDisabledResponseHeaders } = require('./session/WithDisabledResponseHeaders')
const { WithMultipleResponseInterceptors } = require('./session/WithMultipleResponseInterceptors')
const { AmnesicSession } = require('./session/AmnesicSession')

const {app, BrowserWindow} = require('electron')

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

function createCakeBrowserWindow() {
    const cakeBrowserWindow = createGenericBrowserWindow()
    cakeBrowserWindow.loadFile('browser/index.html')

    return cakeBrowserWindow
}

function init () {    
    
    let mainWindow =  createCakeBrowserWindow()

    const session = (
        AmnesicSession(
        WithDisabledResponseHeaders (['Access-Control-Allow-Origin', 'X-Frame-Options'],
        WithDisabledContentSecurityPolicy(
        WithMultipleResponseInterceptors(
            mainWindow.webContents.session
        ))))
    )

    // mainWindow.on('new-window', (event, url) => {
    //     event.preventDefault()
    //     const win = createCakeBrowserWindow
    //     win.once('ready-to-show', () => win.show())
    //     win.loadURL(url)
    //     event.newGuest = win
    // })

    mainWindow.on('closed', function() {
        mainWindow.removeAllListeners()
        mainWindow = null;
    })

    let cleanedAllStorage = false
    let storageCleanError = false

    app.on('will-quit', (event) => {
        if(!cleanedAllStorage && !storageCleanError) {
            event.preventDefault()
            console.log("––––––––––––––– BEGIN BEFORE QUIT")

            session
                .forgetEverything()
                .then(() => {
                    cleanedAllStorage = true
                    console.log("–––––––––––––––  END BEFORE QUIT")
                    
                    app.quit()
                })
                .catch((e) => {
                    console.log("Could not clear storage", e)
                    storageCleanError = true
                })
        }
    })
}

app.on('ready', init)