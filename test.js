const test = require('brittle')
const { PassThrough } = require('bare-stream')
const Readline = require('.')

test('basic', (t) => {
  t.plan(2)

  const input = new PassThrough()
  const rl = new Readline({ input })

  rl
    .on('data', (line) => {
      t.is(line, 'hello world')
      rl.close()
    })
    .on('close', () => {
      t.pass('closed')
    })

  input.write('hello world')
  input.write('\r')
})
