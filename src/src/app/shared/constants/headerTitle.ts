export interface headerTitle {
    title: string;
    breadcrumbParts: string[];
    backIconVisible: boolean;
    expected: string;
}

export const homeHeader: headerTitle = {
    title: "Welcome Back, ",
    breadcrumbParts: [],
    backIconVisible: false,
    expected: ''
};

export const addIdeaHeader: headerTitle = {
    title: "Create New Idea",
    breadcrumbParts: ['Home', 'Create New Idea'],
    backIconVisible: true,
    expected: 'addidea'
};

export const viewIdeaHeader: headerTitle = {
    title: "View Idea Details",
    breadcrumbParts: ['Home', 'More option','CL001','View Idea Details'],
    backIconVisible: true,
    expected: 'ideas'
};

export const myIdeasHeader: headerTitle = {
    title: "My Ideas",
    breadcrumbParts: ['Home', 'My Ideas'],
    backIconVisible: true,
    expected: 'myideas'
};

export const contactForHelpHeader: headerTitle = {
    title: "Contact For Help",
    breadcrumbParts: ['Home', 'Contact For Help'],
    backIconVisible: true,
    expected: 'help'
};

export const headerConfigs = {
    homeHeader,
    addIdeaHeader,
    viewIdeaHeader,
    myIdeasHeader,
    contactForHelpHeader
  } as const;
