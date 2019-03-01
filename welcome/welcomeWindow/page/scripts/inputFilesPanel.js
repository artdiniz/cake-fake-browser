import { remote, ipcRenderer } from 'electron'
import { $$InputFilesPanel } from './views/$$InputFilesPanel'

const state =  {
    isLoading: false
    ,srcFolder: ''
    ,finishedLoading: false
}

const $$panel = $$InputFilesPanel(document.querySelector('.inputFilesPanel'))

const render = () => {
    if(state.isLoading && !state.finishedLoading) {
        $$panel.renderIsLoading({
            srcFolder: state.srcFolder
        })
    } else if(state.finishedLoading){
        $$panel.renderFinishedLoading({
            srcFolder: state.srcFolder
        })
    } else if(!state.isLoading && !state.finishedLoading) {
        $$panel.renderInitial()
    }
}

const setState = (newState = state) => {
    Object.assign(state, newState)
    sessionStorage.setItem('$$panel-state', JSON.stringify(state))
    render(newState)
}

setState(JSON.parse(sessionStorage.getItem('$$panel-state')) || state)

ipcRenderer.once('cakeFilesSrcFolderLoaded', (event, srcFolder) => {
    setState({
        srcFolder: srcFolder
        ,isLoading: false
        ,finishedLoading: true
    })
})

$$panel.onInputFilesBtnClicked(() => {
    if(!state.isLoading && !state.finishedLoading) {

        const previousState = JSON.parse(JSON.stringify(state))

        setState({
            isLoading: true
            ,finishedLoading: false
            ,srcFolder: 'selecione uma pasta'
        })

        remote.dialog.showOpenDialog(
            {
                properties: ['openDirectory', 'createDirectory']
            }
            ,(paths) => {
                if(paths) {
                    setState({
                        srcFolder: paths[0]
                    })
            
                    ipcRenderer.send('cakeFilesInput', state.srcFolder)
                } else {
                    setState(previousState)
                }
            }
        )
    } else if(state.finishedLoading) {
        ipcRenderer.send('cakeFilesInputReload')
    }
})

$$panel.onInputFilesBtnFocused((event) => {
    if(state.isLoading) {
        event.preventDefault()
        $$panel.focusFilePath()
    }
})
