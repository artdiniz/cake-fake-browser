import { $$InputFilesProgressIcon } from "./$$InputFilesProgressIcon"

export const $$InputFilesPanel = ($panel = document.querySelector()) => {

    const $inputFilesButton = $panel.querySelector('.inputFilesPanel-chooseFolderButton')
    const $resetButton = $panel.querySelector('.inputFilesPanel-resetButton')

    const $inputFilesPathView = $panel.querySelector('.inputFilesPanel-pathView')

    const $inputFilesProgress = $panel.querySelector('.inputFilesPanel-progress')
    
    const $$progressIcon = $$InputFilesProgressIcon($inputFilesProgress)

    const renderInitial = (() => {
        const buttonInitialContent = $inputFilesButton.textContent

        return () => {
            requestAnimationFrame(() => {
                $panel.classList.remove('inputFilesPanel--loading')
                $panel.classList.remove('inputFilesPanel--loading')
                $inputFilesButton.textContent = buttonInitialContent
            })
        }
    })()
       

    const renderIsLoading = ({srcFolder}) => {
        requestAnimationFrame(() => {
            $panel.classList.add('inputFilesPanel--loading')
            $panel.classList.remove('inputFilesPanel--finishedLoading')
    
            $$progressIcon.renderLoading()
    
            $inputFilesButton.textContent = 'Carregando...'
            
            $inputFilesButton.classList.add('inputFilesButton--disabled')
            
            $inputFilesPathView.textContent = srcFolder
            $inputFilesPathView.focus()
        })
    }

    const renderFinishedLoading = ({srcFolder}) => {
        requestAnimationFrame(() => {
            $panel.classList.remove('inputFilesPanel--loading')
            $panel.classList.add('inputFilesPanel--finishedLoading')
            
            $$progressIcon.renderFinishedLoading()
    
            $inputFilesButton.textContent = 'Abrir outra pasta'
            $inputFilesButton.classList.remove('inputFilesButton--disabled')
            
            $inputFilesPathView.textContent = srcFolder
            $panel.focus()
        })
    }

    return {
        renderFinishedLoading
        ,renderIsLoading
        ,renderInitial
        ,onInputFilesBtnClicked: (callback) => $inputFilesButton.addEventListener('click', callback)
        ,onInputFilesBtnFocused: (callback) => $inputFilesButton.addEventListener('focus', callback)
        ,onResetButtonClicked: (callback) => $resetButton.addEventListener('click', callback)
        ,focusFilePath: () => $inputFilesPathView.focus()
    }

}