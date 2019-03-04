import express from 'express'
import getPort from 'get-port'
import memoize from 'memoizee'
import chokidar from 'chokidar'
import chalk from 'chalk'

import http from 'http'
import { EventEmitter } from 'events';
import fs from 'fs';

import { promisify } from 'util'

import { printLogs } from '../util/printLogs'
import { CakeIndexFileContent } from './CakeIndexFileContent'
import { getIndexFilePathAsyncIn } from './getIndexFilePathAsyncIn';

import stoppable from 'stoppable'

const getContent = memoize((indexFilePath, iframeSRC) => {
    console.log('[Index file server] Creating index content with open URL: ', chalk.cyan(iframeSRC))

    const indexContent = fs.readFileSync(indexFilePath)

    const newIndexContent = CakeIndexFileContent(indexContent)
        .withSandboxedIframe()
        .withIframeSrc(iframeSRC)
        .withInjectedScripts([
            require.resolve('./injectedScripts/injectTest.js')
        ])
        .toString()

    return newIndexContent
})

const setFileSystemWatcher = function(globPath, callback) {
    let chokidarWatcher = chokidar.watch(globPath, {
        ignoreInitial: true
        ,awaitWriteFinish: false
    })

    chokidarWatcher.on('all', callback)

    const watcher = {
        clear: () => {
            if(chokidarWatcher !== null) {
                chokidarWatcher.close()
                chokidarWatcher = null                    
            }
            return true
        }
        ,toString: () => `FS Watcher on: ${globPath}`
    }

    return watcher
}

export const setupCakeFilesServer = async ({in: srcDir}) => {
    const indexFilePath = await getIndexFilePathAsyncIn(srcDir)

    const srcFilesWatcher = setFileSystemWatcher(indexFilePath, (eventName) => {
        printLogs(`[Update Index File][${eventName}]: `, chalk.cyan(chalk.underline(indexFilePath)), 2)
        getContent.clear()
    })
    
    const serverEmitter = new EventEmitter()
    
    const expressHandler = express();
    
    const iframeSrcParameterName = 'iframeSrc'
    
    expressHandler.get('/', (req, resp) => {
        const iframeSrc = req.query[iframeSrcParameterName]
        resp.send(getContent(indexFilePath, iframeSrc))
    })

    expressHandler.use(express.static(srcDir, {
        extensions: ['html']
    }))

    expressHandler.use((req,resp) => {
        resp.status(404).send('Not found: ' + req.originalUrl)
    })

    expressHandler.use((error, req, resp, next) => {
        serverEmitter.emit('error', error)
        resp.status(500).send(error)
    })

    const server = stoppable(
        http.createServer(expressHandler)
    )

    const stopServerAsync = promisify(server.stop)
    
    const serverIsUpPromise = new Promise(async (resolve, reject) => {        
        const port = await getPort({port: 3000})

        server.once('error', (error) => {
            reject(error)
        })
        
        server.listen(port, () => {
            resolve(server.address())
        })
    })

    const serverAddress = await serverIsUpPromise

    const indexFileURL = `http://localhost:${serverAddress.port}`

    const cakeURLWithIframeSrc = memoize((iframeSrc) => iframeSrc
        ? `${indexFileURL}/?${iframeSrcParameterName}=${iframeSrc}`
        : indexFileURL
    )
    return {
        getIndexFileURL: ({withOpenURL: openURL} = {}) => cakeURLWithIframeSrc(openURL)
        ,cleanup: async () => {
            const serverShutdownWasGracefull = await stopServerAsync()
            const closedSrcDirWatcher = srcFilesWatcher.clear() 
            
            return {
                serverShutdownWasGracefull                
                ,clearedWatchers: [
                    [srcFilesWatcher, closedSrcDirWatcher]
                ]
            }
        }
    }

}