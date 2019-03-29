import { ipcMain } from 'electron'

import { GenericBrowserWindow } from '../../GenericBrowserWindow'

import fs from 'fs'
import compileTemplateString from 'es6-template-strings'

const promptTemplate = ({message, defaultValue}) => compileTemplateString(
    fs.readFileSync(require.resolve('./prompt.html').toString())
    ,{ message, defaultValue }
)

const promptHeightFor = (message) => {
    const baseHeight = 136

    const upperCaseLetters = message.length - message.replace(/[A-Z]/g, '').length; 
    const lowerCaseLetter = message.length - upperCaseLetters
    const messageHeight = 20 * (Math.ceil(upperCaseLetters / 29) + Math.ceil(lowerCaseLetter / 40))

    return baseHeight + messageHeight
}

const waitNext = () => new Promise(resolve => setTimeout(() => resolve(), 0))

export const setupPromptFor =  windowPromise => {
    let promptResponse
    ipcMain.on('window.prompt', async (event, {message = "", defaultValue = ""}) => {
        promptResponse = null

        await waitNext()
        await waitNext()

        const window = await windowPromise
        
        let promptWindow = GenericBrowserWindow({
            width: 440,
            height: promptHeightFor(message),
            minHeight: 156,
            resizable: false,
            movable: false,
            alwaysOnTop: true,
            frame: false,
            parent: window,
            focusable: true,
            webPreferences: {
                devTools: true
            }
        })

        const promptHtml = promptTemplate({message, defaultValue})
        
        promptWindow.loadURL('data:text/html,' + promptHtml)

        promptWindow.once('ready-to-show', () => promptWindow.show())
        
        promptWindow.on('closed', function() {
            event.returnValue = promptResponse
            promptWindow = null
        })

        ipcMain.on('prompt-response', function(event, arg) {
            if (!arg){ arg = '' }
            promptResponse = arg
        })
    })

}