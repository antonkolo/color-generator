# color-generator

Create an application that will return a random color in the command line.

It should work like this:

When a user enters `node index.js` in the command line, a block of 31x9 `#` characters colored with a random color (using hex code, e.g. `#ff0000`) should be generated.

It should look like this:

![Screen Shot 2020-09-09 at 15 53 33](https://user-images.githubusercontent.com/1935696/92607675-b56bd700-f2b4-11ea-9085-67af9369fa71.png)

In addition to `node index.js`, it should also be able to accept the request for a:

- hue (eg. green or red or blue)
- luminosity (eg. light or dark)

...and then generate random colors that match those choices.

For example:

![Screen Shot 2020-09-09 at 15 54 42](https://user-images.githubusercontent.com/1935696/92607766-daf8e080-f2b4-11ea-9d6d-3bd8501da443.png)

When you believe you are done, set up a test:

1. Create a directory called `.github` (there is a dot at the start)
2. Create a directory called `workflows` inside `.github`
3. Create a file called `test.yml` inside `workflows` containing the following code

```yaml
name: Test Project
on: push

jobs:
  test:
    name: Test Project
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 'latest'
      - uses: actions/setup-node@v4
        with:
          node-version: 'lts/*'
          cache: 'pnpm'
      - name: Install project dependencies
        run: pnpm install
      - name: Install test dependencies
        run: pnpm add --save-dev strip-ansi
      - name: Create test file
        # Create a test file that will run index.js from the project
        # with Node.js and check that it roughly matches the
        # following pattern (9 rows, 31 columns, with a space in the
        # center and a hex code in the middle):
        #
        # ###############################
        # ###############################
        # ###############################
        # #####                     #####
        # #####       #edff28       #####
        # #####                     #####
        # ###############################
        # ###############################
        # ###############################
        #
        # The pattern will be matched in a forgiving way:
        # - Unlimited number of spaces at the start of each line
        # - Minimum 1 # character left and right border
        # - Minimum 1 # character top and bottom border
        # - Minimum 1 space surrounding the hex code
        # - Minimum 11 columns
        # - Minimum 5 rows
        run: |
          cat > test.js <<'END_SCRIPT'
            import { exec } from 'node:child_process';
            import { promisify } from 'node:util';
            import stripAnsi from 'strip-ansi';

            const execAsync = promisify(exec);

            const { stdout: stdoutNoArgs1 } = await execAsync('node index.js');

            const pattern =
              /^( *#{11,}\n){1,} *#{1,} +#{1,}\n *#{1,} +(#[A-Fa-f0-9]{6}) +#{1,}\n *#{1,} +#{1,}\n( *#{11,}\n){1,}/m;

            // Get hex color from the output
            const matchNoArgs1 = stripAnsi(stdoutNoArgs1).match(pattern);

            if (!matchNoArgs1) {
              console.log('❌ `node index.js` (run 1): pattern did not match');
              process.exit(1);
            }

            console.log('✔️ `node index.js` (run 1): pattern matched');

            const [, , hexCodeNoArgs1] = matchNoArgs1;

            const { stdout: stdoutNoArgs2 } = await execAsync('node index.js');
            const match2 = stripAnsi(stdoutNoArgs2).match(pattern);

            if (!match2) {
              console.log('❌ `node index.js` (run 2): pattern did not match');
              process.exit(1);
            }

            console.log('✔️ `node index.js` (run 2): pattern matched');

            const [, , hexCodeNoArgs2] = match2;

            const { stdout: stdoutNoArgs3 } = await execAsync('node index.js');
            const match3 = stripAnsi(stdoutNoArgs3).match(pattern);

            if (!match3) {
              console.log('❌ `node index.js` (run 3): pattern did not match');
              process.exit(1);
            }

            console.log('✔️ `node index.js` (run 3): pattern matched');

            const [, , hexCodeNoArgs3] = match3;

            if (hexCodeNoArgs1 === hexCodeNoArgs2 && hexCodeNoArgs2 === hexCodeNoArgs3) {
              console.log(
                `❌ \`node index.js\` (all 3 runs): the hex code was the same: ${hexCodeNoArgs1}`,
              );
              process.exit(1);
            }

            console.log(
              `✔️ \`node index.js\` (all 3 runs): the hex code was different: ${hexCodeNoArgs1}, ${hexCodeNoArgs2}, ${hexCodeNoArgs3}`,
            );

            const { stdout: stdoutRed } = await execAsync('node index.js red');

            const matchRed = stripAnsi(stdoutRed).match(pattern);

            if (!matchRed) {
              console.log('❌ `node index.js red`: pattern did not match');
              process.exit(1);
            }

            console.log('✔️ `node index.js red`: pattern matched');

            const [, , hexCodeRed] = matchRed;

            function hexCodeLikeColor(hexCode, color) {
              const r = parseInt(hexCode.slice(1, 3), 16);
              const g = parseInt(hexCode.slice(3, 5), 16);
              const b = parseInt(hexCode.slice(5, 7), 16);
              if (color === 'red') return r >= Math.max(g, b);
              const luminosity = 0.2126 * r + 0.7152 * g + 0.0722 * b; // #ffffff is 255
              return (
                b >=
                  Math.max(
                    r,
                    // Adjust green for turquoises
                    g - 10,
                  ) && luminosity <= 128
              ); // blue dark
            }

            if (!hexCodeLikeColor(hexCodeRed, 'red')) {
              console.log(
                `❌ \`node index.js red\`: the hex code ${hexCodeRed} is not red`,
              );
              process.exit(1);
            }

            console.log(`✔️ \`node index.js red\`: the hex code ${hexCodeRed} is red`);

            const { stdout: stdoutBlueDark } = await execAsync('node index.js blue dark');

            const matchBlueDark = stripAnsi(stdoutBlueDark).match(pattern);

            if (!matchBlueDark) {
              console.log('❌ `node index.js blue dark`: pattern did not match');
              process.exit(1);
            }

            console.log('✔️ `node index.js blue dark`: pattern matched');

            const [, , hexCodeBlueDark] = matchBlueDark;

            if (!hexCodeLikeColor(hexCodeBlueDark, 'blue')) {
              console.log(
                `❌ \`node index.js blue dark\`: the hex code ${hexCodeBlueDark} is not dark blue`,
              );
              process.exit(1);
            }

            console.log(
              `✔️ \`node index.js blue dark\`: the hex code ${hexCodeBlueDark} is dark blue`,
            );

            console.log('✔️ All tests passed');
          END_SCRIPT
      - name: Run test file
        run: node test.js
```

## Stretch goals

- [ ] If a user types "ask" instead of a color name, print questions to ask the user for the name of the color and the luminosity
- [ ] If a user types a size in the format of `WWxHH` (eg. `31x9`) **before** the color and luminosity, it will use this as the size of the box

## Acceptance Criteria

- [ ] Preflight runs through without errors in your project
  - [ ] Link in your GitHub repo's About section: [Replit demo](https://learn.upleveled.io/pern-extensive-immersive/modules/cheatsheet-tasks/#replit)
- [] [Drone bot](https://learn.upleveled.io/pern-extensive-immersive/modules/cheatsheet-tasks/#upleveled-drone) has been tagged and responded with a passing message
- [ ] Correct GitHub commit message format (see [Writing Commit Messages](https://learn.upleveled.io/pern-extensiv

Little Change
