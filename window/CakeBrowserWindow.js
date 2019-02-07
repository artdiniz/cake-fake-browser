const {GenericBrowserWindow} = require('./GenericBrowserWindow')

function createCakeBrowserWindow({cakeFiles, openURL} = {}) {
    const cakeBrowserWindow = GenericBrowserWindow()

    const indexFilePath = cakeFiles.getIndex({openURL})

    cakeBrowserWindow.loadFile(indexFilePath)
    
    cakeBrowserWindow.once('ready-to-show', () => cakeBrowserWindow.show())

    cakeBrowserWindow.webContents.on('new-window', async (event, url, frameName, disposition, options, additionalFeatures) => {
        event.preventDefault()
        console.log('Opening in: ' + url)
        const win = await createCakeBrowserWindow({cakeFiles, openURL: url})
        event.newGuest = win
    })

    return cakeBrowserWindow
}



exports.CakeBrowserWindow = createCakeBrowserWindow