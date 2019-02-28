;(() => {
    const inputPanel = document.querySelector('.inputFilesPanel')

    const inputFilesButton = document.querySelector('.inputFilesPanel-button')
    const inputFilesPathView = document.querySelector('.inputFilesPanel-pathView')

    inputFilesButton.addEventListener('click', () => {
        inputPanel.focus()
        inputPanel.classList.add('inputFilesPanel--active')
        const folder = (alert('Prompting for files'), 'a/nice/folder ')

        inputFilesButton.textContent = 'Carregando...'

        inputFilesPathView.textContent = folder;
    })


})()
