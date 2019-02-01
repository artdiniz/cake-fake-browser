function AccessedOriginsRecorder(session) {
    const accessedOrigins = []
    
    session.addResponseInterceptor(function recordOrigin(responseDetails) {
        accessedOrigins.push(new URL(responseDetails.url).origin)
    })
    
    return {
        getAccessedOrigins: () => Array.from(new Set(accessedOrigins))
    }
}

exports.AmnesicSession = function AmnesicSession(session) {

    const originsRecorder = AccessedOriginsRecorder(session)
    
    function forget(origins) {
        const clearStorageDataAsync = Promise.all(
            origins.map(origin => new Promise((resolve, reject) => 
                session.clearStorageData(
                    {origin: origin}
                    ,function(){
                        resolve(`Cleared all storge info for "${origin}"`)
                    }
                )
            ))
        )

        const printLogsPromise = clearStorageDataAsync.then(logs => logs.forEach(msg => console.log(msg)))

        return printLogsPromise
    }

    function forgetEverything() {
        return forget(originsRecorder.getAccessedOrigins())
    }   

    return Object.assign(session, Object.create(null, {
        forgetEverything: {
            configurable: false
            ,writable: false
            ,enumerable: true
            ,value: forgetEverything
        }
    }))
}
