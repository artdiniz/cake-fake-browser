/*
    At the time, Electron sessions can handle a single `.webRequest.onHeadersReceived` listener,
    which makes complex response interception behaviors not composable.

    This function enables responce interception composition by decorating a electron session 
    with a `addResponseInterceptor` method, allowing multiple response handlers.
*/

function InterceptableResponseSession(session) {
    const responseInterceptorHandlers = []

    session.webRequest.onHeadersReceived({}, async (responseDetails, callback) => {
        const defaultHandlerResult = {
            cancel: false
            ,responseHeaders: responseDetails.responseHeaders
            ,statusLine: responseDetails.statusLine
        }

        const mergedHandlerResults = await responseInterceptorHandlers.reduce(
            async (mergedHandlerResults, handler) => {
                const lastResults = await mergedHandlerResults

                const updatedDetails = Object.assign({}, responseDetails, {
                    responseHeaders: lastResults.responseHeaders
                    ,statusLine: lastResults.statusLine
                })

                const handlerResult = await handler(updatedDetails)

                return Object.assign(lastResults, handlerResult)
            }
            , Promise.resolve(defaultHandlerResult)
        )

        callback(mergedHandlerResults)
    })

    function addResponseInterceptor(handler) {
        responseInterceptorHandlers.push(handler)
    }

    return Object.assign(session, Object.create(null, {
        addResponseInterceptor: {
            enumerable: true
            ,writable: false
            ,configurable: false
            ,value: addResponseInterceptor
        }
    }))
}

exports.InterceptableResponseSession = InterceptableResponseSession
