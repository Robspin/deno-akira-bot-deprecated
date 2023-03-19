import { config as env } from "https://deno.land/std@0.158.0/dotenv/mod.ts"
import { BitfinexClient } from "../clients/bitfinex.ts"
import {
    getStrategyInfo,
    getOpenPosition,
    getMarginBalance,
    createTimeString,
    calculateSizeInBTC,
    openPosition,
    openStopLoss,
    akiraUpdateStatus,
    akiraCheckAndUpdateStatus, checkAndUpdateStopLoss
} from "./helpers.ts"

export const VARIABLES = await env()

const exchangeClient = new BitfinexClient(VARIABLES.BITFINEX_API_KEY, VARIABLES.BITFINEX_API_SECRET)

export const runStrategy = async () => {
    const { fractals, signal, signalDetails } = await getStrategyInfo()

    const hasOpenPosition = await getOpenPosition(exchangeClient)

    if (hasOpenPosition) {
        console.log(`${createTimeString()}: has open position...`)
        await checkAndUpdateStopLoss(exchangeClient, fractals)
        return
    } else {
        await akiraCheckAndUpdateStatus()
    }

    if (typeof signal === 'boolean') {
        console.log(`${createTimeString()}: no signal...`)
        console.log(signalDetails)
        return
    }

    console.log(`${createTimeString()}: ${signal.toLowerCase()} signal!`)

    const risk = Number(VARIABLES.STRATEGY_RISK_PERCENTAGE) / 100
    const accountBalance = await getMarginBalance(exchangeClient)
    const sizeInDollars = Number((risk * accountBalance).toFixed(2))
    const sizeInBTC = await calculateSizeInBTC(sizeInDollars)
    const negativeSizeInBTC = String(Number(sizeInBTC) * -1)

    switch (signal) {
        case 'LONG':
            await openPosition(exchangeClient, sizeInBTC)
            await openStopLoss(exchangeClient, negativeSizeInBTC, String(fractals.downFractals[0]))
            await akiraUpdateStatus(true, 'LONG')
            break
        case 'SHORT':
            await openPosition(exchangeClient, negativeSizeInBTC)
            await openStopLoss(exchangeClient, sizeInBTC, String(fractals.upFractals[0]))
            await akiraUpdateStatus(true, 'SHORT')
            break
    }
    console.log(`${createTimeString()}: entered ${signal.toLowerCase()} position...`)
}

