import { config as env } from "https://deno.land/std@0.158.0/dotenv/mod.ts"
import { BitfinexClient } from "../clients/bitfinex.ts"
import { getStrategyInfo, getOpenPosition, createTimeString } from "./helpers.ts"

export const VARIABLES = await env()

const exchangeClient = new BitfinexClient(VARIABLES.BITFINEX_API_KEY, VARIABLES.BITFINEX_API_SECRET)

export const runStrategy = async () => {
    const { fractals, signalDetails, signal } = await getStrategyInfo()

    const hasOpenPosition = await getOpenPosition(exchangeClient)

    if (hasOpenPosition) {
        console.log(`${createTimeString()}: has open position...`)
        // await exchange.checkAndMoveStopLoss(fractals)
        return
    }

    if (!signal) {
        console.log(`${createTimeString()}: no signal...`)
        return
    }

    console.log(`${createTimeString()}: ${signal} signal!`)

    const risk = Number(VARIABLES.STRATEGY_RISK_PERCENTAGE) / 100
    const accountBalance = 0
    const sizeInDollars = Number((risk * accountBalance).toFixed(2))
}

//     const risk = Number(VARIABLES.STRATEGY_RISK_PERCENTAGE) / 100
//     const accountBalance = await exchange.getAccountBalance()
//     const sizeInDollars = Number((risk * accountBalance).toFixed(2))
//
//     switch (signal) {
//         case 'LONG':
//             const longRes = await exchange.openPosition('buy', sizeInDollars)
//             if (!longRes.success) return
//             await exchange.placeStopLoss(fractals)
//             break
//         case 'SHORT':
//             const shortRes = await exchange.openPosition('sell', sizeInDollars)
//             if (!shortRes.success) return
//             await exchange.placeStopLoss(fractals)
//     }
//
//     console.log(`
//     Entered ${signal} position`)
//
// }
