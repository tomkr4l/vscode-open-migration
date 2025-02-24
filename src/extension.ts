// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { commands, window, ExtensionContext, workspace, ThemeIcon, ConfigurationTarget } from "vscode";
import { defaultSearchFolders, iconMapping } from "./config";

const searchFoldersKey = "searchFolders";

function onError(error: Error, message?: string) {
	console.log(error);
	window.showErrorMessage(`${message} ${error.message}`.trim());
}

function openLatest() {
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

function openMigration() {
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
	const folders = getSearchFolders();

	Promise.all(folders.map((folder) => workspace.findFiles(folder)))
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

function getSearchFolders(): string[] | [] {
	const config = workspace.getConfiguration("vscode-show-migration");
	return config.get<string[]>(searchFoldersKey) || defaultSearchFolders;
}

function addCustomFolder(folder: string) {
	const existingFolders: string[] = getSearchFolders();

	if (existingFolders.includes(folder)) {
		window.showInformationMessage(`Custom migration folder already exists: ${folder}`);
		return;
	} else {
		existingFolders.push(folder);
		setSearchFolders(existingFolders);
	}
}

function promptForAddFolder() {
	window
		.showInputBox({
			prompt: "Enter the path to your custom migration folder with wildcard",
			placeHolder: "example: db/scripts/*.rb",
		})
		.then((folder) => {
			if (folder) {
				addCustomFolder(folder);
				window.showInformationMessage(`Added custom migration folder: ${folder}`);
			}
		});
}

function promptForRemoveFolder() {
	const existingFolders: string[] = getSearchFolders();

	if (existingFolders.length === 0) {
		window.showInformationMessage("No custom migration folders set for this workspace.");
		return;
	}

	window
		.showQuickPick(existingFolders, { placeHolder: "Select a custom migration folder wildcard to remove" })
		.then((selectedFolder) => {
			if (selectedFolder) {
				const updatedFolders = existingFolders.filter((folder) => folder !== selectedFolder);
				setSearchFolders(updatedFolders);
				window.showInformationMessage(`Custom migration folder removed: ${selectedFolder}`);
			}
		});
}

function setSearchFolders(folders: string[]) {
	const config = workspace.getConfiguration("vscode-show-migration");
	config.update(searchFoldersKey, folders, ConfigurationTarget.Workspace);
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
	const openLatestCommand = commands.registerCommand("vscode-show-migration.openLatest", () => {
		openLatest();
	});
	context.subscriptions.push(openLatestCommand);

	const revealFolderCommand = commands.registerCommand("vscode-show-migration.revealFolder", () => {
		revealMigrationFolder();
	});
	context.subscriptions.push(revealFolderCommand);

	const openMigrationCommand = commands.registerCommand("vscode-show-migration.openMigration", () => {
		openMigration();
	});
	context.subscriptions.push(openMigrationCommand);

	const addFolderCommand = commands.registerCommand("vscode-show-migration.addFolder", () => {
		promptForAddFolder();
	});
	context.subscriptions.push(addFolderCommand);

	const removeFolderCommand = commands.registerCommand("vscode-show-migration.removeFolder", () => {
		promptForRemoveFolder();
	});

	context.subscriptions.push(removeFolderCommand);

	const resetFoldersCommand = commands.registerCommand("vscode-show-migration.resetToDefaults", () => {
		setSearchFolders(defaultSearchFolders);
		window.showInformationMessage("Migration folders reset to default.");
	});

	context.subscriptions.push(resetFoldersCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
