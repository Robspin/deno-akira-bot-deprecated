import { config as env } from "https://deno.land/std@0.158.0/dotenv/mod.ts"
import { cron } from 'https://deno.land/x/deno_cron/cron.ts'
import { runStrategy } from "./strategies/ogStrategy.ts"

export const VARIABLES = await env()

console.log('running...')
console.log(VARIABLES)

cron(VARIABLES.STRATEGY_CRON_SETTINGS, async () => {
  await runStrategy()
})
