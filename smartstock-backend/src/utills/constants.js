module.exports = {
  USER_ROLES: {
    ADMINISTRATOR: 'admin',
    INVENTORY_MANAGER: 'inventory_manager',
    SALES_STAFF: 'sales_staff',
    RESOURCE_MANAGER: 'resource_manager',
  },

  ORDER_STATUS: {
    DRAFT: 'draft',
    CONFIRMED: 'confirmed',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
  },

  PURCHASE_ORDER_STATUS: {
    DRAFT: 'draft',
    SENT: 'sent',
    CONFIRMED: 'confirmed',
    RECEIVED: 'received',
    CANCELLED: 'cancelled',
  },

  INVOICE_STATUS: {
    PENDING: 'pending',
    PAID: 'paid',
    OVERDUE: 'overdue',
    CANCELLED: 'cancelled',
  },

  CONTACT_TYPES: {
    EMAIL: 'email',
    PHONE: 'phone',
    MOBILE: 'mobile',
    FAX: 'fax',
  },

  ADDRESS_TYPES: {
    BILLING: 'billing',
    SHIPPING: 'shipping',
    HEAD_OFFICE: 'head_office',
    HOME: 'home',
    WORK: 'work',
  },
};