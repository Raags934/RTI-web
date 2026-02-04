export const menuItems = [
  { label: 'Home', icon: 'home', route: '/', exact: true },
  { label: 'My Ideas', icon: 'description', route: '/myideas' },
  { label: 'Contact for help', icon: 'contact_support', route: '/help' }
];

/** Admin-only sidebar items (used when route is /admin). Does not affect idea or other routes. */
export const adminMenuItems = [
  { label: 'Home', icon: 'home', route: '/admin', exact: true },
  { label: 'Manage User', icon: 'person', route: '/admin/users' },
  { label: 'Manage Groups', icon: 'group', route: '/admin/groups' },
  { label: 'Manage Products List', icon: 'grid_view', route: '/admin/products' },
  { label: 'Manage Dropdown Lists', icon: 'list', route: '/admin/dropdowns' },
  { label: 'Audit History', icon: 'schedule', route: '/admin/audit' },
  { label: 'Snapshot', icon: 'photo_camera', route: '/admin/snapshot' },
  { label: 'Contact for help', icon: 'mail', route: '/help' }
];
