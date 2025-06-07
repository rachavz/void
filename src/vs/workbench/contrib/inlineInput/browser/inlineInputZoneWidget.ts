/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as dom from '../../../../base/browser/dom.js';
import { ICodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { ZoneWidget } from '../../../../editor/contrib/zoneWidget/browser/zoneWidget.js';
import { Range } from '../../../../editor/common/core/range.js';
import { IPosition } from '../../../../editor/common/core/position.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { inputBackground, inputForeground, inputBorder, focusBorder } from '../../../../platform/theme/common/colorRegistry.js';
import { Event, Emitter } from '../../../../base/common/event.js';
import { KeyCode } from '../../../../base/common/keyCodes.js';
import { StandardKeyboardEvent } from '../../../../base/browser/keyboardEvent.js';

export class InlineInputZoneWidget extends ZoneWidget {

	private _inputElement: HTMLInputElement | undefined;
	private _container: HTMLElement | undefined;
	private readonly _onDidSubmit = this._disposables.add(new Emitter<string>());
	private readonly _onDidCancel = this._disposables.add(new Emitter<void>());

	readonly onDidSubmit: Event<string> = this._onDidSubmit.event;
	readonly onDidCancel: Event<void> = this._onDidCancel.event;

	constructor(
		editor: ICodeEditor,
		@IThemeService private readonly _themeService: IThemeService
	) {
		super(editor, { showFrame: true, showArrow: true, frameWidth: 1, isAccessible: true });
		this._disposables.add(this._themeService.onDidColorThemeChange(this._applyTheme, this));
	}

	protected override _fillContainer(container: HTMLElement): void {
		this._container = container;

		// Create the input container
		const inputContainer = dom.append(container, dom.$('.inline-input-container'));

		// Create the input element
		this._inputElement = dom.append(inputContainer, dom.$('input.inline-input')) as HTMLInputElement;
		this._inputElement.placeholder = 'Enter text...';
		this._inputElement.type = 'text';

		// Handle keyboard events
		this._disposables.add(dom.addDisposableListener(this._inputElement, 'keydown', (e: KeyboardEvent) => {
			const event = new StandardKeyboardEvent(e);

			if (event.keyCode === KeyCode.Enter) {
				e.preventDefault();
				e.stopPropagation();
				this._submit();
			} else if (event.keyCode === KeyCode.Escape) {
				e.preventDefault();
				e.stopPropagation();
				this._cancel();
			}
		}));

		// Apply initial theme
		this._applyTheme();
	}

	private _applyTheme(): void {
		if (!this._inputElement || !this._container) {
			return;
		}

		const theme = this._themeService.getColorTheme();

		// Apply input styling
		this._inputElement.style.backgroundColor = theme.getColor(inputBackground)?.toString() || '';
		this._inputElement.style.color = theme.getColor(inputForeground)?.toString() || '';
		this._inputElement.style.border = `1px solid ${theme.getColor(inputBorder)?.toString() || 'transparent'}`;

		// Apply focus styling
		const focusColor = theme.getColor(focusBorder)?.toString();
		if (focusColor) {
			this._inputElement.style.setProperty('--focus-border-color', focusColor);
		}
	}

	private _submit(): void {
		if (this._inputElement) {
			const value = this._inputElement.value.trim();
			this._onDidSubmit.fire(value);
			this.hide();
		}
	}

	private _cancel(): void {
		this._onDidCancel.fire();
		this.hide();
	}

	showAt(position: IPosition, placeholder?: string): void {
		if (this._inputElement && placeholder) {
			this._inputElement.placeholder = placeholder;
		}

		const range = Range.fromPositions(position);
		this.show(range, 2); // Height of 2 lines

		// Focus the input element
		if (this._inputElement) {
			this._inputElement.focus();
			this._inputElement.select();
		}
	}

	getValue(): string {
		return this._inputElement?.value || '';
	}

	setValue(value: string): void {
		if (this._inputElement) {
			this._inputElement.value = value;
		}
	}

	override hide(): void {
		super.hide();
		if (this._inputElement) {
			this._inputElement.value = '';
		}
	}
}
