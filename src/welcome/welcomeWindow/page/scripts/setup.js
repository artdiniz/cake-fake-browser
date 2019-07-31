const mainPath = require.resolve('./scripts/main.js')

require = require('esm')(module)

require(mainPath)
