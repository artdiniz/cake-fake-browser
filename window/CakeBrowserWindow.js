const {GenericBrowserWindow} = require('./GenericBrowserWindow')

const { BrowserInputFiles } = require('../browserInputFiles/BrowserInputFiles')

async function createCakeBrowserWindow({openURL} = {}) {
    const cakeBrowserWindow = GenericBrowserWindow()

    const indexFilePath = await BrowserInputFiles.getIndex({iframeSRC: openURL})

    cakeBrowserWindow.loadFile(indexFilePath)
    
    cakeBrowserWindow.once('ready-to-show', () => cakeBrowserWindow.show())

    cakeBrowserWindow.webContents.on('new-window', async (event, url, frameName, disposition, options, additionalFeatures) => {
        event.preventDefault()
        console.log('Opening in: ' + url)
        const win = await createCakeBrowserWindow({openURL: url})
        event.newGuest = win
    })

    return cakeBrowserWindow
}



exports.CakeBrowserWindow = createCakeBrowserWindow