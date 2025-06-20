import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider('zzlang', {
            provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
                const edits: vscode.TextEdit[] = [];

                let indentLevel = 0;
                let insideNamespace = false;

                for (let i = 0; i < document.lineCount; i++) {
                    const line = document.lineAt(i);
                    const trimmed = line.text.trim();

                    // Skip empty lines
                    if (trimmed.length === 0) continue;

                    // Adjust indent level before processing line
                    if (trimmed.startsWith("}")) {
                        indentLevel = Math.max(0, indentLevel - 1);
                    }

                    // Determine indent
                    let currentIndent = indentLevel;

                    // Namespace indentation: indent all
                    if (insideNamespace) {
                        currentIndent += 1;
                    }

                    // Access modifier offset (if you had access modifiers in zlang)
                    if (/^(public|private|protected):/.test(trimmed)) {
                        currentIndent = Math.max(0, currentIndent - 1); // AccessModifierOffset -4 (1 indent level back)
                    }

                    // Apply indentation
                    const newIndent = ' '.repeat(currentIndent * 4); // IndentWidth: 4
                    if (!line.text.startsWith(newIndent) || line.text.trim() !== trimmed) {
                        edits.push(vscode.TextEdit.replace(line.range, newIndent + trimmed));
                    }

                    // Handle braces for indent level
                    if (trimmed.endsWith("{")) {
                        indentLevel++;
                    }

                    // Track namespace
                    if (/^namespace\b/.test(trimmed)) {
                        insideNamespace = true;
                    }
                    if (trimmed === "}") {
                        insideNamespace = false; // crude, could refine with stack if needed
                    }

                    // Could implement: AllowShortIfStatementsOnASingleLine: false → force line breaks
                    // This would require parsing the line to detect short ifs, non-trivial in regex
                }

                return edits;
            }
        })
    );
}

export function deactivate() {}
