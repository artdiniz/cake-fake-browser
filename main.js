const {app, BrowserWindow} = require('electron')

function createWindow () {

    const {screen} = require('electron')
    
    const screenSize = screen.getPrimaryDisplay().size

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: screenSize.width
        ,height: screenSize.height
        ,nodeIntegration: "iframe"
        ,webPreferences: {
            webSecurity: false
        }
    })

    // e carrega index.html do app.
    mainWindow.loadFile('browser/index.html')

    mainWindow.webContents.session.webRequest.onHeadersReceived({}, (d, c) => {
        if(d.responseHeaders['x-frame-options'] || d.responseHeaders['X-Frame-Options']){
            delete d.responseHeaders['x-frame-options'];
            delete d.responseHeaders['X-Frame-Options'];
            delete d.responseHeaders['access-control-allow-origin'];
            delete d.responseHeaders['Access-Control-Allow-Origin'];
        }
        c({cancel: false, responseHeaders: d.responseHeaders});
    }   );

    mainWindow.on('closed', function() {
        mainWindow.removeAllListeners();   
        mainWindow = null;
    });
}


  
app.on('ready', createWindow)