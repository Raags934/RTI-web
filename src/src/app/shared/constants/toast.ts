export interface toast {
    message: string;
    visible: boolean;
    type?: 'success' | 'error';
}

export const createIdeaToast: toast = {
    message: "Idea {{idea_id}} created successfully!",
    visible: false,
    type: 'success',
}