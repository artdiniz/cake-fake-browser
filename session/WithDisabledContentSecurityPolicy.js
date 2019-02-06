function WithDisabledContentSecurityPolicy(bannedPolicyNames, session) {

    function isBannedPolicy(policyString = '') {
        return bannedPolicyNames
            .map(bannedPolicyName => new RegExp(`^${bannedPolicyName.toLowerCase()}`).test(policyString.trim().toLowerCase()))
            .reduce((matchedPrevious, doesMatchCurrentPolicy, x) => (matchedPrevious || doesMatchCurrentPolicy), false)
    }

    session.addResponseInterceptor(function disableContentSecurityPolicy(details) {
        const originalCSPHeader = details.responseHeaders['Content-Security-Policy']
        if (originalCSPHeader) {
            // console.log("Original:", JSON.stringify(originalCSPHeader, null, 4))

            const newCSPHeader = details.responseHeaders['Content-Security-Policy']
                .map(policy => policy.split(";"))
                .filter(Boolean)
                .map(props => props.filter(prop => !isBannedPolicy(prop)))
                .map(props => props.join(";"))

            // console.log("Filtered:", JSON.stringify(newCSPHeader, null, 4))
            details.responseHeaders['Content-Security-Policy'] = newCSPHeader
        }

        return { cancel: false, responseHeaders: details.responseHeaders }
    })

    return session
}

exports.WithDisabledContentSecurityPolicy = WithDisabledContentSecurityPolicy
