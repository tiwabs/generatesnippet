# Generate Snippet Extension

A VS Code extension that allows you to easily generate code snippets from your selection.

## Features

- Generate snippets from selected code
- Support for over 60 programming languages
- Automatic detection of current file language
- Compatible with VS Code and Cursor Editor
- User-friendly interface for snippet configuration

## Usage

1. Select the code you want to create a snippet from
2. Right-click on the selection and choose "Generate Snippet" or use the command palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and type "Generate Snippet"
3. Follow the steps to configure your snippet:
   - Snippet name
   - Prefix(es) to trigger the snippet (comma-separated)
   - Description (optional)
   - Language will be automatically detected or you can select it if not detected

## Snippet Location

Snippets are saved in the appropriate folder based on your editor:

- VS Code:
  - Windows: `%APPDATA%\Code\User\snippets\`
  - macOS: `$HOME/Library/Application Support/Code/User/snippets/`
  - Linux: `$HOME/.config/Code/User/snippets/`
- Cursor:
  - Windows: `%APPDATA%\Cursor\User\snippets\`
  - macOS: `$HOME/Library/Application Support/Cursor/User/snippets/`
  - Linux: `$HOME/.config/Cursor/User/snippets/`

## Supported Languages

The extension supports all major programming languages including:
- JavaScript/TypeScript
- Python
- Java
- C/C++
- HTML/CSS
- And many more...

## Requirements

- VS Code 1.82.0 or higher
- Or Cursor Editor

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This extension is licensed under the [MIT License](LICENSE).

## Issues

If you find any bugs or have feature requests, please create an issue on the [GitHub repository](https://github.com/tiwabs/generatesnippet).

---

**Enjoy!** 🚀
