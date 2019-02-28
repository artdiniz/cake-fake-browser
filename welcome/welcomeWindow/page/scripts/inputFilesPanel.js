;(() => {

    const Panel = (() => {
        const $panel = document.querySelector('.inputFilesPanel')
        const $inputFilesButton = document.querySelector('.inputFilesPanel-button')
        const $inputFilesPathView = document.querySelector('.inputFilesPanel-pathView')

        const renderIsLoading = ({srcFolder}) => {
            $panel.classList.add('inputFilesPanel--loading')
    
            $inputFilesButton.textContent = 'Carregando...'
            $inputFilesButton.classList.add('inputFilesButton--disabled')
            
            $inputFilesPathView.textContent = srcFolder
            $inputFilesPathView.focus()
        }

        const defaultRenderProps = {
            isLoading: false
            ,srcFolder: ''
        }

        const render = (props = defaultRenderProps) => {
            if(props.isLoading) {
                renderIsLoading({srcFolder: props.srcFolder})
            }
        }

        return {
            render
            ,getDefaultRenderProps: () => Object.assign({}, defaultRenderProps)
            ,onInputFilesBtnClicked: (callback) => $inputFilesButton.addEventListener('click', callback)
            ,onInputFilesBtnFocused: (callback) => $inputFilesButton.addEventListener('focus', callback)
        }

    })()

    const state = Panel.getDefaultRenderProps()

    const { remote, ipcRenderer } = require('electron')

    Panel.onInputFilesBtnClicked(() => {
        if(!state.isLoading) {
            
            state.isLoading = true

            state.srcFolder = remote.dialog.showOpenDialog({
                properties: ['openDirectory']
            })[0]

            Panel.render(state)

            ipcRenderer.send('cakeFilesInput', state.srcFolder)
        }
    })

    Panel.onInputFilesBtnFocused((event) => {
        if(state.isLoading) {
            event.preventDefault()
        }
    })

    ipcRenderer.on('cakeFilesSrcFolderSet', (event, srcFolder) => {

    })

})()
