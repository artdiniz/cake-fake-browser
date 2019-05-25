import fs from 'fs'
import { resolvePathFromCwd } from './resolvePathFromCwd'

export async function promptUserIfInvalidPath({path = '', promptUserFunction = () => Promise.reject('You must provide a prompt folder function')}) {
    const relativePath = resolvePathFromCwd(path)

    const srcDir = fs.existsSync(relativePath)
        ? relativePath
        : await promptUserFunction()
    
    return srcDir
}
