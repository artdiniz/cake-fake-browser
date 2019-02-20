import {GenericBrowserWindow} from './GenericBrowserWindow'
import { promises } from 'fs';

function createCakeBrowserWindow(getIndexFilePath) {
    const cakeBrowserWindow = GenericBrowserWindow({title: "Caelum Cake Browser"})

    Promise.resolve(getIndexFilePath())
        .then(indexPath => {
            cakeBrowserWindow.loadFile(indexPath)
            cakeBrowserWindow.once('ready-to-show', () => cakeBrowserWindow.show())
        })
    
    cakeBrowserWindow.on('closed', () => {
        cakeBrowserWindow.removeAllListeners()
    })

    cakeBrowserWindow.webContents.on('new-window', async (event, newWindowURL, frameName, disposition, options, additionalFeatures) => {
        event.preventDefault()
        const win = await createCakeBrowserWindow(otherURL => getIndexFilePath({
            withOpenURL: otherURL || newWindowURL
        }))
        event.newGuest = win
    })

    return cakeBrowserWindow
}


export const CakeBrowserWindow = ({getIndexFilePathFn}) => createCakeBrowserWindow(getIndexFilePathFn)