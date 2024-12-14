const vscode = require("vscode");
const { scanMarkdownFiles } = require("./src/indexSlugs.js");

let FileAndSlugMap = new Map();

// step 1 for making this locale-independent
const locale = "en-US";
const localeString = `/${locale}/docs/`;

// Dynamically create the regex using template literals
const xrefRegex = new RegExp(`\\[.*?\\]\\((${localeString}(.+?))\\)`);

/**
 * @param {{ subscriptions: vscode.Disposable[]; }} context
 */
async function activate(context) {
  // Scan Markdown files and load a map of slugs to file paths
  // We don't want to do this too often because it's slow,
  // but it can be called any time on-demand.
  const scanCommand = vscode.commands.registerCommand(
    "follow-xrefs.scanFiles",
    async () => {
      vscode.window.showInformationMessage(`Indexing markdown files…`);
      FileAndSlugMap = await scanMarkdownFiles();

      vscode.window.showInformationMessage(
        `${FileAndSlugMap.size} files indexed.`
      );
    }
  );

  const markdownHoverProvider = vscode.languages.registerHoverProvider(
    "markdown",
    {
      provideHover(document, position) {
        // Match Markdown links like [...](slug)
        const range = document.getWordRangeAtPosition(position, xrefRegex);
        if (!range) return;
        const match = document.getText(range).match(xrefRegex);
        if (!match) return;

        // We want the stuff after the `localeString`
        const slug = match[2];
        const filePath = FileAndSlugMap.get(slug);
        // console.log(slug, filePath);

        if (!filePath) return;

        // We have something to link to
        const fileUri = vscode.Uri.file(filePath);
        // Create a MarkdownString and show it above the source xref
        const markdownString = new vscode.MarkdownString(
          // You can also do `Jump to ${slug}`:
          `[Jump to file](command:follow-xrefs.openFile?${encodeURIComponent(
            JSON.stringify(fileUri)
          )})`
        );

        markdownString.isTrusted = true;
        return new vscode.Hover(markdownString);
      },
    }
  );
  // Open the file based on the encodeURIComponent
  const openFileCommand = vscode.commands.registerCommand(
    "follow-xrefs.openFile",
    async (fileUri) => {
      if (fileUri) {
        vscode.window.showTextDocument(vscode.Uri.parse(fileUri));
      }
    }
  );

  context.subscriptions.push(
    scanCommand,
    markdownHoverProvider,
    openFileCommand
  );
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
