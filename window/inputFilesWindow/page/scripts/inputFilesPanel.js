;(() => {
    const inputPanel = document.querySelector('.inputFilesPanel')

    const inputFilesButton = document.querySelector('.inputFilesPanel-button')
    const inputFilesPathView = document.querySelector('.inputFilesPanel-pathView')

    let isLoading = false

    inputFilesButton.addEventListener('click', () => {
        if(!isLoading) {
            inputPanel.classList.add('inputFilesPanel--loading')
            isLoading = true

            const folder = (alert('Prompting for files'), 'a/nice/folder ')
            
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
