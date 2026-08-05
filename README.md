# bare-readline

Line editing for interactive CLIs with command history.

```
npm i bare-readline
```

## Usage

```js
const readline = require('bare-readline')

const rl = readline.createInterface({
  input: stream,
  output: stream
})

rl.on('data', (line) => {
  console.log(line)
  rl.prompt()
}).prompt()
```

## License

Apache-2.0

<!-- bare-refgen:api start -->

## API

### Readline

#### `new Readline(opts?: ReadlineOptions)`

Create a `Readline` interface over an input and output stream.

**Parameters**

| Parameter | Type              | Default | Description                                                                                                                               |
| --------- | ----------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `opts?`   | `ReadlineOptions` | —       | Options; `input` and `output` are the streams to read from and render to, `prompt` defaults to `'> '`, and `crlfDelay` defaults to `100`. |

#### `clearLine(): string`

Clear the current input line from the output and reset the line buffer and cursor, returning the cleared line.

**Returns** `string` — the input line that was cleared, before the buffer and cursor were reset.

#### `close(): void`

Stop listening for input and end the stream.

#### `cursor: number`

The current cursor position within the input line.

#### `getPrompt(): string`

Returns the current prompt string.

**Returns** `string` — the current prompt string.

#### `input: Readable`

The readable stream that keystrokes are read from.

#### `line: string`

The current, in-progress input line.

#### `output: Writable`

The writable stream that the prompt and line edits are rendered to.

#### `prompt(): void`

Render the prompt and current input line to the output.

#### `Readline.constants: { EOL: string }`

Constants used by `Readline`, including the end-of-line sequence.

#### `Readline.createInterface(opts?: ReadlineOptions): Readline`

Create a `Readline` interface over an input and output stream.

**Parameters**

| Parameter | Type              | Default | Description                                                                                                                               |
| --------- | ----------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `opts?`   | `ReadlineOptions` | —       | Options; `input` and `output` are the streams to read from and render to, `prompt` defaults to `'> '`, and `crlfDelay` defaults to `100`. |

#### `setPrompt(prompt: string): void`

Set the prompt string written before the input line.

**Parameters**

| Parameter | Type     | Default | Description                                      |
| --------- | -------- | ------- | ------------------------------------------------ |
| `prompt`  | `string` | —       | The prompt string written before the input line. |

#### `write(data: string): void`

Write data directly to the output stream.

**Parameters**

| Parameter | Type     | Default | Description                             |
| --------- | -------- | ------- | --------------------------------------- |
| `data`    | `string` | —       | The data to write to the output stream. |

### Types

#### `ReadlineOptions`

```ts
interface ReadlineOptions {
  crlfDelay?: number
  input?: Readable
  output?: Writable
  prompt?: string
}
```

Options accepted when constructing a `Readline` interface.

#### `ReadlineEvents`

```ts
interface ReadlineEvents {
  data: [line: string]
  history: [history: string[]]
  line: [line: string]
  end: []
  readable: []
  piping: [dest: Writable]
  close: []
  error: [err: Error]
}
```

Events emitted by a `Readline` interface.
<!-- bare-refgen:api end -->
