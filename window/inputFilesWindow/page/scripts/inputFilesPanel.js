;(() => {

    const { remote, ipcRenderer } = require('electron')

    const inputPanel = document.querySelector('.inputFilesPanel')

    const inputFilesButton = document.querySelector('.inputFilesPanel-button')
    const inputFilesPathView = document.querySelector('.inputFilesPanel-pathView')

    let isLoading = false

    inputFilesButton.addEventListener('click', () => {
        if(!isLoading) {
            inputPanel.classList.add('inputFilesPanel--loading')
            isLoading = true

            const folder = remote.dialog.showOpenDialog({
                properties: ['openDirectory']
            })[0]

            ipcRenderer.send('cakeFilesInput', folder)
            
            inputFilesButton.textContent = 'Carregando...'
            inputFilesButton.classList.add('inputFilesButton--disabled')
            
            inputFilesPathView.textContent = folder
            inputFilesPathView.focus()
        }
    })

    inputFilesButton.addEventListener('focus', (event) => {
        if(isLoading) {
            event.preventDefault()
            inputFilesPathView.focus()
        }
    })

})()
