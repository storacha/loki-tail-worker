import { toLoki } from '../src/worker.js'
import events from './fixture/events.js'
import test from 'ava'

test('toLoki', t => {
  const actual = toLoki(events[0])
  const { stream, values } = actual

  t.like(stream, {
    worker: 'Example script',
    outcome: 'exception'
  })
  t.is(values.length, 3)

  t.is(values[0][0].length, 19, 'should be nanoseconds since epoch')
  t.is(values[0][0], '1587058642005000000')
  t.like(values[0][1], {
    url: 'https://example.com/some/requested/url',
    method: 'GET',
    cf: {
      colo: 'SJC'
    },
    level: 'request'
  })

  t.is(values[1][0], '1587058642006000000')
  t.like(values[1][1], {
    msg: 'string passed to console.log()',
    args: [99, { woo: 'haa' }],
    level: 'log'
  })

  t.is(values[2][0], '1587058642007000000')
  t.like(values[2][1], {
    msg: 'Threw a sample exception',
    name: 'Error',
    level: 'fatal'
  })
})
