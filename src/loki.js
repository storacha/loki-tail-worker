/**
 * POST a loki formatted message to env.LOKI_URL
 *
 * @typedef {object} LokiBody
 * @prop {LokiStream[]} streams
 *
 * @typedef {object} LokiStream
 * @prop {Record<string, string>} stream
 * @prop {LokiValue[]} values
 *
 * @typedef {[string, string]} LokiValue
 *
 * @param {LokiBody} lokiBody
 * @param {import('./worker.js').Env} env
 */
export async function postToLoki (lokiBody, env) {
  const res = await fetch(env.LOKI_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${env.LOKI_TOKEN}`,
      'Content-Type': 'application/json',
      'User-Agent': 'loki-tail-worker'
    },
    body: JSON.stringify(lokiBody)
  })
  if (!res.ok || env.DEBUG === 'true') {
    console.log(`${res.status} ${res.statusText} ${res.url}`)
    if (!res.ok) {
      throw new Error(`Failed to POST to loki ${res.status} ${res.url}`)
    }
  }
  return res
}

/**
 * @param {TraceItem} tailItem
 */
export function toLokiStream (tailItem) {
  const req = formatRequest(tailItem)
  const logs = tailItem.logs.map(formatLog)
  const errs = tailItem.exceptions.map(formatException)
  /** @type LokiValue[] */
  const values = [...logs, ...errs]
  if (req !== undefined) {
    values.unshift(req)
  }
  return {
    stream: {
      worker: tailItem.scriptName || 'unknown',
      outcome: tailItem.outcome
    },
    values
  }
}

/** @param {number} ms epoch time in milliseconds */
export function toNano (ms) {
  const nano = BigInt(ms) * BigInt(1_000_000)
  return nano.toString()
}

/**
 * @param {TraceItem} item
 * @returns {[string, string] | undefined}
 **/
export function formatRequest ({ eventTimestamp, event }) {
  // @ts-expect-error checking for request here
  const request = event?.request
  if (eventTimestamp && request) {
    const { url, method, headers, cf } = request
    return [toNano(eventTimestamp), JSON.stringify({ url, method, headers, cf, level: 'request' })]
  }
}

/**
 * @param {TraceLog} log
 * @returns {[string, string]}
 **/
export function formatLog ({ timestamp, message, level }) {
  const [first, ...args] = message
  if (typeof first === 'object') {
    return [toNano(timestamp), JSON.stringify({ ...first, args, level })]
  }
  return [toNano(timestamp), JSON.stringify({ msg: first, args, level })]
}

/**
 * @param {TraceException} e
 * @returns {[string, string]}
 **/
export function formatException ({ timestamp, name, message }) {
  return [toNano(timestamp), JSON.stringify({ msg: message, name, level: 'fatal' })]
}
