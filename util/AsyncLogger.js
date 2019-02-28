export const AsyncLogger = () => {
    function typedLogFunction(...logAccumulatorArrays) {
        return (...messages) => {
            logAccumulatorArrays.forEach(array => array.push(
                ...messages.map(msg => msg.toString())
            ))
        }
    }
    
    function getLogsFunction(logAccumulatorArray) {
        return () => [...logAccumulatorArray]
    }

    const allLogs = []
    const logs = []
    const errors = []

    return {
        log: typedLogFunction(logs, allLogs)
        ,error: typedLogFunction(errors, allLogs)
        ,getAllLogs: getLogsFunction(allLogs)
    }
}