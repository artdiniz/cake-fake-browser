import contextMenu from 'electron-context-menu'

const textHandlingMenuLabels = {
    cut: 'Recortar',
    copy: 'Copiar',
    paste: 'Colar',
    save: 'Salvar imagem',
    copyLink: 'Copiar endereço do link'
}

const fullBlownMenuLabels = {
    ...textHandlingMenuLabels,
    saveImageAs: 'Salvar imagem como…',
    copyImageAddress: 'Copiar endereço da imagem',
    inspect: 'Inspecionar elemento'
}

export const textHandlingContextMenuFor = (window) => {
    contextMenu({
        window: window
        ,labels: textHandlingMenuLabels
    })
}

export const fullBlownContextMenuFor = (window) => {
    contextMenu({
        window: window
        ,showInspectElement: true
        ,showCopyImageAddress: true
        ,showSaveImageAs: true
        ,labels: fullBlownMenuLabels
    })
}