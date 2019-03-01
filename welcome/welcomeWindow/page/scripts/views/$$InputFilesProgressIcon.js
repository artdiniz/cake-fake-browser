export const $$InputFilesProgressIcon = ($progress = document.querySelector('')) => {
    const $progressIconSVG = $progress
    const $progressIconSVGUse = $progressIconSVG.querySelector('use')
    
    const icons = {
        pumpingHeart: '#pumpingHeart',
        staticHeart: '#staticHeart'
    }
    
    const defaultRenderProps = {
        iconId: icons.pumpingHeart
    }
    
    const render = (props = defaultRenderProps) => {
        requestAnimationFrame(() => {
            $progressIconSVGUse.setAttribute('xlink:href', props.iconId)
        })
    }
    
    return {
        renderLoading: () => render({ iconId: icons.pumpingHeart }),
        renderFinishedLoading: () => render({ iconId: icons.staticHeart })
    }
}
