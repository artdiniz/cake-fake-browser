import { remote, ipcRenderer } from 'electron'
import { $$InputFilesPanel } from './views/$$InputFilesPanel'
import { stat } from 'fs';

const state =  {
    isLoading: false
    ,srcFolder: ''
    ,hasFinishedLoading: false
}

const $$panel = $$InputFilesPanel(document.querySelector('.inputFilesPanel'))

const render = () => {
    if(state.isLoading && !state.hasFinishedLoading) {
        $$panel.renderIsLoading({
            srcFolder: state.srcFolder
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

ipcRenderer.once('cakeFilesSrcFolderLoading', (event, srcFolder) => {
    setState({
        srcFolder: srcFolder
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

$$panel.onResetButtonClicked(() => {
    ipcRenderer.send('cakeFilesInputReload')
})

$$panel.onInputFilesBtnClicked(() => {
    const isInitialLoad = !state.isLoading && !state.hasFinishedLoading

    const previousState = JSON.parse(JSON.stringify(state))

    if(!state.isLoading){
        setState({
            isLoading: true
            ,hasFinishedLoading: false
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

$$panel.onInputFilesBtnFocused((event) => {
    if(state.isLoading) {
        event.preventDefault()
        $$panel.focusFilePath()
    }
})
