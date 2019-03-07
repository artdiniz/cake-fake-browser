import fs from 'fs'
import { resolvePathFromCwd } from './resolvePathFromCwd'

export async function resolveFolderPath({promptUserFunction = () => Promise.reject('You must provide a prompt folder function'), appArguments = []}) {
    const argsDir = resolvePathFromCwd(appArguments[0])

    const srcDir = fs.existsSync(argsDir)
        ? argsDir
        : await promptUserFunction()
    
    return srcDir
}
