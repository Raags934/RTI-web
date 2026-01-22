import { IdeaEvent } from "../../events/ideaServiceEvents";

export interface Popup {
  open: boolean;
  title: string;
  helper: string;
  cancelText: string;
  confirmText: string;
  size: 'small' | 'medium' | 'large';
  confirmPopupAction: IdeaEvent['type'];
  showCancelButton?: boolean;
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

export const rankingSaved: Popup = {
  open: false,
  title: 'Ranking saved!',
  helper: 'You can review or update it anytime before final submission.',
  cancelText: '',
  confirmText: 'Close',
  size: 'small',
  confirmPopupAction: 'closePopUp',
  showCancelButton: false
};

export const submitRankingConfirm: Popup = {
  open: false,
  title: 'Are you sure you want to baseline and submit these idea for TA level prioritization within a franchise?',
  helper: 'Verify all the details before submission.',
  cancelText: 'No',
  confirmText: 'Yes',
  size: 'large',
  confirmPopupAction: 'confirmSubmitRanking'
};


export const PopupConfigs = {
  submitIdea,
  cancelIdea,
  draftIdea,
  rankingSaved,
  submitRankingConfirm,
} as const;

