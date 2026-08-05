import { Readable, ReadableEvents, Writable } from 'bare-stream'

/** Options accepted when constructing a `Readline` interface. */
interface ReadlineOptions {
  /** Milliseconds to wait after a carriage return before treating a following linefeed as part of the same line ending, rather than a second line. Defaults to `100`, and is clamped to a minimum of `100`. */
  crlfDelay?: number
  /** The readable stream to read keystrokes from. */
  input?: Readable
  /** The writable stream to render the prompt and line edits to. */
  output?: Writable
  /** The prompt string written before the input line. Defaults to `'> '`. */
  prompt?: string
}

/** Events emitted by a `Readline` interface. */
interface ReadlineEvents extends ReadableEvents {
  /** Emitted with each completed line, in addition to the line being pushed to the readable stream. */
  data: [line: string]
  /** Emitted with the updated history array whenever a new line is remembered. */
  history: [history: string[]]
  /** Emitted with each completed line, for Node.js `readline` compatibility. */
  line: [line: string]
}

interface Readline<E extends ReadlineEvents = ReadlineEvents> extends Readable<E> {
  /** The current cursor position within the input line. */
  readonly cursor: number
  /** The current, in-progress input line. */
  readonly line: string
  /** The readable stream that keystrokes are read from. */
  readonly input: Readable
  /** The writable stream that the prompt and line edits are rendered to. */
  readonly output: Writable

  /** Render the prompt and current input line to the output. */
  prompt(): void
  /**
   * Set the prompt string written before the input line.
   * @param prompt - The prompt string written before the input line.
   */
  setPrompt(prompt: string): void
  /**
   * Returns the current prompt string.
   * @returns the current prompt string.
   */
  getPrompt(): string
  /** Stop listening for input and end the stream. */
  close(): void
  /**
   * Write data directly to the output stream.
   * @param data - The data to write to the output stream.
   */
  write(data: string): void
  /**
   * Clear the current input line from the output and reset the line buffer and cursor, returning the cleared line.
   * @returns the input line that was cleared, before the buffer and cursor were reset.
   */
  clearLine(): string
}

declare class Readline {
  /**
   * Create a `Readline` interface over an input and output stream.
   * @param opts - Options; `input` and `output` are the streams to read from and render to, `prompt` defaults to `'> '`, and `crlfDelay` defaults to `100`.
   */
  constructor(opts?: ReadlineOptions)
}

/** A readable stream that reads input line by line, rendering an editable prompt line with cursor movement, history, and line-editing keys. */
declare namespace Readline {
  /**
   * Create a `Readline` interface over an input and output stream.
   * @param opts - Options; `input` and `output` are the streams to read from and render to, `prompt` defaults to `'> '`, and `crlfDelay` defaults to `100`.
   */
  export function createInterface(opts?: ReadlineOptions): Readline

  /** Constants used by `Readline`, including the end-of-line sequence. */
  export const constants: { EOL: string }

  export { type ReadlineOptions, type ReadlineEvents }
}

export = Readline
