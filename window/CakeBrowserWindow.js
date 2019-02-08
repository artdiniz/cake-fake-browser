const {GenericBrowserWindow} = require('./GenericBrowserWindow')

function createCakeBrowserWindow(getIndexFilePath) {
    const cakeBrowserWindow = GenericBrowserWindow()
    
    const indexPath = getIndexFilePath()

    cakeBrowserWindow.loadFile(indexPath)
    
    cakeBrowserWindow.once('ready-to-show', () => cakeBrowserWindow.show())

    cakeBrowserWindow.webContents.on('new-window', async (event, newWindowURL, frameName, disposition, options, additionalFeatures) => {
        event.preventDefault()
        const win = await createCakeBrowserWindow(otherURL => getIndexFilePath({
            withOpenURL: otherURL || newWindowURL
        }))
        event.newGuest = win
    })

    return cakeBrowserWindow
}


exports.CakeBrowserWindow = ({getIndexFilePathFn}) => createCakeBrowserWindow(getIndexFilePathFn)