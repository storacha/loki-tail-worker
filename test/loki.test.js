import { toLokiStream } from '../src/loki.js'
import events from './fixture/events.js'
import test from 'ava'

test('toLokiStream', t => {
  const actual = toLokiStream(events[0])
  const { stream, values } = actual

  t.like(stream, {
    worker: 'Example script',
    outcome: 'exception'
  })
  t.is(values.length, 3)

  t.is(values[0][0].length, 19, 'should be nanoseconds since epoch')
  t.is(values[0][0], '1587058642005000000')
  // @ts-expect-error
  t.is(values[0][1], JSON.stringify({ ...events[0]?.event?.request, level: 'request' }))

  t.is(values[1][0], '1587058642006000000')
  t.is(values[1][1], JSON.stringify({
    msg: 'string passed to console.log()',
    args: [99, { woo: 'haa' }],
    level: 'log'
  }))

  t.is(values[2][0], '1587058642007000000')
  t.is(values[2][1], JSON.stringify({
    msg: 'Threw a sample exception',
    name: 'Error',
    level: 'fatal'
  }))
})
