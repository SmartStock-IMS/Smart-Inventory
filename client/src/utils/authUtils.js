/**
 * Get the appropriate dashboard URL based on user role
 * @param {string} userRole - The user's role/type
 * @returns {string} - The dashboard URL for the user's role
 */
export const getDashboardUrl = (userRole) => {
  const roleMapping = {
    'admin': '/administrator',
    'inventory_manager': '/inventorymanager',
    'sales_staff': '/sales',
    'sales_rep': '/sales',
    'resource_manager': '/resourcemanager'
  };

  return roleMapping[userRole] || '/sales';
};

/**
 * Check if a user has permission to access a specific route
 * @param {string} userRole - The user's role/type
 * @param {string[]} allowedRoles - Array of roles allowed to access the route
 * @returns {boolean} - Whether the user has permission
 */
export const hasRoutePermission = (userRole, allowedRoles) => {
  return allowedRoles.includes(userRole);
};

/**
 * Get user-friendly role name
 * @param {string} userRole - The user's role/type
 * @returns {string} - User-friendly role name
 */
export const getRoleName = (userRole) => {
  const roleNames = {
    'admin': 'Administrator',
    'inventory_manager': 'Inventory Manager',
    'sales_staff': 'Sales Staff',
    'sales_rep': 'Sales Representative',
    'resource_manager': 'Resource Manager'
  };

  return roleNames[userRole] || userRole;
};