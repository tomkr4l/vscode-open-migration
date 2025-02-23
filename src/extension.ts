// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { commands, window, ExtensionContext, workspace } from "vscode";

const frameworks = [{ id: "rails", name: "Ruby on Rails", folder: "db/migrate/*.rb" }];

function showLatest() {
	let found: boolean = false;

	frameworks.forEach((framework) => {
		workspace.findFiles(framework.folder).then((files) => {
			if (files.length > 0) {
				const paths = sortFilesByFramework(
					framework.id,
					files.map((file) => file.fsPath)
				);

				const latest = paths[paths.length - 1];
				window.showInformationMessage(`Latest migration: ${latest}`);
			}
		});
	});

	window.showInformationMessage("No migrations found or framework not supported.");
}

function sortFilesByFramework(frameworkId: string, paths: string[]): string[] {
	return paths.sort();
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
