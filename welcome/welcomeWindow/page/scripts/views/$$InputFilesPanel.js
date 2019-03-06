import { $$InputFilesProgressIcon } from "./$$InputFilesProgressIcon"

export const $$InputFilesPanel = ($panel = document.querySelector()) => {

    const $srcFolderPathView = $panel.querySelector('.inputFilesPanel-pathView')
    const $reloadCurrentSrcButton = $panel.querySelector('.inputFilesPanel-reloadCurrentButton')
    
    const $selectSrcFolderButton = $panel.querySelector('.inputFilesPanel-chooseFolderButton')
    const $resetButton = $panel.querySelector('.inputFilesPanel-resetButton')

    const $inputFilesProgressMessage = $panel.querySelector('.inputFilesPanel-progressMessage')
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

    const renderIsLoading = ({srcFolder, message}) => {
        requestAnimationFrame(() => {
            $panel.classList.remove('inputFilesPanel--initial')
            $panel.classList.remove('inputFilesPanel--finishedLoading')
            $panel.classList.add('inputFilesPanel--loading')

            $inputFilesProgressMessage.innerHTML = message

            renderReloadButton({enabled: true})
    
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
            $inputFilesProgressMessage.innerHTML = 'Tudo certo! O seu navegador foi carregado com sucesso =)'
            
            $$progressIcon.renderFinishedLoading()
    
            $selectSrcFolderButton.textContent = 'Abrir outra pasta'
            $selectSrcFolderButton.classList.remove('inputFilesButton--disabled')
            
            $srcFolderPathView.innerHTML = renderPath(srcFolder)
            $srcFolderPathView.focus()
        })
    }

    
    const renderReloadButton = (() => {
        const $reloadBtnDescription = (() => {
            const tpl = document.createElement('tpl')
    
            tpl.innerHTML = `
                <span class="inputFilesPanel-reloadCurrentButtonText">Recarregar</span>
            `
            return tpl.children[0]
        })()

        const highlightSrc = () => {
            $srcFolderPathView.classList.add('inputFilesPanel-pathView--highlightReload')
        }
    
        const removeHiglighSrc = () => {
            $srcFolderPathView.classList.remove('inputFilesPanel-pathView--highlightReload')
        }

        const enableKeyboardClick = (event) => {
            if(event.key == 'Enter') {
                event.target.click()
            }
        }
        
        return ({enabled}) => {

            if(enabled) {
                $reloadCurrentSrcButton.setAttribute('tabindex', 0)
                $reloadCurrentSrcButton.appendChild($reloadBtnDescription)

                
                $reloadCurrentSrcButton.addEventListener('keyup', enableKeyboardClick)
                $reloadCurrentSrcButton.addEventListener('focus', highlightSrc)
                $reloadCurrentSrcButton.addEventListener('blur', removeHiglighSrc)
                $reloadCurrentSrcButton.addEventListener('mouseover', highlightSrc)
                $reloadCurrentSrcButton.addEventListener('mouseleave', removeHiglighSrc)

            } else {
                $reloadCurrentSrcButton.setAttribute('tabindex', -1)
                $reloadBtnDescription.remove()
    
                $reloadCurrentSrcButton.removeEventListener('keyup  ', enableKeyboardClick)
                $reloadCurrentSrcButton.removeEventListener('focus', highlightSrc)
                $reloadCurrentSrcButton.removeEventListener('blur', removeHiglighSrc)
                $reloadCurrentSrcButton.removeEventListener('mouseover', highlightSrc)
                $reloadCurrentSrcButton.removeEventListener('mouseleave', removeHiglighSrc)
            }
        }
    })()

    return {
        renderFinishedLoading
        ,renderIsLoading
        ,renderInitial
        ,onSelectSrcFolderBtnClicked: (callback) => $selectSrcFolderButton.addEventListener('click', callback)
        ,onReloadCurrentSrcBtnFocused: (callback) => $selectSrcFolderButton.addEventListener('focus', callback)
        ,onResetButtonClicked: (callback) => $resetButton.addEventListener('click', callback)
        ,onReloadCurrentSrcBtnClicked: (callback) => $reloadCurrentSrcButton.addEventListener('click', callback)
        ,focusSrcFolderPath: () => $srcFolderPathView.focus()
    }

}