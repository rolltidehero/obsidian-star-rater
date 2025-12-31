import { StateSettingsModalBase } from "src/modals/state-settings-modal-base/state-settings-modal-base";
import { StateSettings } from "src/types/types-map";

interface NewVisibleStateModalProps {
	onSuccess: (newStateSettings: StateSettings) => {},
	onReject?: (reason: string) => {},
}

export class NewVisibleStateModal extends StateSettingsModalBase {
	constructor(props: NewVisibleStateModalProps) {
		super({
			title: 'Create new rating level',
			introText: 'Create a new star rating level to categorize your notes.',
			actionButtonLabel: 'Create rating level',
			onSuccess: props.onSuccess,
			onReject: props.onReject,
		});
	}
} 