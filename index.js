const { Readable } = require('bare-stream')
const ansiEscapes = require('bare-ansi-escapes')
const KeyDecoder = require('bare-ansi-escapes/key-decoder')
const process = require('process');

const constants = {
  EOL: '\r\n'
}

module.exports = exports = class Readline extends Readable {
  constructor (opts = {}) {
    super()

    this._prompt = opts.prompt || '> '
    this._decoder = new KeyDecoder()
    this._history = new History()

    this.input = opts.input
    this.output = opts.output
    this.line = ''
    this.cursor = 0
    this.inChoiceMode = false; // Add this to track if we are in choice mode
    this.choiceIndex = 0; // Index of the currently selected option
    this.options = []; // Available options for choice

    this.input
      .pipe(this._decoder)
      .on('data', this._onkey.bind(this))

    this
      .on('data', this._ondata)
      .resume()
  }

  static createInterface (opts) {
    return new Readline(opts)
  }

  prompt () {
    this.write(
      ansiEscapes.cursorPosition(0) +
      ansiEscapes.eraseLine +

      this._prompt +
      this.line +

      ansiEscapes.cursorPosition(this._prompt.length + this.cursor)
    )
  }

  close () {
    this.push(null)
  }

  write (data) {
    if (this.output) this.output.write(data)
  }

  clearLine () {
    this.write(constants.EOL)
    this.line = ''
    this.cursor = 0
  }
  
  _ondata (line) {
    this.emit('line', line) // For Node.js compatibility
  }

  _onkey (key) {
    if (this.inChoiceMode) {
      switch (key.name) {
        case 'up':
          this.choiceIndex = (this.choiceIndex - 1 + this.options.length) % this.options.length;
           // Move cursor up to the start of options and erase everything below
          this.write(ansiEscapes.cursorUp(this.options.length) + ansiEscapes.eraseDisplayEnd);
          this.showOptions();
          return;
        case 'down':
          this.choiceIndex = (this.choiceIndex + 1 + this.options.length) % this.options.length;
           // Move cursor up to the start of options and erase everything below
          this.write(ansiEscapes.cursorUp(this.options.length) + ansiEscapes.eraseDisplayEnd);
          this.showOptions();
          return;
        case 'return':
          const selectedOption = this.options[this.choiceIndex];
          this.inChoiceMode = false;
          this.write(ansiEscapes.colorBrightGreen + 'Selected option: ' + selectedOption + '\r\n' + ansiEscapes.modifierReset);
          this.clearLine();
          this.emit('optionSelected', selectedOption); // For Node.js compatibility
          this.prompt();
          // show the cursor
          this.write(ansiEscapes.showCursor());
          return;
        // Handle exit from choice mode without making a selection
        case 'escape':
          this.inChoiceMode = false;
          this.write(ansiEscapes.colorBrightRed + 'No option selected' + '\r\n' + ansiEscapes.modifierReset);
          this.clearLine();
          this.prompt();
          // show the cursor
          this.write(ansiEscapes.showCursor());
          return;
      }
    }
    if (key.name === 'up') return this._onup()
    if (key.name === 'down') return this._ondown()

    this._history.cursor = -1

    let characters

    switch (key.name) {
      case 'd':
        if (key.ctrl) {
          // tty.constants.MODE_RAW does not recognize ctrl+c
          this.close()
          return process.exit()
        }
        characters = key.shift ? 'D' : 'd'
        break

      case 'c':
        if (key.ctrl) {
          // tty.constants.MODE_RAW does not recognize ctrl+c
          this.close()
          return process.exit()
        }
        characters = key.shift ? 'C' : 'c'
        break

      case 'backspace': return this._onbackspace()

      case 'return': {
        const line = this.line
        if (line.trim() === '') return ''
        if (line !== this._history.get(0)) this._history.unshift(line)
        this.push(line)
        this.emit('history', this._history.entries)
        this.clearLine()
        return
      }

      case 'right': return this._onright()
      case 'left': return this._onleft()

      case 'linefeed':
      case 'escape':
      case 'f1': case 'f2': case 'f3': case 'f4': case 'f5': case 'f6':
      case 'f7': case 'f8': case 'f9': case 'f10': case 'f11': case 'f12':
      case 'clear': case 'end': case 'home':
      case 'pageup': case 'pagedown':
      case 'insert': case 'delete':
      case 'tab':
      case 'undefined': return

      case 'space': characters = ' '; break

      default:
        characters = key.shift ? key.name.toUpperCase() : key.name
    }

    this.line = (
      this.line.substring(0, this.cursor) +
      characters +
      this.line.substring(this.cursor)
    )

    this.cursor += characters.length
    this.prompt()
  }

  _onbackspace () {
    if (this.cursor) {
      this.write(ansiEscapes.cursorBack(2))

      this.line = (
        this.line.substring(0, this.cursor - 1) +
        this.line.substring(this.cursor)
      )

      this.cursor--
      this.prompt()
    }
  }

  _onup () {
    if (this._history.cursor === -1 && this.line.length > 0) return
    if (this._history.length === 0) return
    if (this._history.length <= this._history.cursor + 1) return

    this._history.cursor++

    this.line = this._history.get(this._history.cursor)
    this.cursor = this.line.length
    this.prompt()
  }

  _ondown () {
    if (this._history.cursor === -1) return

    this._history.cursor--

    this.line = this._history.cursor === -1
      ? ''
      : this._history.get(this._history.cursor)
    this.cursor = this.line.length
    this.prompt()
  }

  _onright () {
    if (this.cursor < this.line.length) {
      this.cursor++
      this.write(ansiEscapes.cursorForward())
    }
  }

  _onleft () {
    if (this.cursor) {
      this.cursor--
      this.write(ansiEscapes.cursorBack())
    }
  }

  showOptions(options) {
    // inital showing of options
    if(options){
      this.options = options; // Set the options
      this.choiceIndex = 0; // Start at the first option
      this.inChoiceMode = true; // Enter choice mode
      this.clearLine();
      const optionsText = this.options.map((option, index) => {
        return (index === this.choiceIndex ? '[*] ' : '[ ] ') + option;
      }).join('\r\n');
      this.write(optionsText + constants.EOL);
      // hide the cursor
      this.write(ansiEscapes.hideCursor());
    }
    else{
      // Build the options text with the current selection marked
      const optionsText = this.options.map((option, index) => {
        return (index === this.choiceIndex ? '[*] ' : '[ ] ') + option;
      }).join('\r\n');

      // Display the options with the prompt
      this.write(optionsText + constants.EOL);
    }
  }
}

exports.constants = constants

class History {
  constructor () {
    this.entries = []
    this.cursor = -1
  }

  get length () {
    return this.entries.length
  }

  unshift (entry) {
    this.entries.unshift(entry)
  }

  get (index) {
    if (index < 0) index += this.length
    if (index < 0 || index >= this.length) return null

    return this.entries[index]
  }
}
