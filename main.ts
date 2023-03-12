import { config as env } from "https://deno.land/std@0.158.0/dotenv/mod.ts"
import { runStrategy } from "./strategies/ogStrategy.ts"

export const VARIABLES = await env()

await runStrategy()

// cron(VARIABLES.STRATEGY_CRON_SETTINGS, async () => {
//   // await runStrategy()
// })
