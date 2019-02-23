import expandTilde from 'expand-tilde'
import path from 'path'

export const resolveAbsolutePath = function(inputPath) {
    const argsDir = inputPath
    const expandedArgsDir = argsDir !== undefined && expandTilde(argsDir)
    
    const absolutePath = path.resolve(process.cwd(), expandedArgsDir)

    return absolutePath
}
