import { GenericBrowserWindow } from './GenericBrowserWindow'
import { WithNoFOUCOnShowWindow } from './WithNoFOUCOnShowWindow'

import { fullBlownContextMenuFor } from '../menu/contextMenus'

import { setupStdLibFor } from './stdLib/setup'

function createCakeBrowserWindow(getCakeBrowserURL) {
    let cakeBrowserWindow = WithNoFOUCOnShowWindow(
        GenericBrowserWindow({
            title: "Caelum Cake Browser"
        })
    )

    Promise
        .resolve(getCakeBrowserURL())
        .then(cakeBrowserURL => {
            cakeBrowserWindow.loadURL(cakeBrowserURL.toString())
        })
        
    fullBlownContextMenuFor(cakeBrowserWindow)
    setupStdLibFor(cakeBrowserWindow)

    cakeBrowserWindow.on('closed', () => {
        cakeBrowserWindow.removeAllListeners()
        cakeBrowserWindow = null
    })

    cakeBrowserWindow.webContents.on('new-window', (event, newWindowURL, frameName, disposition, options, additionalFeatures) => {
        event.preventDefault()
        let win = createCakeBrowserWindow(({withOpenURL: otherURL} = {}) => getCakeBrowserURL({
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


export const CakeBrowserWindow = ({ getCakeBrowserURLFn }) => createCakeBrowserWindow(getCakeBrowserURLFn)