// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { commands, window, ExtensionContext, workspace, ThemeIcon, ConfigurationTarget } from "vscode";
import { wildcards, iconMapping } from "./config";

function onError(error: Error, message?: string) {
	console.log(error);
	window.showErrorMessage(`${message} ${error.message}`.trim());
}

function getSearchFolders(): string[] {
	const customFolders = getCustomFolders();
	const searchFolders = wildcards.map((wildcard) => wildcard);

	if (customFolders.length > 0) {
		return [...searchFolders, ...customFolders];
	} else {
		return searchFolders;
	}
}

function showLatest() {
	let allFiles: string[] = [];
	const folders = getSearchFolders();

	Promise.all(folders.map((folder) => workspace.findFiles(folder)))
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

function showMigration() {
	const folders = getSearchFolders();

	Promise.all(folders.map((folder) => workspace.findFiles(folder)))
		.then((results) => {
			const allFiles = results
				.flat()
				.map((file) => file.fsPath)
				.filter((filePath) => !filePath.split("/").pop()?.startsWith("."));

			if (allFiles.length > 0) {
				const sortedFiles = allFiles.sort().reverse();

				const quickPickItems = sortedFiles.map((file) => {
					const fileUri = workspace.asRelativePath(file);
					const fileName = file.split("/").pop();
					const fileExtension = fileName?.split(".").pop() || "";
					const iconId = iconMapping["." + fileExtension] || "file";
					const fileIcon = new ThemeIcon(iconId); // file icon not supported? https://github.com/microsoft/vscode/issues/59826
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
	Promise.all(wildcards.map((wildcard) => workspace.findFiles(wildcard)))
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

function getCustomFolders(): string[] | [] {
	const config = workspace.getConfiguration("vscode-show-migration");
	return config.get<string[]>("customFolders") || [];
}

function addCustomFolder(folder: string) {
	const config = workspace.getConfiguration("vscode-show-migration");
	const existingFolders: string[] = getCustomFolders();

	if (existingFolders.includes(folder)) {
		window.showInformationMessage(`Custom migration folder already exists: ${folder}`);
		return;
	} else {
		existingFolders.push(folder);
		config.update("customFolders", existingFolders, ConfigurationTarget.Workspace);
	}
}

function promptForAddCustomFolder() {
	window
		.showInputBox({
			prompt: "Enter the path to your custom migration folder with wildcard",
			placeHolder: "db/scripts/*.rb",
		})
		.then((folder) => {
			if (folder) {
				addCustomFolder(folder);
				window.showInformationMessage(`Added custom migration folder: ${folder}`);
			}
		});
}

function promptForRemoveCustomFolder() {
	const config = workspace.getConfiguration("vscode-show-migration");
	const existingFolders: string[] = getCustomFolders();

	if (existingFolders.length === 0) {
		window.showInformationMessage("No custom migration folders set for this workspace.");
		return;
	}

	window
		.showQuickPick(existingFolders, { placeHolder: "Select a custom migration folder wildcard to remove" })
		.then((selectedFolder) => {
			if (selectedFolder) {
				const updatedFolders = existingFolders.filter((folder) => folder !== selectedFolder);
				config.update("customFolders", updatedFolders, ConfigurationTarget.Workspace);
				window.showInformationMessage(`Custom migration folder removed: ${selectedFolder}`);
			}
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

	const showMigrationCommand = commands.registerCommand("vscode-show-migration.showMigration", () => {
		showMigration();
	});
	context.subscriptions.push(showMigrationCommand);

	const addCustomFolderCommand = commands.registerCommand("vscode-show-migration.addCustomMigrationFolder", () => {
		promptForAddCustomFolder();
	});
	context.subscriptions.push(addCustomFolderCommand);

	const removeCustomMigrationFolderCommand = commands.registerCommand(
		"vscode-show-migration.removeCustomMigrationFolder",
		() => {
			promptForRemoveCustomFolder();
		}
	);

	context.subscriptions.push(removeCustomMigrationFolderCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
