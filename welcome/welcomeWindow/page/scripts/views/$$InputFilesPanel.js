import { $$InputFilesProgressIcon } from "./$$InputFilesProgressIcon"

export const $$InputFilesPanel = ($panel = document.querySelector()) => {

    const $srcFolderPathView = $panel.querySelector('.inputFilesPanel-pathView')
    
    const $selectSrcFolderButton = $panel.querySelector('.inputFilesPanel-chooseFolderButton')
    const $resetButton = $panel.querySelector('.inputFilesPanel-resetButton')

    const $inputFilesProgress = $panel.querySelector('.inputFilesPanel-progress')
    const $$progressIcon = $$InputFilesProgressIcon($panel.querySelector('.inputFilesPanel-progressIcon'))

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

                renderReloadButton({enabled: false})

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

            renderReloadButton({enabled: false})
    
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

            renderReloadButton({enabled: true})
            
            $$progressIcon.renderFinishedLoading()
    
            $selectSrcFolderButton.textContent = 'Abrir outra pasta'
            $selectSrcFolderButton.classList.remove('inputFilesButton--disabled')
            
            $srcFolderPathView.innerHTML = renderPath(srcFolder)
            $srcFolderPathView.focus()
        })
    }

    const $reloadBtnDescription = (() => {
        const tpl = document.createElement('tpl')

        tpl.innerHTML = `
            <span class="inputFilesPanel-reloadCurrentButtonText">Recarregar</span>
        `
        return tpl.children[0]
    })()

    const renderReloadButton = ({enabled}) => {
        const highlightSrc = () => {
            $srcFolderPathView.classList.add('inputFilesPanel-pathView--highlightReload')
        }

        const removeHiglighSrc = () => {
            $srcFolderPathView.classList.remove('inputFilesPanel-pathView--highlightReload')
        }

        if(enabled) {
            $inputFilesProgress.classList.add('inputFilesPanel-reloadCurrentButton')
            $inputFilesProgress.setAttribute('tabindex', 0)
            $inputFilesProgress.appendChild($reloadBtnDescription)
            $inputFilesProgress.addEventListener('focus', highlightSrc)
            $inputFilesProgress.addEventListener('blur', removeHiglighSrc)
            $inputFilesProgress.addEventListener('mouseover', highlightSrc)
            $inputFilesProgress.addEventListener('mouseleave', removeHiglighSrc)


        } else {
            $inputFilesProgress.classList.remove('inputFilesPanel--reloadCurrentButton')
            $inputFilesProgress.setAttribute('tabindex', -1)
            $reloadBtnDescription.remove()
        }
    }

    return {
        renderFinishedLoading
        ,renderIsLoading
        ,renderInitial
        ,onSelectSrcFolderBtnClicked: (callback) => $selectSrcFolderButton.addEventListener('click', callback)
        ,onReloadCurrentSrcBtnFocused: (callback) => $selectSrcFolderButton.addEventListener('focus', callback)
        ,onResetButtonClicked: (callback) => $resetButton.addEventListener('click', callback)
        ,onReloadCurrentSrcBtnClicked: (callback) => $inputFilesProgress.addEventListener('click', callback)
        ,focusSrcFolderPath: () => $srcFolderPathView.focus()
    }

}