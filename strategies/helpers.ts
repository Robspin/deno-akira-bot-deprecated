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

export const getOpenPosition = async (exchangeClient: BitfinexInstance) => {
    let hasOpenPosition = false
    const positions: any[] = await exchangeClient.bitfinexApiPost('v2/auth/r/positions')
    if (positions.length > 0) hasOpenPosition = true
    return hasOpenPosition
}

export const createTimeString = () => new Date().toISOString().slice(0, -5)

export const getMarginBalance = async (exchangeClient: BitfinexInstance) => {
    const marginBalance = await exchangeClient.bitfinexApiPost('v2/auth/r/info/margin/base')
}
