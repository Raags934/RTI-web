import { IdeaEvent } from "../../events/ideaServiceEvents";

export interface Popup {
  open: boolean;
  title: string;
  helper: string;
  cancelText: string;
  confirmText: string;
  size: 'small' | 'medium' | 'large';
  confirmPopupAction: IdeaEvent['type']
}


export const submitIdea: Popup = {
  open: false,
  title: 'Are you sure you want to submit this idea for confirmation phase?',
  helper: 'Verify details before submitting your idea.',
  cancelText: 'No',
  confirmText: 'Yes',
  size: 'medium',
  confirmPopupAction: 'submitIdea'
};
export const cancelIdea: Popup = {
  open: false,
  title: 'Are you sure you want to cancel this idea?',
  helper: 'Your changes will not be saved if you cancel.',
  cancelText: 'No',
  confirmText: 'Yes',
  size: 'medium',
  confirmPopupAction: 'cancelIdea'
};

export const draftIdea: Popup = {
  open: false,
  title: 'Do you want to save this idea as a draft?',
  helper: 'You can continue editing it later before final submission.',
  cancelText: 'No',
  confirmText: 'Yes',
  size: 'medium',
  confirmPopupAction: 'saveDraft'
};


export const PopupConfigs = {
  submitIdea,
  cancelIdea,
  draftIdea,
} as const;

