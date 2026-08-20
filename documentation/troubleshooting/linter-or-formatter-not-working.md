### Ruff not formatting and linting?

#### Try this first

1. `ctrl + shift + p`
2. Type `Ruff: Restart Server`
3. Enter

#### If nothing helps

1. Add `"ruff.nativeServer": "off"` to `.vscode/settings.json`
2. Open `ctrl + shift + p`
3. `Developer: Reload Window`
4. Test on a python file
5. Remove `"ruff.nativeServer": "off"` from `.vscode/settings.json`

### ESLint / Frontend import sorter not working?

1. Open `ctrl + shift + p`
2. `ESLint: Restart ESLint Server`
3. If that does not help, ESLint might be stalling because tsserver has a problem
4. Restart container and check if typescript server is working
