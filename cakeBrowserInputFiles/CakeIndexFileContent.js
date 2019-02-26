import cheerio from 'cheerio'
import fs from 'fs'

import {html} from 'common-tags'

const withSandboxedIframe = function(baseContent) {
    const $page = cheerio.load(baseContent)
    
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

    $page('iframe').attr('sandbox', iframeSandboxProps.join(' '))

    const newContent = $page.html()

    return newContent
}

const withIframeSrc = function(baseContent, iframeSRC) {
    let newContent = baseContent

    if (iframeSRC !== undefined && iframeSRC !== null) {
        const $page = cheerio.load(baseContent)
        $page('iframe').attr('src', iframeSRC)
        newContent = $page.html()
    }

    return newContent
}

const withInjectedScripts = function(baseContent, scriptPaths) {
    const $page = cheerio.load(baseContent)

    const preloadScripts = scriptPaths
        .map(path => fs.readFileSync(path))
        .map(code => html`
            ;(()=>{
                ${code}
            })()
        `)
        .join('\n')

    $page('body').append(html`
        <script>
            ${preloadScripts}
        </script>
    `)

    const newContent = $page.html()
    
    return newContent
}

export const CakeIndexFileContent = function(baseContent = '') {    
    
    const withBaseContentArg = fn => (...args) => fn(baseContent, ...args)
    const chainable = fn => (...args) => CakeIndexFileContent(fn(...args))

    return {
        withSandboxedIframe: chainable(withBaseContentArg(withSandboxedIframe))
        ,withIframeSrc: chainable(withBaseContentArg(withIframeSrc))
        ,withInjectedScripts: chainable(withBaseContentArg(withInjectedScripts))
        ,toString: () => baseContent.toString()
    }
}
