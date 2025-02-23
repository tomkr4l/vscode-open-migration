export const frameworks = [
	{ id: "rails", migrationsFolder: "db/migrate/*.rb" },
	{
		id: "phoenix",
		migrationsFolder: "priv/repo/migrations/*.exs",
	},
	{
		id: "laravel",
		migrationsFolder: "database/migrations/*.php",
	},
	{ id: "django", migrationsFolder: "migrations/*.py" },
];

// file icon not supported? https://github.com/microsoft/vscode/issues/59826
export const iconMapping: { [key: string]: string } = {
	".rb": "ruby",
	".exs": "file",
	".php": "file",
	".py": "snake",
};
