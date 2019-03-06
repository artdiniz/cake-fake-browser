import { remote, ipcRenderer } from 'electron'
import { $$InputFilesPanel } from './views/$$InputFilesPanel'

const state =  {
    isLoading: false
    ,loadingStatusMessage: ''
    ,srcFolder: ''
    ,hasFinishedLoading: false
}

const $$panel = $$InputFilesPanel(document.querySelector('.inputFilesPanel'))

const render = (state) => {
    if(state.isLoading && !state.hasFinishedLoading) {
        $$panel.renderIsLoading({
            srcFolder: state.srcFolder
            ,message: state.loadingStatusMessage
        })
    } else if(state.hasFinishedLoading){
        $$panel.renderFinishedLoading({
            srcFolder: state.srcFolder
        })
    } else if(!state.isLoading && !state.hasFinishedLoading) {
        $$panel.renderInitial()
    }
}

const setState = (newState = state) => {
    Object.assign(state, newState)
    sessionStorage.setItem('$$panel-state', JSON.stringify(state))
    render(newState)
}

setState(JSON.parse(sessionStorage.getItem('$$panel-state')) || state)

ipcRenderer.on('cakeFilesSrcFolderLoading', (event, srcFolder, message) => {
    setState({
        srcFolder: srcFolder
        ,loadingStatusMessage: message
        ,isLoading: true
        ,hasFinishedLoading: false
    })
})

ipcRenderer.once('cakeFilesSrcFolderLoaded', (event, srcFolder) => {
    setState({
        srcFolder: srcFolder
        ,isLoading: false
        ,hasFinishedLoading: true
    })
})

$$panel.onReloadCurrentSrcBtnClicked(() => {
    if((!state.isLoading && state.hasFinishedLoading) || state.isLoading) {
        ipcRenderer.send('cakeFilesInputReload', state.srcFolder)
    }
})

$$panel.onResetButtonClicked(() => {
    ipcRenderer.send('cakeFilesInputReload')
})

$$panel.onSelectSrcFolderBtnClicked(() => {
    const isInitialLoad = !state.isLoading && !state.hasFinishedLoading

    const previousState = JSON.parse(JSON.stringify(state))

    if(!state.isLoading){
        setState({
            isLoading: true
            ,hasFinishedLoading: false
            ,loadingStatusMessage: 'Uma janela se abriu para você selecionar a pasta onde criaremos os códigos do projeto'
            ,srcFolder: 'selecione uma pasta'
        })
    
        remote.dialog.showOpenDialog(
            { properties: ['openDirectory', 'createDirectory'] }
            ,(paths) => {
                if(paths) {
                    setState({
                        srcFolder: paths[0]
                    })
    
                    if(isInitialLoad) {
                        ipcRenderer.send('cakeFilesInput', state.srcFolder)
                    } else {
                        ipcRenderer.send('cakeFilesInputReload', state.srcFolder)
                    }
                    
                } else {
                    setState(previousState)
                }
            }
        )
    }
})

$$panel.onReloadCurrentSrcBtnFocused((event) => {
    if(state.isLoading) {
        event.preventDefault()
        $$panel.focusSrcFolderPath()
    }
})
