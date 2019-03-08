import path from 'path'
import readPkgUp from 'read-pkg-up'

const pkgJSONPath =  readPkgUp.sync({cwd: __dirname}).path
const cakePackageDir = path.dirname(pkgJSONPath)

const iconsRelPath = 'resources/__icons'

const asRelativeIfFrom = (from, to) => {
    if(from) {
        return path.relative(from, to)
    } else {
        return to
    }
}


export const getPackageRootDir = (from) => asRelativeIfFrom(from, cakePackageDir)
export const getIconsDir = (from) => asRelativeIfFrom(from, path.join(cakePackageDir, iconsRelPath))
export const getIcon = (iconName, from) => asRelativeIfFrom(from, path.join(getIconsDir(), iconName))
