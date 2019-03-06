import { $$InputFilesProgressIcon } from "./$$InputFilesProgressIcon"

export const $$InputFilesPanel = ($panel = document.querySelector()) => {

    const $srcFolderPathView = $panel.querySelector('.inputFilesPanel-pathView')
    
    const $selectSrcFolderButton = $panel.querySelector('.inputFilesPanel-chooseFolderButton')
    const $resetButton = $panel.querySelector('.inputFilesPanel-resetButton')

    const $inputFilesProgress = $panel.querySelector('.inputFilesPanel-progress')
    const $$progressIcon = $$InputFilesProgressIcon($inputFilesProgress)

    const renderPath = path => {
        return path
            .split('/')
            .map(path => `<span class="inputFilesPanel-pathView-pathPortion">${path}</span>`)
            .join('<span class="inputFilesPanel-pathView-pathDivision">/</span>')
    }

    const renderInitial = (() => {
        const buttonInitialContent = $selectSrcFolderButton.textContent

        return () => {
            requestAnimationFrame(() => {
                $panel.classList.remove('inputFilesPanel--loading')
                $panel.classList.remove('inputFilesPanel--loading')
                $panel.classList.add('inputFilesPanel--initial')

                $selectSrcFolderButton.classList.remove('inputFilesButton--disabled')
                
                $selectSrcFolderButton.textContent = buttonInitialContent
                $selectSrcFolderButton.blur()
            })
        }
    })()
       

    const renderIsLoading = ({srcFolder}) => {
        requestAnimationFrame(() => {
            $panel.classList.remove('inputFilesPanel--initial')
            $panel.classList.remove('inputFilesPanel--finishedLoading')
            $panel.classList.add('inputFilesPanel--loading')
    
            $$progressIcon.renderLoading()
    
            $selectSrcFolderButton.textContent = 'Carregando...'
            
            $selectSrcFolderButton.classList.add('inputFilesButton--disabled')
            
            $srcFolderPathView.innerHTML = renderPath(srcFolder)

            srcFolder.split('/').map(path => `<span class="pathPortion">${path}</span>`).join('<span>/</span>')
            $srcFolderPathView.focus()
        })
    }

    const renderFinishedLoading = ({srcFolder}) => {
        requestAnimationFrame(() => {
            $panel.classList.remove('inputFilesPanel--loading')
            $panel.classList.remove('inputFilesPanel--initial')
            $panel.classList.add('inputFilesPanel--finishedLoading')
            
            $$progressIcon.renderFinishedLoading()
    
            $selectSrcFolderButton.textContent = 'Abrir outra pasta'
            $selectSrcFolderButton.classList.remove('inputFilesButton--disabled')
            
            $srcFolderPathView.innerHTML = renderPath(srcFolder)
            $srcFolderPathView.focus()
        })
    }

    return {
        renderFinishedLoading
        ,renderIsLoading
        ,renderInitial
        ,onSelectSrcFolderBtnClicked: (callback) => $selectSrcFolderButton.addEventListener('click', callback)
        ,onReloadCurrentSrcBtnFocused: (callback) => $selectSrcFolderButton.addEventListener('focus', callback)
        ,onResetButtonClicked: (callback) => $resetButton.addEventListener('click', callback)
        ,focusSrcFolderPath: () => $srcFolderPathView.focus()
    }

}