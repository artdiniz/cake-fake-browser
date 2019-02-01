function WithDisabledResponseHeaders(disabledHeadersNames = [], session) {
    function isSameHeader(headerNameA, headerNameB) {
        return headerNameA.toLowerCase() == headerNameB.toLowerCase()
    }
    
    session.addResponseInterceptor(function disableResponseHeaders (details) {
        const filteredHeaders = Object.keys(details.responseHeaders)
            .filter(headerName => !disabledHeadersNames.some(disabledName => isSameHeader(disabledName, headerName)))
            .reduce((newResponseHeader, headerName) => (newResponseHeader[headerName] = details.responseHeaders[headerName]
                , newResponseHeader), {})

        return { cancel: false, responseHeaders: filteredHeaders }
    })

    return session
}

exports.WithDisabledResponseHeaders = WithDisabledResponseHeaders
