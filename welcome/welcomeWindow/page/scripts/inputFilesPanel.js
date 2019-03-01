(($$InputFilesPanel) => {

    const $$panel = $$InputFilesPanel(document.querySelector('.inputFilesPanel'))

    const state = $$panel.getDefaultRenderProps()

    const { remote, ipcRenderer } = require('electron')

    ipcRenderer.once('cakeFilesSrcFolderLoaded', (event, srcFolder) => {
        state.srcFolder = srcFolder
        state.isLoading = false
        state.finishedLoading = true

        $$panel.render(state)
    })

    $$panel.onInputFilesBtnClicked(() => {
        if(!state.isLoading) {
            
            state.isLoading = true
            state.finishedLoading = false

            $$panel.render(state)
            
            state.srcFolder = remote.dialog.showOpenDialog({
                properties: ['openDirectory']
            })[0]

            $$panel.render(state)

            ipcRenderer.send('cakeFilesInput', state.srcFolder)
        }
    })

    $$panel.onInputFilesBtnFocused((event) => {
        if(state.isLoading) {
            event.preventDefault()
        }
    })


})($$InputFilesPanel)