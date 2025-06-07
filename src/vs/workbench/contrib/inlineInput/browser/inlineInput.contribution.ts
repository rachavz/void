/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import 'vs/css!./media/inlineInput';
import './inlineInputActions';

import { Disposable } from '../../../../base/common/lifecycle.js';
import { IWorkbenchContribution, registerWorkbenchContribution2, WorkbenchPhase } from '../../../common/contributions.js';

export class InlineInputContribution extends Disposable implements IWorkbenchContribution {

	static readonly ID = 'workbench.contrib.inlineInput';

	constructor() {
		super();
		// The action registration is handled by importing inlineInputActions
	}
}

// Register the contribution
registerWorkbenchContribution2(InlineInputContribution.ID, InlineInputContribution, WorkbenchPhase.BlockRestore);
