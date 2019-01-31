const {app, BrowserWindow} = require('electron')

function createWindow () {

    const {screen} = require('electron')
    const screenSize = screen.getPrimaryDisplay().size

    mainWindow = new BrowserWindow({
        width: screenSize.width
        ,height: screenSize.height
        ,webPreferences: {
            webSecurity: false
        }
        ,sandbox: true
    })

    mainWindow.loadFile('browser/index.html')

    const session = mainWindow.webContents.session

    const accessedOrigins = new Set()

    session.webRequest.onHeadersReceived({}, (details, callback) => {
        
        accessedOrigins.add(new URL(details.url).origin)
        
        const originalCSPHeader = details.responseHeaders['Content-Security-Policy']

        const bannedPolicyNames = ['frame-ancestors', 'frame-src', 'default-src']
        const isBannedPolicy = (policyString = '') => bannedPolicyNames
            .map(bannedPolicyName => new RegExp(`^${bannedPolicyName.toLowerCase()}`).test(policyString.trim().toLowerCase()))
            .reduce((matchedPrevious, doesMatchCurrentPolicy, x) => (matchedPrevious || doesMatchCurrentPolicy), false)
        
        if(originalCSPHeader) {
            // console.log("Original:", JSON.stringify(originalCSPHeader, null, 4))

            const newCSPHeader = details.responseHeaders['Content-Security-Policy']
                .map(policy => policy.split(";"))
                .filter(Boolean)
                .map(props => props.filter(prop => !isBannedPolicy(prop)))
                .map(props => props.join(";"))
            
            // console.log("Filtered:", JSON.stringify(newCSPHeader, null, 4))

            details.responseHeaders['Content-Security-Policy'] = newCSPHeader
        }

        if(details.responseHeaders['x-frame-options'] || details.responseHeaders['X-Frame-Options']){
            delete details.responseHeaders['x-frame-options'];
            delete details.responseHeaders['X-Frame-Options'];
            delete details.responseHeaders['access-control-allow-origin'];
            delete details.responseHeaders['Access-Control-Allow-Origin'];
        }
        callback({cancel: false, responseHeaders: details.responseHeaders});
    })

    mainWindow.on('close', function() {
        const session = mainWindow.webContents.session
        console.log("––––––––––––––– BEGIN BEFORE EXIT")

        const clearStorageDataAsync = Promise.all(
            Array.from(accessedOrigins)
            .map(origin => new Promise((resolve, reject) => 
                session.clearStorageData(
                    {origin: origin}
                    ,function(){
                        resolve(`Cleared all storge info for "${origin}"`)
                    }
                )
            ))
        )

        const printLogsPromise = clearStorageDataAsync.then(logs => logs.forEach(msg => console.log(msg)))

        console.log("–––––––––––––––  END BEFORE EXIT")

        return printLogsPromise
    })

    mainWindow.on('closed', function() {
        mainWindow.removeAllListeners()
        mainWindow = null;
    })
}


  
app.on('ready', createWindow)