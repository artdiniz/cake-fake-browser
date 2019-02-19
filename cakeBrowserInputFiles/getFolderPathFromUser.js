import { dialog } from 'electron'

import fs from 'fs'
import expandTilde from 'expand-tilde'


export function getFolderPathFromUser() {
    const argsDir = process.argv.slice(2)[0]
    const expandedArgsDir = argsDir !== undefined && expandTilde(argsDir)

    const srcDir = fs.existsSync(expandedArgsDir)
        ? expandedArgsDir
        : dialog.showOpenDialog({
            properties: ['openDirectory']
        })[0]

    return srcDir
}
