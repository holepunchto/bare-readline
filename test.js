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

test('emit line event', (t) => {
  t.plan(2)

  const input = new PassThrough()
  const rl = Readline.createInterface({ input })

  rl.on('line', (line) => {
    t.is(line, 'hello world')
    rl.close()
  }).on('close', () => {
    t.pass('closed')
  })

  input.write('hello world\n')
})

test('for-await readline instance', async (t) => {
  const input = new PassThrough()
  const rl = Readline.createInterface({ input })

  const lines = []

  rl.on('close', () => {
    t.is('hello world', lines.join(' '))
    t.pass('closed')
  })

  input.write('hello\n')
  input.write('world\n')

  for await (const chunk of rl) {
    lines.push(chunk.toString())

    if (lines.length == 2) {
      rl.close()
    }
  }
})
