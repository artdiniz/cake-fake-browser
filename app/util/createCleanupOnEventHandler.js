import { AsyncLogger } from './AsyncLogger'
import { printLogs } from './printLogs'
/* 
    This function creates another function that receives a `event` as argument. 
    That returned function is an event handler and can be passed as argument to any kind of `EventEmitter.on` or `EventEmitter.addEventListener` function.
    
    The returned handler will run the provided `cleanUpFunction`. If the handler is called repeatdly (e.g. on multiple events being triggered), 
    it will postpone event with `event.preventDefault()` until the cleanUpFunction is done/finished.

    When the `cleanUpFunction` is done/finished, a optional `whenDone` callback will be fired.

    Example of cleanup when app quits:
    ```
        app.on('will-quit', createCleanupOnEventHandler(
            () => { // your cleanup task here }
            , {
                whenDone: () => app.emit('quit')
            }
        ))

    ```

    The above function will run cleanup, and trigger another quit event when done.
*/

export const createCleanupOnEventHandler = function (
    cleanUpFunction = (event) => Promise.reject('Handler function is not defined')
    ,{
        whenDone: whenDoneCallback = () => {}
    }
) {
    let started = false
    let finished = false
    let finishedWithError = false

    const logger = AsyncLogger()

    return function(event, ...otherArgs) {

        const isFirstTime = !started && !finished && !finishedWithError
        const isRunningCleanupTask = started && !finished && !finishedWithError

        if(isRunningCleanupTask) {
            event.preventDefault()
        }

        if(isFirstTime) {
            event.preventDefault()

            try {
                started = true
                logger.log(`––––––––––––––– BEGIN CLEANUP ${cleanUpFunction.name}`)
            
                const result = cleanUpFunction.bind(this)(event, ...otherArgs, logger)

                const resultPromise = Promise.resolve(result)
                    .then(result => {
                        finished = true
                        logger.log(`––––––––––––––– END CLEANUP ${cleanUpFunction.name}`)
                        printLogs(1, ...logger.getAllLogs(), 1)
                        whenDoneCallback()
                    })
                    .catch(error => {
                        if(!finishedWithError) {
                            finishedWithError = true
                            logger.error(error, `––––––––––––––– END CLEANUP ERROR ${cleanUpFunction.name}`)
                            printLogs(1, ...logger.getAllLogs(), 1)
                            whenDoneCallback()
                        }
                    })

                return result && result.then
                    ? resultPromise
                    : result

            } catch (error) {
                if(!finishedWithError) {
                    finishedWithError = true
                    logger.error(error, `––––––––––––––– END CLEANUP ERROR ${cleanUpFunction.name}`)
                    printLogs(1, ...logger.getAllLogs(), 1)
                    whenDoneCallback()
                }
            }
        }
        
    }
}