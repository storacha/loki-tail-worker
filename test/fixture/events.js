/** @type {TraceItem[]} */
const events = [
  {
    scriptName: 'Example script',
    outcome: 'exception',
    eventTimestamp: 1587058642005,
    event: {
      request: {
        url: 'https://example.com/some/requested/url',
        method: 'GET',
        headers: {
          'cf-ray': '57d55f210d7b95f3',
          'x-custom-header-name': 'my-header-value'
        },
        cf: {
          colo: 'SJC'
        }
      }
    },
    logs: [
      {
        message: ['string passed to console.log()', 99, { woo: 'haa' }],
        level: 'log',
        timestamp: 1587058642006
      }
    ],
    exceptions: [
      {
        name: 'Error',
        message: 'Threw a sample exception',
        timestamp: 1587058642007
      }
    ],
    diagnosticsChannelEvents: [
      {
        channel: 'foo',
        message: 'The diagnostic channel message',
        timestamp: 1587058642008
      }
    ]
  }
]

export default events
