/*
    Issue: https://github.com/electron/electron/issues/18214
    Fix propsed in: https://github.com/electron/electron/issues/18214#issuecomment-495043193
    More about site isolation from chromium: http://www.chromium.org/Home/chromium-security/site-isolation

    TL;DR;

    Chromium has a 'site isolation mode' that breaks `--disable-web-security` flag which in turn 
        enables iframe content access.
    Chromium is currently running an A/B test which toggles 'site isolation mode'.
    To opt out from these A/B test Chromium should run with `--disable-site-isolation-trials` flag
    This bug is Electron + Chromium because Electron's `webSecurity: false` option should turn on 
        the `--disable-site-isolation-trials` flag
    In the future where 'site isolation mode' is the default, we may use the 
        `--disable-features=IsolateOrigins,site-per-process` flag if
        `webSecurity:false` remains broken – it doesn't work as of this comment date.
*/

export const WithTemporaryFixForChromiumBug = app => {
    app.commandLine.appendSwitch('disable-site-isolation-trials')
    app.commandLine.appendSwitch('disable-features', 'IsolateOrigins,site-per-process')

    return app
}
