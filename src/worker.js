import { postToLoki, toLokiStream, toNano } from './loki.js'
import { version } from '../package.json'

/**
* @typedef {object} Env
* @prop {string} ENV - the environment name
* @prop {string} LOKI_URL - full url to post logs to
* @prop {string} LOKI_TOKEN - basic auth token for loki url
* @prop {string} [DEBUG] - log every request
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
      streams: events.map(toLokiStream)
    }
    await postToLoki(lokiBody, env)
  },

  /**
   * For testing. It' not currently possible to see the tail worker's logs, so
   * use this fetch handler to see if things are working
   * */
  async fetch (request, env) {
    const { pathname } = new URL(request.url)
    if (pathname === '' || pathname === '/') {
      const body = `⁂ loki-${env.ENV} v${version}\n`
      return new Response(body, {
        headers: { 'content-type': 'text/plain; charset=utf-8' }
      })
    }

    // send test logs to loki
    if (env.DEBUG && pathname === '/test') {
      /** @type {import('./loki.js').LokiBody} */
      const lokiBody = {
        streams: [{
          stream: {
            worker: 'test'
          },
          values: [
            [toNano(Date.now()), JSON.stringify(request.cf)]
          ]
        }]
      }
      return postToLoki(lokiBody, env)
    }

    return new Response('Not found', { status: 404 })
  }
}
