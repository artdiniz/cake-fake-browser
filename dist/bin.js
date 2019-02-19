#!/usr/bin/env node

// Looking for this modules own package.json file and running its start script via npm
// We run the start script so we can run electron installed as a dependency.
// With electron as dependency, we don't need to have a build step nor a publish method for the binaries
// We can just `npm install -g` and run the application via CLI

const npm = require('global-npm')
const readPkgUp = require('read-pkg-up')
const path = require('path')

const pkgJSONPath =  readPkgUp.sync({cwd: __dirname}).path
const cakePackageDir = path.dirname(pkgJSONPath)

npm.load({prefix: cakePackageDir}, (err) => {
    if(err) throw err
    npm.commands["run-script"](["start", ...process.argv.slice(2)], (err) => {
        if(err) throw err
    })
})

