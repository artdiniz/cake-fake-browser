import once from 'once'

import { createCleanupOnEventHandler } from './createCleanupOnEventHandler'
import { printLogs } from './printLogs'

/*
    RestartableApp creates a wrapper around electron app.

    The wrapped app has `start` and `restart` methods. 
        `start` method receives a function that will be called whe electronapp `ready` event is emmited
        `restart` method will re-execute the function passed to `start` before, but will perform a cleanup before that.

    Also, the wrapped app creates 3 event abstractions around the electron `will-quit` event that can be listened calling:
        • `onWillQuitBeforeCleanup` – adds functions to execute before quit cleanup
        • `addCleanupTask` –  adds cleanup tasks that must run anyway before quit and restart. By "run anyway" I mean it ignores errors thrown by the tasks.
        • `onWillQuitAfterCleanup` – adds functions to execute after quit cleanup is finished. Note that app will surelly quit after those
*/

export const RestartableApp = (app) => {
    let cleanupTasks = []
    let beforeQuitCleanupHandlers = []
    let afterQuitCleanupHandlers = []

    const addCleanupTask = task => cleanupTasks.push(task)
    const onWillQuitBeforeCleanup = callback => beforeQuitCleanupHandlers.push(callback)
    const onWillQuitAfterCleanup = callback => afterQuitCleanupHandlers.push(callback)

    const {start, restartFunction: _restartFunction} = (() => {
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

            return fn(...args)
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
            ,restartFunction: (...args) => initFunction(...args)
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

    const restart = (...args) => {
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

                const restartPromise = new Promise((resolve, reject) => {
                    app.once('will-quit', event => {
                        event.preventDefault()
                        printLogs(1, '* Cleanup succesfull! Proceeding with reset. *', 1)
                        resolve(_restartFunction(...args))
                    })
                })

                app.quit()

                return restartPromise
            })
    }

    return {
        addCleanupTask: addCleanupTask
        ,onWillQuitBeforeCleanup: onWillQuitBeforeCleanup
        ,onWillQuitAfterCleanup: onWillQuitAfterCleanup
        ,restart: restart
        ,start: start
    }
}