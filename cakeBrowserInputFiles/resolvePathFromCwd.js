import expandTilde from 'expand-tilde'
import path from 'path'

export const resolvePathFromCwd = function(inputPath) {
    const argsDir = inputPath
    const expandedArgsDir = argsDir !== undefined && expandTilde(argsDir)
    
    if(!expandedArgsDir) return
    
    const absolutePath = path.resolve(process.cwd(), expandedArgsDir)

    return absolutePath
}
