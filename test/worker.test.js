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

  t.is(values[0][0], '15870586420050000')
  t.like(values[0][1], {
    url: 'https://example.com/some/requested/url',
    method: 'GET',
    cf: {
      colo: 'SJC'
    },
    level: 'request'
  })

  t.is(values[1][0], '15870586420060000')
  t.like(values[1][1], {
    msg: 'string passed to console.log()',
    args: [99, { woo: 'haa' }],
    level: 'log'
  })

  t.is(values[2][0], '15870586420070000')
  t.like(values[2][1], {
    msg: 'Threw a sample exception',
    name: 'Error',
    level: 'fatal'
  })
})
