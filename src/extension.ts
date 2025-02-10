import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as jsonc from 'jsonc-parser';

// Types and interfaces for snippet management
interface SnippetBody {
    prefix: string | string[];
    body: string[];
    description: string;
}

interface SnippetsFile {
    [key: string]: SnippetBody;
}

interface LanguageOption {
    id: string;
    label: string;
}

// List of supported programming languages and their display labels
const supportedLanguages: LanguageOption[] = [
    { id: 'bat', label: 'bat (Batch)' },
    { id: 'bibtex', label: 'bibtex (BibTeX)' },
    { id: 'c', label: 'c (C)' },
    { id: 'clojure', label: 'clojure (Clojure)' },
    { id: 'code-text-binary', label: 'code-text-binary (Binary)' },
    { id: 'coffeescript', label: 'coffeescript (CoffeeScript)' },
    { id: 'cpp', label: 'cpp (C++)' },
    { id: 'csharp', label: 'csharp (C#)' },
    { id: 'css', label: 'css (CSS)' },
    { id: 'cuda-cpp', label: 'cuda-cpp (CUDA C++)' },
    { id: 'dart', label: 'dart (Dart)' },
    { id: 'diff', label: 'diff (Diff)' },
    { id: 'dockerfile', label: 'dockerfile (Docker)' },
    { id: 'dockercompose', label: 'dockercompose (Compose)' },
    { id: 'editorconfig', label: 'editorconfig (EditorConfig)' },
    { id: 'fsharp', label: 'fsharp (F#)' },
    { id: 'git-commit', label: 'git-commit (Git Commit Message)' },
    { id: 'git-rebase', label: 'git-rebase (Git Rebase Message)' },
    { id: 'go', label: 'go (Go)' },
    { id: 'graphql', label: 'graphql (GraphQL)' },
    { id: 'groovy', label: 'groovy (Groovy)' },
    { id: 'handlebars', label: 'handlebars (Handlebars)' },
    { id: 'hlsl', label: 'hlsl (HLSL)' },
    { id: 'html', label: 'html (HTML)' },
    { id: 'ignore', label: 'ignore (Ignore)' },
    { id: 'ini', label: 'ini (Ini)' },
    { id: 'jade', label: 'jade (Pug)' },
    { id: 'java', label: 'java (Java)' },
    { id: 'javascript', label: 'javascript (JavaScript)' },
    { id: 'javascriptreact', label: 'javascriptreact (JavaScript JSX)' },
    { id: 'json', label: 'json (JSON)' },
    { id: 'jsonc', label: 'jsonc (JSON with Comments)' },
    { id: 'jsonl', label: 'jsonl (JSON Lines)' },
    { id: 'julia', label: 'julia (Julia)' },
    { id: 'juliamarkdown', label: 'juliamarkdown (Julia Markdown)' },
    { id: 'lua', label: 'lua (Lua)' },
    { id: 'latex', label: 'latex (LaTeX)' },
    { id: 'less', label: 'less (Less)' },
    { id: 'log', label: 'log (Log)' },
    { id: 'makefile', label: 'makefile (Makefile)' },
    { id: 'markdown', label: 'markdown (Markdown)' },
    { id: 'objective-c', label: 'objective-c (Objective-C)' },
    { id: 'objective-cpp', label: 'objective-cpp (Objective-C++)' },
    { id: 'ocaml', label: 'ocaml (OCaml)' },
    { id: 'perl', label: 'perl (Perl)' },
    { id: 'php', label: 'php (PHP)' },
    { id: 'plaintext', label: 'plaintext (Plain Text)' },
    { id: 'postcss', label: 'postcss (PostCSS)' },
    { id: 'powershell', label: 'powershell (PowerShell)' },
    { id: 'properties', label: 'properties (Properties)' },
    { id: 'python', label: 'python (Python)' },
    { id: 'r', label: 'r (R)' },
    { id: 'raku', label: 'raku (Raku)' },
    { id: 'razor', label: 'razor (Razor)' },
    { id: 'restructuredtext', label: 'restructuredtext (ReStructured Text)' },
    { id: 'ruby', label: 'ruby (Ruby)' },
    { id: 'rust', label: 'rust (Rust)' },
    { id: 'scss', label: 'scss (SCSS)' },
    { id: 'shaderlab', label: 'shaderlab (ShaderLab)' },
    { id: 'shellscript', label: 'shellscript (Shell Script)' },
    { id: 'snippets', label: 'snippets (Code Snippets)' },
    { id: 'sql', label: 'sql (MS SQL)' },
    { id: 'swift', label: 'swift (Swift)' },
    { id: 'tex', label: 'tex (TeX)' },
    { id: 'typescript', label: 'typescript (TypeScript)' },
    { id: 'typescriptreact', label: 'typescriptreact (TypeScript JSX)' },
    { id: 'vb', label: 'vb (Visual Basic)' },
    { id: 'vue', label: 'vue (Vue)' },
    { id: 'wat', label: 'wat (WebAssembly Text Format)' },
    { id: 'xml', label: 'xml (XML)' },
    { id: 'xsl', label: 'xsl (XSL)' },
    { id: 'yaml', label: 'yaml (YAML)' }
];

/**
 * Escapes special characters in snippet text
 * @param text The raw snippet text
 * @returns Array of escaped lines
 */
function escapeSnippetText(text: string): string[] {
    return text.split('\n').map(line => 
        line
            .replace(/\\/g, '\\\\')  // Escape backslashes
            .replace(/"/g, '\\"')    // Escape quotes
            .replace(/\t/g, '\\t')   // Escape tabs
            .replace(/\r/g, '')      // Remove carriage returns
    );
}

/**
 * Parses a snippets file and returns the parsed content or error
 * @param content Raw file content
 * @returns Object containing parsed snippets or error message
 */
function parseSnippetsFile(content: string): { snippets: SnippetsFile | null, error: string | null } {
    const parseErrors: jsonc.ParseError[] = [];
    try {
        const result = jsonc.parse(content, parseErrors, { allowTrailingComma: true });
        
        if (parseErrors.length > 0) {
            return {
                snippets: null,
                error: formatParseErrors(content, parseErrors)
            };
        }

        return { snippets: result, error: null };
    } catch (error) {
        return {
            snippets: null,
            error: `Fatal parsing error: ${error}`
        };
    }
}

/**
 * Formats parse errors into a readable string
 * @param content Original file content
 * @param parseErrors Array of parse errors
 * @returns Formatted error message
 */
function formatParseErrors(content: string, parseErrors: jsonc.ParseError[]): string {
    const errorDetails = parseErrors.map(error => {
        const lines = content.split('\n');
        const lineIndex = content.slice(0, error.offset).split('\n').length - 1;
        const errorLine = lines[lineIndex];
        
        const lastNewLine = content.lastIndexOf('\n', error.offset);
        const column = lastNewLine === -1 ? error.offset : error.offset - lastNewLine - 1;

        return `Line ${lineIndex + 1}, Column ${column + 1}: ${error.error}\n${errorLine}`;
    }).join('\n');
    
    return `Parsing errors detected:\n${errorDetails}`;
}

/**
 * Determines the programming language for the snippet
 * @param document Current document
 * @returns Selected language ID or null if cancelled
 */
async function determineLanguage(document: vscode.TextDocument): Promise<string | null> {
    // Try current document's language first
    const languageId = document.languageId;
    if (languageId && languageId !== 'plaintext') {
        return languageId;
    }

    // If no language detected, ask user
    const language = await vscode.window.showInputBox({
        prompt: 'Enter the language for your snippet',
        placeHolder: 'e.g., javascript, python, lua',
        value: languageId !== 'plaintext' ? languageId : ''
    });

    return language ? language.toLowerCase() : null;
}

/**
 * Collects snippet information from user input
 * @param document Current document
 * @returns Snippet information or null if cancelled
 */
async function collectSnippetInfo(document: vscode.TextDocument) {
    const snippetName = await vscode.window.showInputBox({
        prompt: 'Enter a name for your snippet',
        placeHolder: 'e.g., My Function'
    });
    if (!snippetName) return null;

    const prefixInput = await vscode.window.showInputBox({
        prompt: 'Enter prefix(es) for your snippet (comma-separated)',
        placeHolder: 'e.g., func, superFunc'
    });
    if (!prefixInput) return null;

    const description = await vscode.window.showInputBox({
        prompt: 'Enter a description for your snippet (optional)',
        placeHolder: 'e.g., A super function that does everything'
    });

    const language = await determineLanguage(document);
    if (!language) return null;

    return {
        name: snippetName,
        prefixes: prefixInput.split(',').map(p => p.trim()).filter(p => p !== ''),
        description: description || snippetName,
        language
    };
}

/**
 * Checks if the user is running VS Code or another VS Code-based editor
 * @returns Information about the editor environment
 */
function getEditorInfo() {
    const isVSCode = vscode.env.appName === 'Visual Studio Code';
    const isCursor = vscode.env.appName.includes('Cursor');
    const appName = vscode.env.appName;
    
    return { isVSCode, isCursor, appName };
}

/**
 * Saves the snippet to the appropriate snippets file
 * @param snippetInfo Information about the snippet
 * @param selectedText The actual snippet content
 */
async function saveSnippet(
    snippetInfo: { name: string; prefixes: string[]; description: string; language: string },
    selectedText: string
): Promise<void> {
    const { isVSCode, isCursor, appName } = getEditorInfo();
    
    // Adjust the snippets path based on the editor
    const baseDir = process.env.APPDATA || process.env.HOME || '';
    const snippetsPath = path.join(
        baseDir,
        isVSCode ? 'Code' : isCursor ? 'Cursor' : appName,
        'User',
        'snippets',
        `${snippetInfo.language}.json`
    );

    // Ensure directories exist
    const snippetsDir = path.dirname(snippetsPath);
    if (!fs.existsSync(snippetsDir)) {
        fs.mkdirSync(snippetsDir, { recursive: true });
    }

    // Read existing snippets or create new file
    let existingContent = '{}';
    if (fs.existsSync(snippetsPath)) {
        existingContent = fs.readFileSync(snippetsPath, 'utf8');
    }

    // Parse existing snippets
    const { snippets, error } = parseSnippetsFile(existingContent);
    if (error) {
        throw new Error(`Error parsing existing snippets: ${error}`);
    }

    // Create new snippet
    const escapedBody = escapeSnippetText(selectedText);
    const newSnippet: SnippetBody = {
        prefix: snippetInfo.prefixes,
        body: escapedBody,
        description: snippetInfo.description
    };

    // Add new snippet to existing ones
    const updatedSnippets = {
        ...(snippets || {}),
        [snippetInfo.name]: newSnippet
    };

    // Write updated snippets back to file
    fs.writeFileSync(
        snippetsPath,
        JSON.stringify(updatedSnippets, null, 2),
        'utf8'
    );
}

export async function activate(context: vscode.ExtensionContext) {
    const createSnippet = vscode.commands.registerCommand('extension.generateSnippet', async () => {
        // Get active editor and selection
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor');
            return;
        }

        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);
        if (!selectedText) {
            vscode.window.showErrorMessage('No text selected');
            return;
        }

        // Collect snippet information from user
        const snippetInfo = await collectSnippetInfo(editor.document);
        if (!snippetInfo) return;

        try {
            await saveSnippet(snippetInfo, selectedText);
            vscode.window.showInformationMessage(`Snippet "${snippetInfo.name}" added successfully!`);
        } catch (error) {
            vscode.window.showErrorMessage(`Error creating snippet: ${error}`);
            console.error('Error details:', error);
        }
    });

    context.subscriptions.push(createSnippet);
}

export function deactivate() {}