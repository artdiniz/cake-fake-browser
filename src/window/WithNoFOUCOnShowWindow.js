export function WithNoFOUCOnShowWindow(window) {
    const showMethod = window.show.bind(window)
    const loadURLMethod = window.loadURL.bind(window)
    
    const readyWindowEventPromise = new Promise((resolve) => {
        window.once('ready-to-show', () => {
            resolve()
        })
    })

    let readyWindowPromise = null
    
    function loadURL(...args) {
        const result = loadURLMethod(...args)

        const showTimeoutPromise = new Promise((resolve) => {
            setTimeout(() => resolve(), 2000)
        })
        readyWindowPromise = Promise.race([showTimeoutPromise, readyWindowEventPromise])

        return result
    }

    async function show(...args) {
        if(readyWindowPromise) await readyWindowPromise
        else throw new Error('To prevent FOUC yo can\'t show window without previosly loading content')

        return showMethod(...args)
    }

    return Object.assign(window, {
        loadURL,
        show
    })
}
