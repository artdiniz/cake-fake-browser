#!/usr/bin/env node

const npm = require('npm')

npm.load({}, (err) => {
    if(err) throw err
    npm.commands["run-script"](["start", ...process.argv.slice(2)], (err) => {
        if(err) throw err
    })
})