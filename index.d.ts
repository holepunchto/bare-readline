import { Readable, ReadableEvents, Writable } from 'bare-stream'

interface ReadlineOptions {
  crlfDelay?: number
  input?: Readable
  output?: Writable
  prompt?: string
}

interface ReadlineEvents extends ReadableEvents {
  data: [line: string]
  history: [history: string[]]
  line: [line: string]
}

interface Readline<E extends ReadlineEvents = ReadlineEvents>
  extends Readable<E> {
  readonly cursor: number
  readonly line: string
  readonly input: Readable
  readonly output: Writable

  prompt(): void

  close(): void

  write(data: string): void

  clearLine(): string
}

declare class Readline {
  constructor(opts?: ReadlineOptions)
}

declare namespace Readline {
  export function createInterface(opts?: ReadlineOptions): Readline

  export const constants: { EOL: string }

  export { type ReadlineOptions, type ReadlineEvents }
}

export = Readline
