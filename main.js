import { WithDisabledContentSecurityPolicy } from './session/WithDisabledContentSecurityPolicy'
import { WithDisabledResponseHeaders } from './session/WithDisabledResponseHeaders'
import { InterceptableResponseSession } from './session/InterceptableResponseSession'
import { AmnesicSession } from './session/AmnesicSession'

import {app} from 'electron'
import once from 'once'

import { CakeBrowserWindow } from './window/CakeBrowserWindow'
import { resolveFolderPath, setupCakeFilesServer } from './cakeBrowserInputFiles'

import { CakeWelcomePage } from './welcome/CakeWelcomePage'
import { printLogs } from './util/printLogs'

import { createCleanupOnEventHandler } from './util/createCleanupOnEventHandler'

process.on('unhandledRejection', (error, rejectedPromise) => {
    console.error('Unhandled Rejection at:', rejectedPromise, 'reason:', error);
    process.exit(1)
})


function CakeApp(app) {
    let cleanupTasks = []
    let beforeQuitCleanupHandlers = []
    let afterQuitCleanupHandlers = []

    const addCleanupTask = task => cleanupTasks.push(task)
    const onWillQuitBeforeCleanup = callback => beforeQuitCleanupHandlers.push(callback)
    const onWillQuitAfterCleanup = callback => afterQuitCleanupHandlers.push(callback)

    const {start, resetFunction: _resetFunction} = (() => {
        let wasInitiated = false
        let initFunction = () => Promise.reject(`App wasn't initiated. No init function provided`)

        const withInitialSetup = (fn) => (...args) => {
            cleanupTasks = []
            beforeQuitCleanupHandlers = []
            afterQuitCleanupHandlers = []
            
            app
                .removeAllListeners()
                .on('window-all-closed', app.quit)
                .on('will-quit', quitWithCleanup)

            fn(...args)
        }
    
        return {
            start: (startCallback) => {
                if(!wasInitiated){
                    wasInitiated = true
                    initFunction = withInitialSetup(startCallback)
                    app.on('ready', initFunction)
                } else {
                    throw new Error('App was already initiated.')
                }
            }
            ,resetFunction: (...args) => initFunction(...args)
        }
    })()

    const quitWithCleanup = (event) => {
        event.preventDefault()
        app.removeAllListeners('will-quit')

        beforeQuitCleanupHandlers.forEach(handler => 
            app.on('will-quit', once(handler))
        )

        cleanupTasks.forEach(task =>
            app.on('will-quit', createCleanupOnEventHandler(
                task, 
                { whenDone: app.quit }
            ))
        )

        afterQuitCleanupHandlers
            .forEach(handler => 
                app.on('will-quit', (event) => {
                    if(!event.defaultPrevented) {
                        handler(event)
                    }
                })
            )
        
        setImmediate(app.quit)
    }

    const reset = (...args) => {
        printLogs(1, '* Waiting clean up before reset! *', 1)
        const cleanupPromise = Promise.all(
            cleanupTasks.map(task => new Promise((resolve, reject) => {
                createCleanupOnEventHandler(task, {
                    whenDone: () => resolve()
                })({preventDefault: () => {
                    console.log('tirar isso daqui')
                }})
            }))
        )
        
        return cleanupPromise
            .then(() => {
                app.removeAllListeners()
                app.once('will-quit', event => {
                    event.preventDefault()
                    printLogs(1, '* Cleanup succesfull! Proceeding with reset. *', 1)
                    _resetFunction(...args)
                })

                app.quit()
            })
    }

    return {
        addCleanupTask: addCleanupTask
        ,onWillQuitBeforeCleanup: onWillQuitBeforeCleanup
        ,onWillQuitAfterCleanup: onWillQuitAfterCleanup
        ,reset: reset
        ,start: start
    }
}

const cakeApp = CakeApp(app)

async function init ({args = process.argv.slice(2)}) {

    cakeApp.onWillQuitBeforeCleanup(() => printLogs(1, '* Quit requested. *', 1))
    cakeApp.onWillQuitAfterCleanup(() => printLogs(1, '* Quit cleanup succesfull! *', 1))
    cakeApp.onWillQuitAfterCleanup(() => printLogs('Good Bye! 🎂'))

    const cakeWelcomePage = await CakeWelcomePage()

    cakeWelcomePage.onReloadRequested(newSrcFolder => {
        printLogs(1, '* Reload requested *', 1)
        cakeApp
            .reset({args: [newSrcFolder, ...process.argv.slice(3)]})
            .then(() => {
                printLogs(1, '* Reload successfull *', 1)
            })
    })

    const srcDir = await resolveFolderPath({
        appArguments: args
        ,promptUserFunction: cakeWelcomePage.getSrcFolder
    })

    cakeWelcomePage.setLoading(srcDir)
    
    const cakeFilesServer = await setupCakeFilesServer({in: srcDir})

    let mainWindow = CakeBrowserWindow({
        getCakeBrowserURLFn: cakeFilesServer.getIndexFileURL
    })

    const session = AmnesicSession(
                    WithDisabledResponseHeaders(['Access-Control-Allow-Origin', 'X-Frame-Options'],
                    WithDisabledContentSecurityPolicy(['frame-ancestors', 'frame-src', 'default-src'],
                    InterceptableResponseSession(
                        mainWindow.webContents.session
                    ))))

    mainWindow.on('closed', function() {
        mainWindow.removeAllListeners()
        mainWindow = null;
    })

    cakeApp.addCleanupTask(async function cleanSessionStorage(event, cleanupLogger){
        const forgotOrigins = await session.forgetEverything()
        cleanupLogger.log(
            ...forgotOrigins.map(origin => `Cleared all storge info for "${origin}"`)
        )
    })

    cakeApp.addCleanupTask(async function destroyCakeFilesServer(event, cleanupLogger){ 
        const {clearedWatchers, serverShutdownWasGracefull} = await cakeFilesServer.cleanup()
        
        cleanupLogger.log(...[
            `Closed cake files server ${
                serverShutdownWasGracefull 
                    ? 'gracefully' 
                    : 'with a piano in the head'
            }`
            ,...clearedWatchers.map(([watcher, wasClosed]) => wasClosed
                ? `Closed ${watcher}`
                : `Couldn't close src dir watchers`
            )
        ])
    })

    cakeWelcomePage.setLoaded(srcDir)
}

cakeApp.start(init)