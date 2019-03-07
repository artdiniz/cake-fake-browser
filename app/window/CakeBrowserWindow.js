import {GenericBrowserWindow} from './GenericBrowserWindow'


function createCakeBrowserWindow(getCakeBrowserURL) {
    let cakeBrowserWindow = GenericBrowserWindow({
        title: "Caelum Cake Browser"
    })

    Promise.resolve(getCakeBrowserURL())
        .then(cakeBrowserURL => {
            cakeBrowserWindow.loadURL(cakeBrowserURL.toString())
            cakeBrowserWindow.once('ready-to-show', () => cakeBrowserWindow.show())
        })
    
    cakeBrowserWindow.on('closed', () => {
        cakeBrowserWindow.removeAllListeners()
        cakeBrowserWindow = null
    })

    cakeBrowserWindow.webContents.on('new-window', async (event, newWindowURL, frameName, disposition, options, additionalFeatures) => {
        event.preventDefault()
        let win = await createCakeBrowserWindow(({withOpenURL: otherURL} = {}) => getCakeBrowserURL({
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


export const CakeBrowserWindow = ({getCakeBrowserURLFn}) => createCakeBrowserWindow(getCakeBrowserURLFn)