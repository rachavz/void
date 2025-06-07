/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { KeyCode, KeyMod } from '../../../../base/common/keyCodes.js';
import { ICodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { EditorAction, registerEditorAction, ServicesAccessor } from '../../../../editor/browser/editorExtensions.js';
import { EditorContextKeys } from '../../../../editor/common/editorContextKeys.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { InlineInputZoneWidget } from './inlineInputZoneWidget.js';
import { KeybindingWeight } from '../../../../platform/keybinding/common/keybindingsRegistry.js';
import { localize } from '../../../../nls.js';

export class ShowInlineInputAction extends EditorAction {

	public static readonly ID = 'editor.action.showInlineInput';

	constructor() {
		super({
			id: ShowInlineInputAction.ID,
			label: localize('showInlineInput.label', "Show Inline Input"),
			alias: 'Show Inline Input',
			precondition: EditorContextKeys.writable,
			kbOpts: {
				kbExpr: EditorContextKeys.editorTextFocus,
				primary: KeyMod.CtrlCmd | KeyCode.KeyK,
				weight: KeybindingWeight.EditorContrib
			}
		});
	}

	public async run(accessor: ServicesAccessor, editor: ICodeEditor): Promise<void> {
		if (!editor.hasModel()) {
			return;
		}

		const themeService = accessor.get(IThemeService);
		const position = editor.getPosition();

		if (!position) {
			return;
		}

		// Create and show the inline input widget
		const widget = new InlineInputZoneWidget(editor, themeService);

		// Handle input submission
		const disposable = widget.onDidSubmit((value) => {
			if (value) {
				// Insert the text at the current position
				editor.executeEdits('inline-input', [{
					range: {
						startLineNumber: position.lineNumber,
						startColumn: position.column,
						endLineNumber: position.lineNumber,
						endColumn: position.column
					},
					text: value
				}]);
			}
			widget.dispose();
			disposable.dispose();
		});

		// Handle cancellation
		const cancelDisposable = widget.onDidCancel(() => {
			widget.dispose();
			disposable.dispose();
			cancelDisposable.dispose();
		});

		// Show the widget at the current position
		widget.showAt(position, 'Enter text to insert...');
	}
}

// Register the action
registerEditorAction(ShowInlineInputAction);
