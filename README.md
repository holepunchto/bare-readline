# bare-readline

Line editing for interactive CLIs with command history.

```
npm i bare-readline
```

## Usage

``` js
const readline = require('bare-readline')

const rl = readline.createInterface({
  input: stream,
  output: stream
})

rl
  .on('data', (line) => {
    console.log(line)
    rl.prompt()
  })
  .prompt()
```

## License

Apache-2.0
