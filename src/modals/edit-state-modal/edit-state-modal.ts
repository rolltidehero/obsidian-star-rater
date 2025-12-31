import { StateSettingsModalBase } from "src/modals/state-settings-modal-base/state-settings-modal-base";
import { StateSettings } from "src/types/types-map";

/////////
/////////

interface EditStateModalProps {
	stateSettings: StateSettings,
	onSuccess: (modifiedStateSettings: StateSettings) => {},
	onReject?: (reason: string) => {},
}

export class EditStateModal extends StateSettingsModalBase {
	constructor(props: EditStateModalProps) {
		super({
			title: 'Edit rating level',
			introText: 'Note: Editing the rating level\'s name won\'t update existing notes with that rating.',
			actionButtonLabel: 'Save rating level',
			stateSettings: props.stateSettings,
			onSuccess: props.onSuccess,
			onReject: props.onReject
		});
	}
}

