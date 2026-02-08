{ 
  "table": "subscriptions",
  "description": "Master table defining subscription plans and feature limits for the MenuX SaaS platform",
  "columns": {
    "id": {
      "type": "bigint",
      "primary_key": true,
      "description": "Unique identifier for the subscription plan"
    },
    "name": {
      "type": "string",
      "required": true,
      "description": "Human-readable plan name (e.g. Free, Basic, Pro)"
    },
    "price_monthly": {
      "type": "number",
      "nullable": true,
      "description": "Monthly price for the subscription plan"
    },
    "price_yearly": {
      "type": "number",
      "nullable": true,
      "description": "Yearly price for the subscription plan"
    },
    "max_tables": {
      "type": "number",
      "description": "Maximum number of tables a restaurant can create"
    },
    "max_menu_items": {
      "type": "number",
      "description": "Maximum number of menu items allowed"
    },
    "max_admins": {
      "type": "number",
      "description": "Maximum number of admin/manager users allowed"
    },
    "allow_custom_domain": {
      "type": "boolean",
      "description": "Whether the restaurant can use a custom domain"
    },
    "allow_qr_download": {
      "type": "boolean",
      "description": "Whether QR codes can be downloaded"
    },
    "allow_theme_customization": {
      "type": "boolean",
      "description": "Whether theme customization is enabled"
    },
    "allow_analytics": {
      "type": "boolean",
      "description": "Whether analytics dashboard is enabled"
    },
    "allow_online_orders": {
      "type": "boolean",
      "description": "Whether online ordering is enabled"
    },
    "features": {
      "type": "json",
      "nullable": true,
      "description": "Additional feature flags or descriptive feature list"
    },
    "is_active": {
      "type": "boolean",
      "default": true,
      "description": "Whether this subscription plan is currently available"
    },
    "created_at": {
      "type": "timestamp",
      "auto_generated": true,
      "description": "Timestamp when the subscription was created"
    },
    "updated_at": {
      "type": "timestamp",
      "auto_generated": true,
      "description": "Timestamp when the subscription was last updated"
    }
  }
}
