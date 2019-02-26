import {GenericBrowserWindow} from './GenericBrowserWindow'


function createCakeBrowserWindow(getIndexFilePath) {
    let cakeBrowserWindow = GenericBrowserWindow({
        title: "Caelum Cake Browser"
    })

    Promise.resolve(getIndexFilePath())
        .then(indexPath => {
            cakeBrowserWindow.loadURL('file://' + indexPath)
            cakeBrowserWindow.once('ready-to-show', () => cakeBrowserWindow.show())
        })
    
    cakeBrowserWindow.on('closed', () => {
        cakeBrowserWindow.removeAllListeners()
        cakeBrowserWindow = null
    })

    cakeBrowserWindow.webContents.on('new-window', async (event, newWindowURL, frameName, disposition, options, additionalFeatures) => {
        event.preventDefault()
        let win = await createCakeBrowserWindow(({withOpenURL: otherURL} = {}) => getIndexFilePath({
            withOpenURL: otherURL || newWindowURL
        }))
        event.newGuest = win
        win.once('closed', () => {
            win = null
            event.newGuest = null
        })
    })
    
    return cakeBrowserWindow
}


export const CakeBrowserWindow = ({getIndexFilePathFn}) => createCakeBrowserWindow(getIndexFilePathFn)