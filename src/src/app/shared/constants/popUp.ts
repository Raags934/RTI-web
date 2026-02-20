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
  showConfirmButton?: boolean;
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

export const submitRankingConfirmTwo: Popup = {
  open: false,
  title: 'Are you sure you want to submit the overall ranking for the funding phase?',
  helper: 'Verify all the details before submission.',
  cancelText: 'No',
  confirmText: 'Yes',
  size: 'large',
  confirmPopupAction: 'confirmSubmitRanking'
};

export const rankAtLeast10Ideas: Popup = {
  open: false,
  title: 'Cannot submit',
  helper: 'Rank at least 10 ideas.',
  cancelText: '',
  confirmText: 'Close',
  size: 'small',
  confirmPopupAction: 'closePopUp',
  showCancelButton: false
};

export const completeAllRanking: Popup = {
  open: false,
  title: 'Cannot submit',
  helper: 'Complete all ranking before submission.',
  cancelText: '',
  confirmText: 'Close',
  size: 'small',
  confirmPopupAction: 'closePopUp',
  showCancelButton: false
};

export const abandonIdea: Popup = {
  open: false,
  title: 'Abandon this idea',
  helper: 'Please provide a reason before abandoning',
  cancelText: 'Cancel',
  confirmText: 'Abandon Idea',
  size: 'medium',
  confirmPopupAction: 'abandonIdea'
};

export const needMoreInfo: Popup = {
  open: false,
  title: 'Need More Information',
  helper: 'provide more information to continue the process',
  cancelText: 'Cancel',
  confirmText: 'Send it back',
  size: 'medium',
  confirmPopupAction: 'needMoreInfo'
};

export const assessIdea: Popup = {
  open: false,
  title: 'Assess this idea',
  helper: 'Review all details before submitting for evaluation',
  cancelText: 'Cancel',
  confirmText: 'Submit Idea',
  size: 'large',
  confirmPopupAction: 'assessIdea'
};

export const submitToHarmonization: Popup = {
  open: false,
  title: 'Are you sure you want to move this idea to harmonization phase?',
  helper: 'Verify idea details before submission.',
  cancelText: 'No',
  confirmText: 'Yes',
  size: 'medium',
  confirmPopupAction: 'submitToHarmonization'
};

export const enterStudyDetails: Popup = {
  open: false,
  title: '',
  helper: '',
  cancelText: '',
  confirmText: 'Submit Study Details',
  size: 'large',
  confirmPopupAction: 'enterStudyDetails',
  showCancelButton: false,
  showConfirmButton: false
};

export const submitStudyDetailsConfirmation: Popup = {
  open: false,
  title: 'Are you sure you want to submit this idea for the final harmonization phase?',
  helper: 'Verify idea and study details before submission.',
  cancelText: 'No',
  confirmText: 'Yes',
  size: 'medium',
  confirmPopupAction: 'submitStudyDetailsConfirmation'
};

export const approveIdea: Popup = {
  open: false,
  title: 'Approve this idea?',
  helper: 'Confirm to approve the idea.',
  cancelText: 'No',
  confirmText: 'Yes',
  size: 'medium',
  confirmPopupAction: 'approveIdea'
};

export const PopupConfigs = {
  submitIdea,
  cancelIdea,
  draftIdea,
  approveIdea,
  rankingSaved,
  submitRankingConfirm,
  submitRankingConfirmTwo,
  rankAtLeast10Ideas,
  completeAllRanking,
  abandonIdea,
  needMoreInfo,
  assessIdea,
  submitToHarmonization,
  enterStudyDetails,
  submitStudyDetailsConfirmation,
} as const;

