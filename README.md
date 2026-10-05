# Keeper

Angela Yu/The App Brewery's famous Keeper React app, made better with:
- [Bun](https://bun.com) (init in `v1.3.10`)
- Tailwind
- TypeScript
- SQLite
- And last but not least, the latest React syntax

You need to [install Bun](https://bun.com/get) to run this app. After install, follow instruction below.

Notes are stored on the server in SQLite and loaded when the app opens. Adding
and deleting notes updates the database, so changes survive page reloads and
server restarts. The app uses Bun's built-in `bun:sqlite`; no database service
or additional dependency is needed.

The database and its directory are created automatically at `data/keeper.sqlite`
inside this project. To use another location, set `KEEPER_DB_PATH` before starting
the server (relative paths are resolved from the working directory):

```powershell
$env:KEEPER_DB_PATH = "C:\data\keeper.sqlite"
bun dev
```

Keep this file on persistent storage when deploying. For a backup, stop the server
and copy the `data` directory, including any SQLite WAL files. Notes are shared by
all browsers using this server; the app does not have user accounts.

API endpoints: `GET /api/notes`, `POST /api/notes` with JSON `{ "title": "...",
"content": "..." }`, and `DELETE /api/notes/:id`. At least one field must contain
text. Failed saves keep the draft in the form.

To install dependencies:

```bash
bun install
```

To start a development server:

```bash
bun dev
```

To run for production:

```bash
bun start
```

Run the API validation and database persistence tests:

```bash
bun test
```

`bun run build` creates frontend assets only. Run `bun start` to serve the app
with its SQLite API; the exported frontend requires that backend.
