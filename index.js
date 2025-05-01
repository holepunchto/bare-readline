const { Readable } = require('bare-stream')
const ansiEscapes = require('bare-ansi-escapes')
const KeyDecoder = require('bare-ansi-escapes/key-decoder')

const constants = {
  EOL: '\r\n'
}

const defaultColumns = 80
const defaultRows = 60

module.exports = exports = class Readline extends Readable {
  constructor(opts = {}) {
    super()

    this._prompt = opts.prompt || '> '
    this._crlfDelay = opts.crlfDelay ? Math.max(100, opts.crlfDelay) : 100

    this._oninput = this._oninput.bind(this)
    this._onkey = this._onkey.bind(this)
    this._onresize = this._onresize.bind(this)

    this._decoder = new KeyDecoder().on('data', this._onkey)
    this._history = new ReadlineHistory()

    this._input = opts.input.on('data', this._oninput)
    this._output = opts.output
    this._line = ''
    this._cursor = 0
    this._previousRows = 0
    this._columns = defaultColumns
    this._rows = defaultRows
    this._sawReturn = 0

    this.on('data', this._ondata).setEncoding('utf8').pause()

    if (this._output) {
      this._output.on('resize', this._onresize)
      this._onresize()
    }
  }

  get input() {
    return this._input
  }

  get output() {
    return this._output
  }

  get line() {
    return this._line
  }

  get cursor() {
    return this._cursor
  }

  prompt() {
    const line = this._prompt + this._line
    const cursor = this._prompt.length + this._cursor

    const x = cursor % this._columns
    const y = (cursor - x) / this._columns

    const offsetX = cursor === line.length ? 0 : 1

    const rows = Math.floor((line.length - offsetX) / this._columns)

    const offsetY = rows - y

    if (this._previousRows) this.write(ansiEscapes.cursorUp(this._previousRows))

    this.write(
      ansiEscapes.cursorPosition(0) + ansiEscapes.eraseDisplayEnd + line
    )

    if (x === 0 && offsetX === 0) this.write(constants.EOL)
    else if (offsetY) this.write(ansiEscapes.cursorUp(offsetY))

    this.write(ansiEscapes.cursorPosition(x))

    this._previousRows = rows - offsetY
  }

  close() {
    this._input.off('data', this._oninput)
    this.push(null)
  }

  write(data) {
    if (this._output) this._output.write(data)
  }

  clearLine() {
    const line = this._line

    const rows = Math.floor((this._prompt.length + line.length) / this._columns)

    if (rows !== this._previousRows) {
      this.write(ansiEscapes.cursorDown(rows - this._previousRows))
    }

    this.write(constants.EOL)

    this._line = ''
    this._cursor = 0
    this._previousRows = 0

    return line
  }

  _oninput(data) {
    this._decoder.write(data)
  }

  _onresize() {
    const { columns = defaultColumns, rows = defaultRows } = this._output
    this._columns = columns
    this._rows = rows
    this.prompt()
  }

  _ondata(line) {
    this.emit('line', line) // For Node.js compatibility
  }

  _online(linefeed) {
    if (linefeed) {
      if (
        this._sawReturn > 0 &&
        Date.now() - this._sawReturn <= this._crlfDelay
      ) {
        return
      }

      this._sawReturn = 0
    } else {
      this._sawReturn = Date.now()
    }

    const line = this.clearLine()

    const remember = line.trim() !== ''
    if (remember && line !== this._history.get(0)) this._history.unshift(line)

    this.push(line)

    if (remember) this.emit('history', this._history.entries)
  }

  _onkey(key) {
    if (key.name === 'up' || (key.ctrl && key.name === 'p')) {
      return this._onup()
    }

    if (key.name === 'down' || (key.ctrl && key.name === 'n')) {
      return this._ondown()
    }

    this._history.cursor = -1

    let characters

    switch (key.name) {
      case 'd':
        if (key.ctrl) return this.close()
        characters = key.shift ? 'D' : 'd'
        break

      case 'c':
        if (key.ctrl) return this.close()
        characters = key.shift ? 'C' : 'c'
        break

      case 'backspace':
        return this._onbackspace()

      case 'return':
        return this._online(false /* linefeed */)
      case 'linefeed':
        return this._online(true /* linefeed */)

      case 'right':
        return this._onright()
      case 'left':
        return this._onleft()

      case 'escape':
      case 'f1':
      case 'f2':
      case 'f3':
      case 'f4':
      case 'f5':
      case 'f6':
      case 'f7':
      case 'f8':
      case 'f9':
      case 'f10':
      case 'f11':
      case 'f12':
      case 'clear':
      case 'end':
      case 'home':
      case 'pageup':
      case 'pagedown':
      case 'insert':
      case 'delete':
      case 'tab':
      case 'undefined':
        return

      case 'space':
        characters = ' '
        break

      default:
        characters = key.shift ? key.name.toUpperCase() : key.name
    }

    this._line =
      this._line.substring(0, this._cursor) +
      characters +
      this._line.substring(this._cursor)

    this._cursor += characters.length
    this.prompt()
  }

  _onbackspace() {
    if (this._cursor) {
      this._line =
        this._line.substring(0, this._cursor - 1) +
        this._line.substring(this._cursor)

      this._cursor--
      this.prompt()
    }
  }

  _onup() {
    if (this._history.cursor === -1 && this._line.length > 0) return
    if (this._history.length === 0) return
    if (this._history.length <= this._history.cursor + 1) return

    this._history.cursor++

    this._line = this._history.get(this._history.cursor)

    this._cursor = this._line.length
    this.prompt()
  }

  _ondown() {
    if (this._history.cursor === -1) return

    this._history.cursor--

    this._line =
      this._history.cursor === -1 ? '' : this._history.get(this._history.cursor)

    this._cursor = this._line.length
    this.prompt()
  }

  _onright() {
    if (this._cursor < this._line.length) {
      this._cursor++
      this.prompt()
    }
  }

  _onleft() {
    if (this._cursor) {
      this._cursor--
      this.prompt()
    }
  }
}

const Readline = exports

exports.createInterface = function createInterface(opts) {
  return new Readline(opts)
}

exports.constants = constants

class ReadlineHistory {
  constructor() {
    this.entries = []
    this.cursor = -1
  }

  get length() {
    return this.entries.length
  }

  unshift(entry) {
    this.entries.unshift(entry)
  }

  get(index) {
    if (index < 0) index += this.length
    if (index < 0 || index >= this.length) return null

    return this.entries[index]
  }
}
