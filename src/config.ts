export const wildcards = [
	"db/migrate/*.rb",
	"priv/repo/migrations/*.exs",
	"database/migrations/*.php",
	"migrations/*.py",
];

// file icon not supported? https://github.com/microsoft/vscode/issues/59826
export const iconMapping: { [key: string]: string } = {
	".rb": "ruby",
	".exs": "file",
	".php": "file",
	".py": "snake",
};
