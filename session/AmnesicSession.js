function AccessedOriginsRecorder(session) {
    const accessedOrigins = []
    
    session.addResponseInterceptor(function recordOrigin(responseDetails) {
        accessedOrigins.push(new URL(responseDetails.url).origin)
    })
    
    return {
        getAccessedOrigins: () => Array.from(new Set(accessedOrigins))
    }
}

export function AmnesicSession({dontForgetOrigins: ignoreOrigins = []} = {}, session) {

    const originsRecorder = AccessedOriginsRecorder(session)
    
    function forget(origins) {
        const clearStorageDataAsync = Promise.all(
            origins
            .filter(origin => !ignoreOrigins.some(ignored => ignored === origin))
            .map(origin => new Promise((resolve, reject) => 
                session.clearStorageData(
                    {origin: origin}
                    ,function(){
                        resolve(origin)
                    }
                )
            ))
        )

        return clearStorageDataAsync
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
