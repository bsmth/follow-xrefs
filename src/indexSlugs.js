const vscode = require("vscode");

async function scanMarkdownFiles() {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    vscode.window.showErrorMessage("No workspace is open.");
    // Should probably bail here, but return empty map anyway
    return new Map();
  }

  // TODO: make this configurable somehow.
  const baseDir = "./files/en-us";
  const markdownFiles = [];
  const FileAndSlugMap = new Map();

  /**
   * @param {vscode.Uri} directoryUri
   */
  async function scanDirectory(directoryUri) {
    const files = await vscode.workspace.fs.readDirectory(directoryUri);

    for (const [name, fileType] of files) {
      const fileUri = vscode.Uri.joinPath(directoryUri, name);

      if (fileType === vscode.FileType.Directory) {
        // Recursively scan if directory
        await scanDirectory(fileUri);
      } else if (
        fileType === vscode.FileType.File &&
        name.endsWith("index.md")
      ) {
        // Index files (pages) found
        markdownFiles.push(fileUri);
      }
    }
  }

  // Start scanning from the base directory
  // hardcoded for now, see baseDir
  for (const folder of workspaceFolders) {
    const baseUri = vscode.Uri.joinPath(folder.uri, baseDir);
    try {
      await scanDirectory(baseUri);
    } catch (err) {
      vscode.window.showErrorMessage(
        `Error scanning directory ${baseDir}: ${err.message}`,
      );
    }
  }

  // Extract slugs from front matter
  for (const fileUri of markdownFiles) {
    const fileContent = await vscode.workspace.fs.readFile(fileUri);
    const text = fileContent.toString();

    // We could "properly" parse the front matter, but
    // just match the line `slug: Thing/One/Two`
    const slugMatch = text.match(/^slug:\s*(.+?)\s*$/m);
    // I don't think we have any non-matching files
    // but just in case, skip if no match
    if (!slugMatch) continue;
    // Now we have a slug, add it to the map
    const slug = slugMatch[1];
    FileAndSlugMap.set(slug, fileUri.fsPath);
  }

  // console.log("Map:", FileAndSlugMap);
  return FileAndSlugMap;
}

module.exports = {
  scanMarkdownFiles,
};
