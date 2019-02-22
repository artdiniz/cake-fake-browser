import cheerio from 'cheerio'

const withSandboxedIframe = function(baseContent) {
    const $defaultPage = cheerio.load(baseContent)
    
    const iframeSandboxProps = [
        'allow-forms',
        'allow-modals',
        'allow-orientation-lock',
        'allow-pointer-lock',
        'allow-popups',
        'allow-popups-to-escape-sandbox',
        'allow-presentation',
        'allow-same-origin',
        'allow-scripts'
    ]

    $defaultPage('iframe').attr('sandbox', iframeSandboxProps.join(' '))

    return $defaultPage.html()
}

const withIframeSrc = function(baseContent, iframeSRC) {
    
    if (iframeSRC !== undefined && iframeSRC !== null) {
        const $page = cheerio.load(baseContent)
        $page('iframe').attr('src', iframeSRC)
        baseContent = $page.html()
    }

    return baseContent
}

export const CakeIndexFileContent = {
    withSandboxedIframe
    ,withIframeSrc
}
