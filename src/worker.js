/**
 * POST tail events to Loki
 *
 * @see https://developers.cloudflare.com/workers/runtime-apis/tail-event/
 * @see https://developers.cloudflare.com/workers/observability/tail-workers/
 * @type {ExportedHandler}
 */
export default {
  async tail (events, env) {
    const lokiBody = {
      streams: events.map(toLoki)
    }
    const res = await fetch(env.LOKI_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${env.LOKI_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'loki-tail-worker'
      },
      body: JSON.stringify(lokiBody)
    })
    if (!res.ok) {
      console.error(`${res.status} ${res.statusText} ${res.url}`)
      console.log(await res.text())
    }
  }
}

/**
 * @param {TraceItem} tailItem
 */
export function toLoki (tailItem) {
  const req = formatRequest(tailItem)
  const logs = tailItem.logs.map(formatLog)
  const errs = tailItem.exceptions.map(formatException)
  const values = [...logs, ...errs]
  if (req !== undefined) {
    values.unshift(req)
  }
  return {
    stream: {
      worker: tailItem.scriptName,
      outcome: tailItem.outcome
    },
    values
  }
}

/** @param {number} ms epoch time in milliseconds */
export function toNano (ms) {
  const nano = BigInt(ms) * BigInt(10_000)
  return nano.toString()
}

/** @param {TraceItem} item */
export function formatRequest ({ eventTimestamp, event }) {
  // @ts-expect-error checking for request here
  const request = event?.request
  if (eventTimestamp && request) {
    const { url, method, cf } = request
    return [toNano(eventTimestamp), { url, method, cf, level: 'request' }]
  }
}

/** @param {TraceLog} log */
export function formatLog ({ timestamp, message, level }) {
  const [first, ...args] = message
  if (typeof first === 'object') {
    return [toNano(timestamp), { ...first, args, level }]
  }
  return [toNano(timestamp), { msg: first, args, level }]
}

/** @param {TraceException} e */
export function formatException ({ timestamp, name, message }) {
  return [toNano(timestamp), { msg: message, name, level: 'fatal' }]
}
