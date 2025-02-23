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

export const iconMapping: { [key: string]: string } = {
	".rb": "ruby",
	".exs": "elixir",
	".ex": "elixir",
	".php": "php",
	".py": "python",
};
