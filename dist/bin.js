// For students only. Disabling terminal output of node warnings like performance gaps, deprecatade APIs usage and more.
// When developing, execute cake with `npm start` to enable those warnings.
process.env.NODE_NO_WARNINGS = 1

// Looking for this modules own package.json file and running its start script via npm.
// We run the start script so we can run electron installed as a dependency.
// With electron as dependency, we don't need to have a build step nor a publish method for the binaries.
// We can just `npm install -g` and run the application via CLI.

const path = require('path')

const npm = require('global-npm')
const readPkgUp = require('read-pkg-up')
import _isUndefined from 'lodash/isUndefined'
import _negate from 'lodash/negate'

import { resolveAbsolutePath } from '../cakeBrowserInputFiles/resolveAbsolutePath'

const pkgJSONPath =  readPkgUp.sync({cwd: __dirname}).path
const cakePackageDir = path.dirname(pkgJSONPath)

const argsDir = resolveAbsolutePath(process.argv.slice(2)[0])

const args = [argsDir, ...process.argv.slice(3)].filter(_negate(_isUndefined))

npm.load({prefix: cakePackageDir}, (err) => {
    if(err) throw err
    npm.commands["run-script"](["start-class",  ...args], (err) => {
        if(err) throw err
    })
})
