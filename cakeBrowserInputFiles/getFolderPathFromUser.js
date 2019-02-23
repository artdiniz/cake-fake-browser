import fs from 'fs'
import { dialog } from 'electron'
import { resolveAbsolutePath } from './resolveAbsolutePath'


export function getFolderPathFromUser() {
    const argsDir = resolveAbsolutePath(process.argv.slice(2)[0])

    const srcDir = fs.existsSync(argsDir)
        ? argsDir
        : dialog.showOpenDialog({
            properties: ['openDirectory']
        })[0]

    return srcDir
}
