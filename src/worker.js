/* eslint-disable camelcase */
/**
* @typedef {object} Env
* @prop {string} LOKI_URL - full url to post logs to
* @prop {string} LOKI_TOKEN - basic auth token for loki url
* @prop {string} DEBUG - log every request
*/

/**
 * POST tail events to Loki
 *
 * @see https://developers.cloudflare.com/workers/runtime-apis/tail-event/
 * @see https://developers.cloudflare.com/workers/observability/tail-workers/
 *
 * @type {ExportedHandler<Env>}
 */
export default {
  async tail (events, env) {
    const lokiBody = {
      streams: events.map(toLoki)
    }
    if (env.DEBUG === 'true') {
      // NOTE: it was not possible to see logs from the tail worker at time of writing... seems like a bug.
      console.log('POST', env.LOKI_URL, JSON.stringify(lokiBody))
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
    if (!res.ok || env.DEBUG === 'true') {
      console.log(`${res.status} ${res.statusText} ${res.url}`)
      const text = await res.text()
      console.log(text)
      if (!res.ok) {
        throw new Error(`Failed to POST to loki ${res.status} ${res.url} ${text}`)
      }
    }
  }
}

/**
 * @param {TraceItem} tailItem
 */
export function toLoki (tailItem) {
  const req = formatRequest(tailItem)
  const logs = tailItem.logs.map(formatLog.bind(null, (req === undefined) ? null : JSON.parse(req[1]).request_id))
  const errs = tailItem.exceptions.map(formatException.bind(null, (req === undefined) ? null : JSON.parse(req[1]).request_id))
  /** @type [string, string][] */
  const values = [...logs, ...errs]
  if (req !== undefined) {
    values.unshift(req)
  }
  return {
    stream: {
      worker: tailItem.scriptName,
      worker_version_id: tailItem.scriptVersion?.id,
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
    return [toNano(eventTimestamp), JSON.stringify({ url, method, headers, cf, level: 'request', request_id: headers['cf-ray'] })]
  }
}

/**
 * @param {string | null} request_id
 * @param {TraceLog} log
 * @returns {[string, string]}
 **/
export function formatLog (request_id, { timestamp, message, level }) {
  const [first, ...args] = message
  if (typeof first === 'object') {
    return [toNano(timestamp), JSON.stringify({ ...first, args, level, request_id })]
  }
  return [toNano(timestamp), JSON.stringify({ msg: first, args, level, request_id })]
}

/**
 * @param {string | null} request_id
 * @param {TraceException} e
 * @returns {[string, string]}
 **/
export function formatException (request_id, { timestamp, name, message }) {
  return [toNano(timestamp), JSON.stringify({ msg: message, name, level: 'fatal', request_id })]
}
