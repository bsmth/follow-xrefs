# VS Code extension development

## Project contents

This folder contains all of the files necessary for the extension.

- `package.json` - this is the manifest file in which you declare the extension and command.
  - The plugin registers a command and defines its title and command name.
    With this information VS Code can show the command in the command palette.
    It doesn't need to load the plugin.
- `extension.js` - this is the main file where you will provide the implementation of the command.
  - The file exports one function, `activate`, which is called the very first time the extension is activated (in this case by executing the indexing command).
    Inside the `activate` function we call `registerCommand`.
  - We pass the function containing the implementation of the command as the second parameter to `registerCommand`.

## Get up and running

- With this project in a VS Code workspace, press `F5` to open a new window with the extension loaded.
- Run the command from the command palette by pressing (`Ctrl+Shift+P` or `Cmd+Shift+P` on Mac) and typing `Index MDN slugs`.
- Set breakpoints in the code inside `extension.js` to debug the extension.
- Find output from the extension in the debug console.

## Make changes

- You can relaunch the extension from the debug toolbar after changing code in `extension.js`.
- You can also reload (`Ctrl+R` or `Cmd+R` on Mac) the VS Code window with the extension to load the changes.

## Explore the API

- You can open the full set of our API when you open the file `node_modules/@types/vscode/index.d.ts`.

## Run tests

- Install the [Extension Test Runner](https://marketplace.visualstudio.com/items?itemName=ms-vscode.extension-test-runner)
- Open the Testing view from the activity bar and click the Run Test" button, or use the hotkey `Ctrl/Cmd + ; A`
- See the output of the test result in the Test Results view.
- Make changes to `test/extension.test.js` or create new test files inside the `test` folder.
  - The provided test runner will only consider files matching the name pattern `**.test.js`.
  - You can create folders inside the `test` folder to structure the tests any way you want.

## Go further

From VS Code docs:

- [Follow UX guidelines](https://code.visualstudio.com/api/ux-guidelines/overview) to create extensions that seamlessly integrate with VS Code's native interface and patterns.
- Automate builds by setting up [Continuous Integration](https://code.visualstudio.com/api/working-with-extensions/continuous-integration).
- Integrate to the [report issue](https://code.visualstudio.com/api/get-started/wrapping-up#issue-reporting) flow to get issue and feature requests reported by users.
