export const wildcards = [
	"db/migrate/*.rb", // Ruby on Rails
	"priv/repo/migrations/*.exs", // Elixir Phoenix
	"database/migrations/*.php", // Laravel
	"migrations/*.py", // Django
];

// file icon not supported? https://github.com/microsoft/vscode/issues/59826
export const iconMapping: { [key: string]: string } = {
	".rb": "ruby",
	".exs": "file",
	".php": "file",
	".py": "snake",
};
