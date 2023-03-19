import { config as env } from "https://deno.land/std@0.158.0/dotenv/mod.ts"
import { williamsFractals } from "../indicators/fractals.ts"
import { ichimoku } from "../indicators/ichimoku.ts"
import { BitfinexInstance } from "../clients/bitfinex.ts"

export const VARIABLES = await env()

export const getStrategyInfo = async () => {
    const fractals = await williamsFractals(VARIABLES.STRATEGY_FRACTAL_TIMEFRAME)
    const ichimokuSignal = await ichimoku(VARIABLES.STRATEGY_ICHIMOKU_TIMEFRAME)
    const { signal, signalDetails } = ichimokuSignal

    return { fractals, signal, signalDetails }
}

export const getOpenPosition = async (exchangeClient: BitfinexInstance): Promise<boolean> => {
    let hasOpenPosition = false
    try {
        const positions: any[] = await exchangeClient.bitfinexApiPost('v2/auth/r/positions')
        if (positions.length > 0) hasOpenPosition = true
    } catch (e) {
        console.log(e)
    }
    return hasOpenPosition
}

export const createTimeString = (): string => new Date().toISOString().slice(0, -5)

export const getMarginBalance = async (exchangeClient: BitfinexInstance): Promise<number> => {
    let marginBalance = 0
    try {
        const marginBase = await exchangeClient.bitfinexApiPost('v2/auth/r/info/margin/base')
        marginBalance = marginBase[1][2].toFixed(2)
    } catch (e) {
        console.log(e)
    }
    return marginBalance
}

export const calculateSizeInBTC = async (sizeInDollars: number): Promise<string> => {
    const tickerResponse = await (await fetch('https://api-pub.bitfinex.com/v2/tickers?symbols=tBTCUSD')).json()
    const currentPrice = tickerResponse[0][1]
    return String((sizeInDollars / currentPrice).toFixed(5))
}

export const openPosition = async (exchangeClient: BitfinexInstance, amount: string) => {
    try {
        const body = {
            type: 'MARKET',
            symbol: 'tBTCUSD',
            amount
        }

        const response = await exchangeClient.bitfinexApiPost('v2/auth/w/order/submit', body)
    } catch (e) {
        console.log(e)
    }
}

export const openStopLoss = async (exchangeClient: BitfinexInstance, amount: string, price: string) => {
    try {
        const body = {
            type: 'STOP',
            symbol: 'tBTCUSD',
            price,
            amount
        }

        const response = await exchangeClient.bitfinexApiPost('v2/auth/w/order/submit', body)
    } catch (e) {
        console.log(e)
    }
}


export const akiraUpdateStatus = async (hasPosition: boolean, direction: 'LONG' | 'SHORT' | 'NO_TRADE') => {
    try {
        const config = {
            method: 'PUT',
            body: JSON.stringify({ hasPosition, direction }),
            headers: { 'Content-Type': 'application/json' }
        }
        const data = await (await fetch(`${VARIABLES.AKIRA_BACKEND_URL}/bot-status/${VARIABLES.STRATEGY_KEY}`, config)).json()
        console.log('updated akira status')
    } catch (e) {
        console.log('error?', e)
    }
}

export const akiraCheckAndUpdateStatus = async () => {
    let hasPosition
    try {
        const data = await (await fetch(`${VARIABLES.AKIRA_BACKEND_URL}/bot-status/${VARIABLES.STRATEGY_KEY}`)).json()
        hasPosition = data.data.hasPosition
    } catch (e) {
        console.log(e)
    }

    if (!hasPosition) return
    await akiraUpdateStatus(false, "NO_TRADE")
}
