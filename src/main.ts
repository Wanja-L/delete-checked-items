import { Editor, MarkdownView, Plugin } from 'obsidian';

// Remember to rename these classes and interfaces!

export default class DeleteCheckedItems extends Plugin {

	onload() {
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'run',
			name: 'Run',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.deleteCheckedItems(editor)
			}
		});

		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, _editor, view) => {
				const activeMDView = this.app.workspace.getActiveViewOfType(MarkdownView);

				// only make this option available in markdown files
				if (activeMDView) {
					menu.addItem((item) => {
						item
							.setTitle('Delete checked items')
							.setIcon('square-x')
							.onClick(() => {
								this.deleteCheckedItems(activeMDView.editor)
							});
					});
				}


			})
		);
	}

	deleteCheckedItems(editor: Editor) {
		// select all because Editor.processLines only operates on the current selection
		editor.setSelection({ ch: 0, line: 0 }, { ch: 0, line: editor.lineCount() })

		editor.processLines(
			// Check if line contains a checked item
			(_lineNum, lineText) => {
				return !!lineText.match(/\s*- \[x\].*/)
			},
			// Delete matched lines
			(lineNum, _lineText, shouldDelete) => {
				if (shouldDelete) {
					// Return empty text to delete the line
					return {
						from: { line: lineNum, ch: 0 },
						to: { line: lineNum + 1, ch: 0 },  // Include newline
						text: ''
					};
				}
				return undefined;  // Keep line unchanged
			},
			true
		);

		// reset cursor to cancel the selection
		editor.setCursor(editor.lineCount())
	}

}
