// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { commands, window, ExtensionContext, workspace, ThemeIcon, extensions } from "vscode";
import { frameworks, iconMapping } from "./config";

function onError(error: Error, message?: string) {
	console.log(error);
	window.showErrorMessage(`${message} ${error.message}`.trim());
}

function showLatest() {
	let allFiles: string[] = [];

	Promise.all(frameworks.map((framework) => workspace.findFiles(framework.migrationsFolder)))
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

function openMigration() {
	Promise.all(frameworks.map((framework) => workspace.findFiles(framework.migrationsFolder)))
		.then((results) => {
			const allFiles = results.flat().map((file) => file.fsPath);

			if (allFiles.length > 0) {
				const sortedFiles = allFiles.sort().reverse();

				const quickPickItems = sortedFiles.map((file) => {
					const fileUri = workspace.asRelativePath(file);
					const fileName = file.split("/").pop();
					const fileExtension = fileName?.split(".").pop() || "";
					const iconId = iconMapping["." + fileExtension] || "file";
					const fileIcon = new ThemeIcon(iconId);
					return {
						label: `$(${fileIcon.id}) ${fileName}`,
						description: fileUri,
						filePath: file,
					};
				});

				window
					.showQuickPick(quickPickItems, { placeHolder: "Select a migration file to open" })
					.then((selectedItem) => {
						if (selectedItem) {
							workspace.openTextDocument(selectedItem.filePath).then(window.showTextDocument, onError);
						}
					});
			} else {
				window.showInformationMessage("No migrations found.");
			}
		})
		.catch((error) => {
			onError(error, "An error occurred while searching for migrations.");
		});
}

function revealMigrationFolder() {
	Promise.all(frameworks.map((framework) => workspace.findFiles(framework.migrationsFolder)))
		.then((results) => {
			for (const files of results) {
				if (files.length > 0) {
					const folderUri = files[0].with({ path: files[0].path.replace(/\/[^\/]+$/, "") });
					commands.executeCommand("revealInExplorer", folderUri);
					return;
				}
			}
			window.showInformationMessage("No migration folder found.");
		})
		.catch((error) => {
			onError(error, "An error occurred while searching for migration folders.");
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
	const showLatestCommand = commands.registerCommand("vscode-show-migration.showLatest", () => {
		showLatest();
	});
	context.subscriptions.push(showLatestCommand);

	const revealFolderCommand = commands.registerCommand("vscode-show-migration.revealFolder", () => {
		revealMigrationFolder();
	});
	context.subscriptions.push(revealFolderCommand);

	const openMigrationCommand = commands.registerCommand("vscode-show-migration.openMigration", () => {
		openMigration();
	});
	context.subscriptions.push(openMigrationCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
