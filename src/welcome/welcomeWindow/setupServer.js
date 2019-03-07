import express from 'express'
import getPort from 'get-port'

export const setupServer = async () => {
    const server = express()

    server.use(express.static('./page'))
    
    const serverAddress = await new Promise(async (resolve, reject) => {
        const port = await getPort({port: 3000})

        server.listen(port, () => {
            resolve(`http://localhost:${server.port}`)
        })
    })

    
    return {
        getAdress: () => serverAddress
    }
}
