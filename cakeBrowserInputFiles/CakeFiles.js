import { CakeIndexFileBuilder } from './CakeIndexFileBuilder'

export const CakeFiles = function({path: srcPath}) {
    const cakeIndexFileBuilder = CakeIndexFileBuilder({indexFileDirPath: srcPath})

    async function getIndexPath({withOpenURL: openURL} = {}) {
        let indexFile

        if(openURL !== undefined && openURL !== null) {
            indexFile = await cakeIndexFileBuilder.withOpenURL(openURL)
        } else {
            indexFile = await cakeIndexFileBuilder.withOpenURL()
        }

        return indexFile.name
    }

    return {
        getIndexPath: getIndexPath
    }
}