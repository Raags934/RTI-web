export interface toast {
    message: string;
    visible: boolean;
}

export const createIdeaToast: toast = {
    message: "Idea {{idea_id}} created successfully!",
    visible:false,
}