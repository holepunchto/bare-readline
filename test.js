const test = require('brittle')
const { PassThrough } = require('bare-stream')
const Readline = require('.')

test('basic', (t) => {
  t.plan(2)

  const input = new PassThrough()
  const rl = new Readline({ input })

  rl.on('data', (line) => {
    t.is(line, 'hello world')
    rl.close()
  }).on('close', () => {
    t.pass('closed')
  })

  input.write('hello world')
  input.write('\r')
})

test('createInterface', (t) => {
  t.plan(2)

  const input = new PassThrough()
  const rl = Readline.createInterface({ input })

  rl.on('data', (line) => {
    t.is(line, 'hello world')
    rl.close()
  }).on('close', () => {
    t.pass('closed')
  })

  input.write('hello world')
  input.write('\r')
})

test('supports \\n', (t) => {
  t.plan(2)

  const input = new PassThrough()
  const rl = new Readline({ input })

  rl.on('data', (line) => {
    t.is(line, 'hello world')
    rl.close()
  }).on('close', () => {
    t.pass('closed')
  })

  input.write('hello world')
  input.write('\n')
})

test('supports \\r\\n', (t) => {
  t.plan(2)

  const input = new PassThrough()
  const rl = new Readline({ input })

  rl.on('data', (line) => {
    t.is(line, 'hello world')
    rl.close()
  }).on('close', () => {
    t.pass('closed')
  })

  input.write('hello world')
  input.write('\r\n')
})

test('emit empty line on return', (t) => {
  t.plan(2)

  const input = new PassThrough()
  const rl = new Readline({ input })

  rl.on('data', (line) => {
    t.is(line, '')
    rl.close()
  }).on('close', () => {
    t.pass('closed')
  })

  input.write('\r')
})
