export interface headerTitle {
    title: string;
    breadcrumbParts: string[];
    backIconVisible: boolean;
    expected: string;
}

export const homeHeader: headerTitle = {
    // Title intentionally left blank; the home page uses the dynamic
    // "Welcome back, {{ userName }}" line from HeaderWelcome instead.
    title: "",
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

export const editDraftHeader: headerTitle = {
    title: "Edit Draft",
    breadcrumbParts: ['Home', 'Ideas List', 'Edit Draft'],
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

export const adminHomeHeader: headerTitle = {
    title: "ADMIN_HOME PAGE",
    breadcrumbParts: ['Role: Admin'],
    backIconVisible: false,
    expected: 'admin'
};

export const adminManageUsersHeader: headerTitle = {
    title: "ADMIN_MANAGE USERS PAGE",
    breadcrumbParts: ['Manage Users', 'Role: Admin'],
    backIconVisible: false,
    expected: 'admin/users'
};

export const adminEditProductListHeader: headerTitle = {
             title: "",
             breadcrumbParts: [],
             backIconVisible: false,
             expected: 'admin/edit-product-list'
         };

export const headerConfigs = {
    homeHeader,
    addIdeaHeader,
    viewIdeaHeader,
    editDraftHeader,
    myIdeasHeader,
    contactForHelpHeader,
    adminHomeHeader,
    adminManageUsersHeader,
    adminEditProductListHeader
  } as const;
