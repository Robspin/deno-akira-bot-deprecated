import CryptoJS from "npm:crypto-js"

export class BitfinexClient {
    private readonly apiKey: string
    private readonly apiSecret: string
    public baseURL = 'https://api.bitfinex.com/'

    constructor(apiKey: string, apiSecret: string) {
        this.apiKey = apiKey
        this.apiSecret = apiSecret
    }

    public generateRequestHeaders(path: string, body = {}) {
        const nonce = (Date.now() * 1000).toString()
        const signature = `/api/${path}${nonce}${JSON.stringify(body)}`
        const encryptedSignature = CryptoJS.HmacSHA384(signature, this.apiSecret).toString()

        const headers = {
            'Content-Type': 'application/json',
            'bfx-nonce': nonce,
            'bfx-apikey': this.apiKey,
            'bfx-signature': encryptedSignature
        }

        return headers
    }

    public async bitfinexApiPost(path: string, body = {}) {
        try {
            const config = {
                method: 'POST',
                body: JSON.stringify(body),
                headers: this.generateRequestHeaders(path)
            }

            const data = await (await fetch(`${this.baseURL}${path}`, config)).json()
            return data
        } catch (e) {
            console.log(e)
        }
    }
}

export type BitfinexInstance = InstanceType<typeof BitfinexClient>
