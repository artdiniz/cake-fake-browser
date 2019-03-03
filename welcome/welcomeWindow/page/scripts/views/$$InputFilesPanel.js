import { $$InputFilesProgressIcon } from "./$$InputFilesProgressIcon"

export const $$InputFilesPanel = ($panel = document.querySelector()) => {

    const $inputFilesButton = $panel.querySelector('.inputFilesPanel-chooseFolderButton')
    const $resetButton = $panel.querySelector('.inputFilesPanel-resetButton')

    const $inputFilesPathView = $panel.querySelector('.inputFilesPanel-pathView')

    const $inputFilesProgress = $panel.querySelector('.inputFilesPanel-progress')
    
    const $$progressIcon = $$InputFilesProgressIcon($inputFilesProgress)

    const renderPath = path => {
        return path
            .split('/')
            .map(path => `<span class="inputFilesPanel-pathView-pathPortion">${path}</span>`)
            .join('<span class="inputFilesPanel-pathView-pathDivision">/</span>')
    }

    const renderInitial = (() => {
        const buttonInitialContent = $inputFilesButton.textContent

        return () => {
            requestAnimationFrame(() => {
                $panel.classList.remove('inputFilesPanel--loading')
                $panel.classList.remove('inputFilesPanel--loading')
                $panel.classList.add('inputFilesPanel--initial')

                $inputFilesButton.classList.remove('inputFilesButton--disabled')
                
                $inputFilesButton.textContent = buttonInitialContent
                $inputFilesButton.blur()
            })
        }
    })()
       

    const renderIsLoading = ({srcFolder}) => {
        requestAnimationFrame(() => {
            $panel.classList.remove('inputFilesPanel--initial')
            $panel.classList.remove('inputFilesPanel--finishedLoading')
            $panel.classList.add('inputFilesPanel--loading')
    
            $$progressIcon.renderLoading()
    
            $inputFilesButton.textContent = 'Carregando...'
            
            $inputFilesButton.classList.add('inputFilesButton--disabled')
            
            $inputFilesPathView.innerHTML = renderPath(srcFolder)

            srcFolder.split('/').map(path => `<span class="pathPortion">${path}</span>`).join('<span>/</span>')
            $inputFilesPathView.focus()
        })
    }

    const renderFinishedLoading = ({srcFolder}) => {
        requestAnimationFrame(() => {
            $panel.classList.remove('inputFilesPanel--loading')
            $panel.classList.remove('inputFilesPanel--initial')
            $panel.classList.add('inputFilesPanel--finishedLoading')
            
            $$progressIcon.renderFinishedLoading()
    
            $inputFilesButton.textContent = 'Abrir outra pasta'
            $inputFilesButton.classList.remove('inputFilesButton--disabled')
            
            $inputFilesPathView.innerHTML = renderPath(srcFolder)
            $inputFilesPathView.focus()
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