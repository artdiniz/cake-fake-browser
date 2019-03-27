import {GenericBrowserWindow} from './GenericBrowserWindow'
import { fullBlownContextMenuFor } from '../menu/contextMenus'

import { setupStdLibFor } from './stdLib/setup'

function createCakeBrowserWindow(getCakeBrowserURL) {
    let cakeBrowserWindow = GenericBrowserWindow({
        title: "Caelum Cake Browser"
    })

    let showTimeout = false
    const readyWindowPromise = new Promise((resolve, reject) => {
        const timeoutChecker = setInterval(() => {
            if(showTimeout) {
                clearInterval(timeoutChecker)
                resolve(cakeBrowserWindow)
            }
        }, 10)

        cakeBrowserWindow.once('ready-to-show', () => {
            clearInterval(timeoutChecker)
            resolve(cakeBrowserWindow)
        })
    })

    Promise.resolve(getCakeBrowserURL())
        .then(cakeBrowserURL => {
            cakeBrowserWindow.loadURL(cakeBrowserURL.toString())
            setTimeout(() => { showTimeout = true }, 100)
        })

    fullBlownContextMenuFor(cakeBrowserWindow)
    setupStdLibFor(readyWindowPromise)

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

    readyWindowPromise.then(() => {
        cakeBrowserWindow.show()
        cakeBrowserWindow.focus()
    })
    
    return cakeBrowserWindow
}


export const CakeBrowserWindow = ({ getCakeBrowserURLFn }) => createCakeBrowserWindow(getCakeBrowserURLFn)