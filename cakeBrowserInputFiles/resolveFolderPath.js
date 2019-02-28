import fs from 'fs'
import { resolvePathFromCwd } from './resolvePathFromCwd'

export async function resolveFolderPath({promptUserFunction}) {
    const argsDir = resolvePathFromCwd(process.argv.slice(2)[0])

    const srcDir = fs.existsSync(argsDir)
        ? argsDir
        : await promptUserFunction()
    
    return srcDir
}
