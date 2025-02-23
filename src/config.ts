export const frameworks = [
	{ id: "rails", name: "Ruby on Rails", migrationsFolder: "db/migrate/*.rb", fileExtension: ".rb", fileIcon: "ruby" },
	{
		id: "phoenix",
		name: "Phoenix",
		migrationsFolder: "priv/repo/migrations/*.exs",
		fileExtension: ".exs",
		fileIcon: "elixir",
	},
	{
		id: "laravel",
		name: "Laravel",
		migrationsFolder: "database/migrations/*.php",
		fileExtension: ".php",
		fileIcon: "php",
	},
	{ id: "django", name: "Django", migrationsFolder: "migrations/*.py", fileExtension: ".py", fileIcon: "python" },
];

// file icon not supported? https://github.com/microsoft/vscode/issues/59826
export const iconMapping: { [key: string]: string } = {
	".rb": "ruby",
	".exs": "file",
	".php": "file",
	".py": "snake",
};
