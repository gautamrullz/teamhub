export type UserRole = "OWNER" | "ADMIN" | "STAFF";

export type Permission =
  | "DASHBOARD_VIEW"
  | "PRODUCT_VIEW"
  | "PRODUCT_CREATE"
  | "PRODUCT_UPDATE"
  | "PRODUCT_DISCONTINUE"
  | "INVENTORY_VIEW"
  | "INVENTORY_MANAGE"
  | "SALE_CREATE"
  | "PURCHASE_CREATE"
  | "REPORT_VIEW"
  | "USER_VIEW"
  | "USER_CREATE"
  | "USER_UPDATE"
  | "USER_DELETE"
  | "ORGANIZATION_SETTINGS";

const permissions: Record<UserRole, readonly Permission[]> = {
  OWNER: [
    "DASHBOARD_VIEW",
    "PRODUCT_VIEW",
    "PRODUCT_CREATE",
    "PRODUCT_UPDATE",
    "PRODUCT_DISCONTINUE",
    "INVENTORY_VIEW",
    "INVENTORY_MANAGE",
    "SALE_CREATE",
    "PURCHASE_CREATE",
    "REPORT_VIEW",
    "USER_VIEW",
    "USER_CREATE",
    "USER_UPDATE",
    "USER_DELETE",
    "ORGANIZATION_SETTINGS",
  ],

  ADMIN: [
    "DASHBOARD_VIEW",
    "PRODUCT_VIEW",
    "PRODUCT_CREATE",
    "PRODUCT_UPDATE",
    "PRODUCT_DISCONTINUE",
    "INVENTORY_VIEW",
    "INVENTORY_MANAGE",
    "SALE_CREATE",
    "PURCHASE_CREATE",
    "REPORT_VIEW",
  ],

  STAFF: [
    "DASHBOARD_VIEW",
    "PRODUCT_VIEW",
    "INVENTORY_VIEW",
    "INVENTORY_MANAGE",
    "SALE_CREATE",
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return permissions[role].includes(permission);
}
