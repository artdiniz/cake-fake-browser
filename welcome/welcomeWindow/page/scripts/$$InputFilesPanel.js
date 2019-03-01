const $$InputFilesProgressIcon = ($progress = document.querySelector('')) => {
    
    const $progressIconSVG = $progress

    const $progressIconSVGUse = $progressIconSVG.querySelector('use')

    const icons = {
        pumpingHeart: '#pumpingHeart'
        ,staticHeart: '#staticHeart'
    }

    const defaultRenderProps = {
        iconId: icons.pumpingHeart
    }

    const render = (props = defaultRenderProps) => {
        $progressIconSVGUse.setAttribute('xlink:href', props.iconId)
    }

    return {
        renderLoading: () => render({iconId: icons.pumpingHeart})
        ,renderFinishedLoading: () => render({iconId: icons.staticHeart})
    }
}


const withRenderNextFrame = fn => (...args) => requestAnimationFrame(() => fn(...args))

const $$InputFilesPanel = ($panel = document.querySelector()) => {
    const $inputFilesButton = $panel.querySelector('.inputFilesPanel-button')
    const $inputFilesPathView = $panel.querySelector('.inputFilesPanel-pathView')

    const $inputFilesProgress = $panel.querySelector('.inputFilesPanel-progress')
    
    const $$progressIcon = $$InputFilesProgressIcon($inputFilesProgress)

    const renderIsLoading = withRenderNextFrame(({srcFolder}) => {
        $panel.classList.add('inputFilesPanel--loading')

        $$progressIcon.renderLoading()

        $inputFilesButton.textContent = 'Carregando...'
        $inputFilesButton.classList.add('inputFilesButton--disabled')
        
        $inputFilesPathView.textContent = srcFolder
        $inputFilesPathView.focus()
    })

    const renderFinishedLoading = withRenderNextFrame(({srcFolder}) => {
        $panel.classList.remove('inputFilesPanel--loading')
        $panel.classList.add('inputFilesPanel--finishedLoading')
        
        $$progressIcon.renderFinishedLoading()

        $inputFilesButton.textContent = 'Selecionar outra pasta'
        $inputFilesButton.classList.remove('inputFilesButton--disabled')
        
        $inputFilesPathView.textContent = srcFolder
        $panel.focus()
    })

    const defaultRenderProps = {
        isLoading: false
        ,srcFolder: ''
        ,finishedLoading: false
    }

    const render = (props = defaultRenderProps) => {
        if(props.isLoading && !props.finishedLoading) {
            renderIsLoading({srcFolder: props.srcFolder})
        } else if(props.finishedLoading) {
            renderFinishedLoading({srcFolder: props.srcFolder})
        }
    }

    return {
        render
        ,getDefaultRenderProps: () => Object.assign({}, defaultRenderProps)
        ,onInputFilesBtnClicked: (callback) => $inputFilesButton.addEventListener('click', callback)
        ,onInputFilesBtnFocused: (callback) => $inputFilesButton.addEventListener('focus', callback)
    }

}