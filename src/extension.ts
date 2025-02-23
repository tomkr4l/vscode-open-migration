// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { commands, window, ExtensionContext, workspace } from "vscode";

const frameworks = [{ id: "rails", name: "Ruby on Rails", folder: "db/migrate/*.rb" }];

function onError(error: Error, message?: string) {
	console.log(error);
	window.showErrorMessage(`${message} ${error.message}`.trim());
}

function showLatest() {
	let allFiles: string[] = [];

	Promise.all(frameworks.map((framework) => workspace.findFiles(framework.folder)))
		.then((results) => {
			results.forEach((files) => {
				allFiles.push(...files.map((file) => file.fsPath));
			});

			if (allFiles.length > 0) {
				const sortedFiles = allFiles.sort();
				const latest = sortedFiles[sortedFiles.length - 1];
				workspace.openTextDocument(latest).then(window.showTextDocument, onError);
			} else {
				window.showInformationMessage("No migrations found.");
			}
		})
		.catch((error) => {
			onError(error, "An error occurred while searching for migrations.");
		});
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscode-show-migration" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = commands.registerCommand("vscode-show-migration.showLatest", () => {
		showLatest();
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
