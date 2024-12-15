const vscode = require("vscode");
const { scanMarkdownFiles } = require("./src/indexSlugs.js");

const { regexBuilder } = require("./src/utils/regexBuilder.js");

// We may modify later
let slugToFileMap = new Map();

const locale = "en-US";
const localeString = `/${locale}/docs/`;

// regex to match slugs
const regex = regexBuilder(locale);

/**
 * @param {{ subscriptions: vscode.Disposable[]; }} context
 */
async function activate(context) {
  // Scan files and load a map of slugs to Markdown file paths
  // We don't want to do this too often because it's slow (10sec?)
  // but it can be called any time.
  const scanCommand = vscode.commands.registerCommand(
    "follow-xrefs.scanFiles",
    async () => {
      // create a new status bar item that we can now manage
      let status = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left,
        1,
      );
      // Show a spinner
      status.text = `$(sync~spin) Indexing MDN slugs…`;
      status.backgroundColor = new vscode.ThemeColor(
        "statusBar.debuggingBackground",
      );
      status.color = new vscode.ThemeColor("statusBar.debuggingForeground");
      status.tooltip =
        "A map of files by slug allows 'Jump to file' in Markdown links.";
      status.show();

      // Actually index
      slugToFileMap = await scanMarkdownFiles();

      status.backgroundColor = new vscode.ThemeColor("statusBar.background");
      status.color = new vscode.ThemeColor("statusBar.foreground");
      status.text = `$(check) Indexed ${slugToFileMap.size} MDN slugs!`;
      // status.hide();
    },
  );

  const markdownHoverProvider = vscode.languages.registerHoverProvider(
    "markdown",
    {
      provideHover(document, position) {
        // Match Markdown links like [...](slug)
        const range = document.getWordRangeAtPosition(position, regex);
        if (!range) return;
        const match = document.getText(range).match(regex);
        if (!match) return;

        // We want the group right after the `localeString`
        const slug = match[2];
        const filePath = slugToFileMap.get(slug);
        // console.log(slug, filePath);
        if (!filePath) return;

        // We have a match here! Show it!
        const fileUri = vscode.Uri.file(filePath);
        const markdownString = new vscode.MarkdownString(
          // 1. You can do `Jump to ${filePath}` but it can be long.
          //    It looks better to say "Jump to file" for now.
          // 2. I'm not sure if there's a better alternative to encodeURIComponent
          `[Jump to file](command:follow-xrefs.openFile?${encodeURIComponent(
            JSON.stringify(fileUri),
          )})`,
        );
        // We trust the input in this case
        markdownString.isTrusted = true;
        return new vscode.Hover(markdownString);
      },
    },
  );
  // Open the file based on the encodeURIComponent
  const openFileCommand = vscode.commands.registerCommand(
    "follow-xrefs.openFile",
    async (fileUri) => {
      if (fileUri) {
        vscode.window.showTextDocument(vscode.Uri.parse(fileUri));
      }
    },
  );

  // We can also add completions based on the map!
  const completionProvider = vscode.languages.registerCompletionItemProvider(
    "markdown",
    {
      provideCompletionItems(document, position) {
        // This is the current line up to the cursor 'position'
        const linePrefix = document
          .lineAt(position)
          .text.substring(0, position.character);

        // `](/` is important because it's usually when we're
        // about to cross-reference an internal slug, like:
        // [Client hints](/en-US/docs/Web/HTTP/Client_hints)
        if (!linePrefix.includes("](/")) {
          return;
        }

        const completions = Array.from(slugToFileMap.keys()).map((slug) => {
          const item = new vscode.CompletionItem(
            slug,
            vscode.CompletionItemKind.Reference,
          );
          // remove the first `/` seeing as we've just typed it
          item.insertText = localeString.substring(1) + slug;
          return item;
        });

        return completions;
      },
    },
    // I don't know if it's possible to rewrite display text in
    // `[text here]` when we accept a completion or if that's
    // even desired.

    // Trigger completion with `/`
    "/",
  );

  context.subscriptions.push(
    scanCommand,
    markdownHoverProvider,
    openFileCommand,
    completionProvider,
  );
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
