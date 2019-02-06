const { WithDisabledContentSecurityPolicy } = require('./session/WithDisabledContentSecurityPolicy')
const { WithDisabledResponseHeaders } = require('./session/WithDisabledResponseHeaders')
const { InterceptableResponseSession } = require('./session/InterceptableResponseSession')
const { AmnesicSession } = require('./session/AmnesicSession')

const { CakeBrowserWindow } = require('./window/CakeBrowserWindow')

const {app} = require('electron')

app.on('will-finish-launching', () => {
    app.on('open-file', event => {
        console.log(JSON.stringify(event, null, 2))
    })
})

async function init () {    
    
    let mainWindow = await CakeBrowserWindow()

    const session = (
        AmnesicSession(
        WithDisabledResponseHeaders(['Access-Control-Allow-Origin', 'X-Frame-Options'],
        WithDisabledContentSecurityPolicy(['frame-ancestors', 'frame-src', 'default-src'],
        InterceptableResponseSession(
            mainWindow.webContents.session
        ))))
    )

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