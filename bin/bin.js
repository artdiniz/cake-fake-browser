// For students only. Disabling terminal output of node warnings like performance gaps, deprecatade APIs usage and more.
// When developing, execute cake with `npm start` to enable those warnings.
process.env.NODE_NO_WARNINGS = 1

// Looking for this modules own package.json file and running its start script via npm.
// We run the start script so we can run electron installed as a dependency.
// With electron as dependency, we don't need to have a build step nor a publish method for the binaries.
// We can just `npm install -g` and run the application via CLI.

import execa from 'execa'

import _isUndefined from 'lodash/isUndefined'
import _negate from 'lodash/negate'

import { resolvePathFromCwd } from '../src/cakeBrowserInputFiles/resolvePathFromCwd'
import { getPackageRootDir } from '../src/util/getAppPath'

const cakePackageDir = getPackageRootDir()

const argsDir = resolvePathFromCwd(process.argv.slice(2)[0])
const args = [argsDir, ...process.argv.slice(3)].filter(_negate(_isUndefined))

execa('npm', ['run-script', 'start-class', ...args], {
    cwd: cakePackageDir
    ,stdin: process.stdin
    ,stdout: process.stdout
    ,stderr: process.stderr
})
