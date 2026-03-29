/**
 * ============================================================
 *  COMPREHENSIVE DATABASE VERIFICATION & AUTO-FIX SCRIPT
 *  Checks ALL entity columns against Railway PostgreSQL DB
 * ============================================================
 */

const { Client } = require('pg');

const DB_CONFIG = {
  host: '66.33.22.240',
  port: 45505,
  user: 'postgres',
  password: 'RvkwtnMaGpHpXnkqniMeDvRBOKAxihdI',
  database: 'railway',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 30000,
};

// ──────────────────────────────────────────────────────────────
//  EXPECTED SCHEMA — derived from all entity files
// ──────────────────────────────────────────────────────────────
const EXPECTED_SCHEMA = {
  users: [
    { column: 'id',                   type: 'uuid',        nullable: false },
    { column: 'password',             type: 'character varying', nullable: true },
    { column: 'email',                type: 'character varying', nullable: false },
    { column: 'phone',                type: 'character varying', nullable: true },
    { column: 'full_name',            type: 'character varying', nullable: false },
    { column: 'avatar_url',           type: 'text',        nullable: true },
    { column: 'role',                 type: 'USER-DEFINED', nullable: false },
    { column: 'is_active',            type: 'boolean',     nullable: false },
    { column: 'is_email_verified',    type: 'boolean',     nullable: false },
    { column: 'is_phone_verified',    type: 'boolean',     nullable: false },
    { column: 'is_online',            type: 'boolean',     nullable: false },
    { column: 'city',                 type: 'character varying', nullable: true },
    { column: 'state',                type: 'character varying', nullable: true },
    { column: 'country',              type: 'character varying', nullable: true },
    { column: 'google_id',            type: 'character varying', nullable: true },
    { column: 'provider',             type: 'character varying', nullable: true },
    { column: 'device_token',         type: 'text',        nullable: true },
    { column: 'push_subscriptions',   type: 'jsonb',       nullable: true },
    { column: 'last_login_at',        type: 'timestamp without time zone', nullable: true },
    { column: 'last_logout_at',       type: 'timestamp without time zone', nullable: true },
    { column: 'last_active_at',       type: 'timestamp without time zone', nullable: true },
    { column: 'created_at',           type: 'timestamp without time zone', nullable: false },
    { column: 'updated_at',           type: 'timestamp without time zone', nullable: false },
  ],
  vendors: [
    { column: 'id',                      type: 'uuid', nullable: false },
    { column: 'user_id',                 type: 'uuid', nullable: false },
    { column: 'business_name',           type: 'character varying', nullable: true },
    { column: 'stripe_customer_id',      type: 'character varying', nullable: true },
    { column: 'bio',                     type: 'text', nullable: true },
    { column: 'business_email',          type: 'character varying', nullable: true },
    { column: 'business_phone',          type: 'character varying', nullable: true },
    { column: 'business_address',        type: 'text', nullable: true },
    { column: 'gst_number',              type: 'character varying', nullable: true },
    { column: 'ntn_number',              type: 'character varying', nullable: true },
    { column: 'is_verified',             type: 'boolean', nullable: false },
    { column: 'verification_documents',  type: 'jsonb', nullable: true },
    { column: 'business_hours',          type: 'jsonb', nullable: true },
    { column: 'social_links',            type: 'jsonb', nullable: true },
    { column: 'created_at',              type: 'timestamp without time zone', nullable: false },
    { column: 'updated_at',              type: 'timestamp without time zone', nullable: false },
  ],
  businesses: [
    { column: 'id',                   type: 'uuid', nullable: false },
    { column: 'vendor_id',            type: 'uuid', nullable: false },
    { column: 'category_id',          type: 'uuid', nullable: true },
    { column: 'suggested_category_name', type: 'text', nullable: true },
    { column: 'name',                 type: 'character varying', nullable: false },
    { column: 'slug',                 type: 'character varying', nullable: false },
    { column: 'description',          type: 'text', nullable: true },
    { column: 'short_description',    type: 'character varying', nullable: true },
    { column: 'email',                type: 'character varying', nullable: true },
    { column: 'phone',                type: 'character varying', nullable: false },
    { column: 'whatsapp',             type: 'character varying', nullable: true },
    { column: 'website',              type: 'character varying', nullable: true },
    { column: 'address',              type: 'text', nullable: false },
    { column: 'city',                 type: 'character varying', nullable: true },
    { column: 'state',                type: 'character varying', nullable: true },
    { column: 'country',              type: 'character varying', nullable: true },
    { column: 'pincode',              type: 'character varying', nullable: true },
    { column: 'latitude',             type: 'numeric', nullable: true },
    { column: 'longitude',            type: 'numeric', nullable: true },
    { column: 'logo_url',             type: 'text', nullable: true },
    { column: 'cover_image_url',      type: 'text', nullable: true },
    { column: 'images',               type: 'jsonb', nullable: false },
    { column: 'videos',               type: 'jsonb', nullable: false },
    { column: 'year_established',     type: 'integer', nullable: true },
    { column: 'employee_count',       type: 'character varying', nullable: true },
    { column: 'price_range',          type: 'character varying', nullable: true },
    { column: 'status',               type: 'USER-DEFINED', nullable: false },
    { column: 'is_verified',          type: 'boolean', nullable: false },
    { column: 'is_featured',          type: 'boolean', nullable: false },
    { column: 'is_sponsored',         type: 'boolean', nullable: false },
    { column: 'average_rating',       type: 'numeric', nullable: false },
    { column: 'total_reviews',        type: 'integer', nullable: false },
    { column: 'total_views',          type: 'integer', nullable: false },
    { column: 'total_leads',          type: 'integer', nullable: false },
    { column: 'followers_count',      type: 'integer', nullable: false },
    { column: 'meta_title',           type: 'character varying', nullable: true },
    { column: 'meta_description',     type: 'text', nullable: true },
    { column: 'meta_keywords',        type: 'text', nullable: true },
    { column: 'search_keywords',      type: 'jsonb', nullable: false },
    { column: 'approved_at',          type: 'timestamp without time zone', nullable: true },
    { column: 'rejected_at',          type: 'timestamp without time zone', nullable: true },
    { column: 'rejection_reason',     type: 'text', nullable: true },
    { column: 'has_offer',            type: 'boolean', nullable: false },
    { column: 'offer_title',          type: 'character varying', nullable: true },
    { column: 'offer_description',    type: 'text', nullable: true },
    { column: 'offer_badge',          type: 'character varying', nullable: true },
    { column: 'offer_expires_at',     type: 'timestamp without time zone', nullable: true },
    { column: 'offer_banner_url',     type: 'text', nullable: true },
    { column: 'faqs',                 type: 'jsonb', nullable: false },
    { column: 'created_at',           type: 'timestamp without time zone', nullable: false },
    { column: 'updated_at',           type: 'timestamp without time zone', nullable: false },
  ],
  subscription_plans: [
    { column: 'id',               type: 'uuid', nullable: false },
    { column: 'name',             type: 'character varying', nullable: false },
    { column: 'plan_type',        type: 'USER-DEFINED', nullable: false },
    { column: 'description',      type: 'text', nullable: true },
    { column: 'price',            type: 'numeric', nullable: false },
    { column: 'billing_cycle',    type: 'character varying', nullable: false },
    { column: 'max_listings',     type: 'integer', nullable: false },
    { column: 'stripe_price_id',  type: 'character varying', nullable: true },
    { column: 'is_featured',      type: 'boolean', nullable: false },
    { column: 'dashboard_features', type: 'jsonb', nullable: false },
    { column: 'is_active',        type: 'boolean', nullable: false },
    { column: 'created_at',       type: 'timestamp without time zone', nullable: false },
    { column: 'updated_at',       type: 'timestamp without time zone', nullable: false },
  ],
  subscriptions: [
    { column: 'id',               type: 'uuid', nullable: false },
    { column: 'vendor_id',        type: 'uuid', nullable: false },
    { column: 'plan_id',          type: 'uuid', nullable: false },
    { column: 'status',           type: 'USER-DEFINED', nullable: false },
    { column: 'start_date',       type: 'timestamp without time zone', nullable: false },
    { column: 'end_date',         type: 'timestamp without time zone', nullable: true },
    { column: 'stripe_subscription_id', type: 'character varying', nullable: true },
    { column: 'stripe_session_id', type: 'character varying', nullable: true },
    { column: 'auto_renew',       type: 'boolean', nullable: false },
    { column: 'created_at',       type: 'timestamp without time zone', nullable: false },
    { column: 'updated_at',       type: 'timestamp without time zone', nullable: false },
  ],
  pricing_plans: [
    { column: 'id',             type: 'uuid', nullable: false },
    { column: 'name',           type: 'character varying', nullable: false },
    { column: 'description',    type: 'text', nullable: true },
    { column: 'type',           type: 'USER-DEFINED', nullable: false },
    { column: 'price',          type: 'numeric', nullable: false },
    { column: 'duration',       type: 'integer', nullable: false },
    { column: 'unit',           type: 'USER-DEFINED', nullable: false },
    { column: 'stripe_price_id', type: 'character varying', nullable: true },
    { column: 'features',       type: 'jsonb', nullable: true },
    { column: 'is_active',      type: 'boolean', nullable: false },
    { column: 'created_at',     type: 'timestamp without time zone', nullable: false },
    { column: 'updated_at',     type: 'timestamp without time zone', nullable: false },
  ],
  active_plans: [
    { column: 'id',             type: 'uuid', nullable: false },
    { column: 'vendor_id',      type: 'uuid', nullable: false },
    { column: 'plan_id',        type: 'uuid', nullable: false },
    { column: 'target_id',      type: 'uuid', nullable: true },
    { column: 'status',         type: 'USER-DEFINED', nullable: false },
    { column: 'start_date',     type: 'timestamp without time zone', nullable: false },
    { column: 'end_date',       type: 'timestamp without time zone', nullable: false },
    { column: 'amount_paid',    type: 'numeric', nullable: true },
    { column: 'transaction_id', type: 'character varying', nullable: true },
    { column: 'created_at',     type: 'timestamp without time zone', nullable: false },
    { column: 'updated_at',     type: 'timestamp without time zone', nullable: false },
  ],
  offer_events: [
    { column: 'id',            type: 'uuid', nullable: false },
    { column: 'vendor_id',     type: 'uuid', nullable: false },
    { column: 'business_id',   type: 'uuid', nullable: false },
    { column: 'title',         type: 'character varying', nullable: false },
    { column: 'description',   type: 'text', nullable: true },
    { column: 'type',          type: 'USER-DEFINED', nullable: false },
    { column: 'offer_badge',   type: 'character varying', nullable: true },
    { column: 'image_url',     type: 'character varying', nullable: true },
    { column: 'start_date',    type: 'timestamp without time zone', nullable: true },
    { column: 'end_date',      type: 'timestamp without time zone', nullable: true },
    { column: 'expiry_date',   type: 'timestamp without time zone', nullable: true },
    { column: 'status',        type: 'USER-DEFINED', nullable: false },
    { column: 'is_active',     type: 'boolean', nullable: false },
    { column: 'is_featured',   type: 'boolean', nullable: false },
    { column: 'featured_until', type: 'timestamp without time zone', nullable: true },
    { column: 'highlights',    type: 'jsonb', nullable: true },
    { column: 'terms',         type: 'jsonb', nullable: true },
    { column: 'pricing_id',    type: 'uuid', nullable: true },
    { column: 'created_at',    type: 'timestamp without time zone', nullable: false },
    { column: 'updated_at',    type: 'timestamp without time zone', nullable: false },
  ],
  offer_event_pricing: [
    { column: 'id',        type: 'uuid', nullable: false },
    { column: 'type',      type: 'USER-DEFINED', nullable: false },
    { column: 'name',      type: 'character varying', nullable: false },
    { column: 'price',     type: 'numeric', nullable: false },
    { column: 'unit',      type: 'USER-DEFINED', nullable: false },
    { column: 'duration',  type: 'integer', nullable: false },
    { column: 'is_active', type: 'boolean', nullable: false },
    { column: 'created_at', type: 'timestamp without time zone', nullable: false },
    { column: 'updated_at', type: 'timestamp without time zone', nullable: false },
  ],
  leads: [
    { column: 'id',           type: 'uuid', nullable: false },
    { column: 'business_id',  type: 'uuid', nullable: false },
    { column: 'user_id',      type: 'uuid', nullable: true },
    { column: 'type',         type: 'USER-DEFINED', nullable: false },
    { column: 'name',         type: 'character varying', nullable: false },
    { column: 'email',        type: 'character varying', nullable: true },
    { column: 'phone',        type: 'character varying', nullable: true },
    { column: 'message',      type: 'text', nullable: true },
    { column: 'status',       type: 'USER-DEFINED', nullable: false },
    { column: 'is_read',      type: 'boolean', nullable: false },
    { column: 'source',       type: 'character varying', nullable: true },
    { column: 'created_at',   type: 'timestamp without time zone', nullable: false },
    { column: 'updated_at',   type: 'timestamp without time zone', nullable: false },
  ],
  reviews: [
    { column: 'id',           type: 'uuid', nullable: false },
    { column: 'business_id',  type: 'uuid', nullable: false },
    { column: 'user_id',      type: 'uuid', nullable: false },
    { column: 'rating',       type: 'integer', nullable: false },
    { column: 'title',        type: 'character varying', nullable: true },
    { column: 'content',      type: 'text', nullable: false },
    { column: 'status',       type: 'USER-DEFINED', nullable: false },
    { column: 'is_verified',  type: 'boolean', nullable: false },
    { column: 'helpful_count', type: 'integer', nullable: false },
    { column: 'created_at',   type: 'timestamp without time zone', nullable: false },
    { column: 'updated_at',   type: 'timestamp without time zone', nullable: false },
  ],
  notifications: [
    { column: 'id',           type: 'uuid', nullable: false },
    { column: 'user_id',      type: 'uuid', nullable: false },
    { column: 'type',         type: 'character varying', nullable: false },
    { column: 'title',        type: 'character varying', nullable: false },
    { column: 'message',      type: 'text', nullable: false },
    { column: 'is_read',      type: 'boolean', nullable: false },
    { column: 'data',         type: 'jsonb', nullable: true },
    { column: 'created_at',   type: 'timestamp without time zone', nullable: false },
    { column: 'updated_at',   type: 'timestamp without time zone', nullable: false },
  ],
  categories: [
    { column: 'id',           type: 'uuid', nullable: false },
    { column: 'name',         type: 'character varying', nullable: false },
    { column: 'slug',         type: 'character varying', nullable: false },
    { column: 'description',  type: 'text', nullable: true },
    { column: 'icon',         type: 'character varying', nullable: true },
    { column: 'image_url',    type: 'text', nullable: true },
    { column: 'is_active',    type: 'boolean', nullable: false },
    { column: 'parent_id',    type: 'uuid', nullable: true },
    { column: 'created_at',   type: 'timestamp without time zone', nullable: false },
    { column: 'updated_at',   type: 'timestamp without time zone', nullable: false },
  ],
  cities: [
    { column: 'id',          type: 'uuid', nullable: false },
    { column: 'name',        type: 'character varying', nullable: false },
    { column: 'slug',        type: 'character varying', nullable: false },
    { column: 'state',       type: 'character varying', nullable: true },
    { column: 'country',     type: 'character varying', nullable: false },
    { column: 'is_active',   type: 'boolean', nullable: false },
    { column: 'created_at',  type: 'timestamp without time zone', nullable: false },
    { column: 'updated_at',  type: 'timestamp without time zone', nullable: false },
  ],
  transactions: [
    { column: 'id',                 type: 'uuid', nullable: false },
    { column: 'vendor_id',          type: 'uuid', nullable: false },
    { column: 'amount',             type: 'numeric', nullable: false },
    { column: 'currency',           type: 'character varying', nullable: false },
    { column: 'status',             type: 'USER-DEFINED', nullable: false },
    { column: 'payment_method',     type: 'character varying', nullable: true },
    { column: 'stripe_payment_intent_id', type: 'character varying', nullable: true },
    { column: 'stripe_session_id',  type: 'character varying', nullable: true },
    { column: 'description',        type: 'text', nullable: true },
    { column: 'metadata',           type: 'jsonb', nullable: true },
    { column: 'created_at',         type: 'timestamp without time zone', nullable: false },
    { column: 'updated_at',         type: 'timestamp without time zone', nullable: false },
  ],
  system_settings: [
    { column: 'id',          type: 'uuid', nullable: false },
    { column: 'key',         type: 'character varying', nullable: false },
    { column: 'value',       type: 'text', nullable: false },
    { column: 'created_at',  type: 'timestamp without time zone', nullable: false },
    { column: 'updated_at',  type: 'timestamp without time zone', nullable: false },
  ],
  comments: [
    { column: 'id',          type: 'uuid', nullable: false },
    { column: 'business_id', type: 'uuid', nullable: false },
    { column: 'user_id',     type: 'uuid', nullable: false },
    { column: 'content',     type: 'text', nullable: false },
    { column: 'is_approved', type: 'boolean', nullable: false },
    { column: 'created_at',  type: 'timestamp without time zone', nullable: false },
    { column: 'updated_at',  type: 'timestamp without time zone', nullable: false },
  ],
  comment_replies: [
    { column: 'id',          type: 'uuid', nullable: false },
    { column: 'comment_id',  type: 'uuid', nullable: false },
    { column: 'user_id',     type: 'uuid', nullable: true },
    { column: 'vendor_id',   type: 'uuid', nullable: true },
    { column: 'content',     type: 'text', nullable: false },
    { column: 'created_at',  type: 'timestamp without time zone', nullable: false },
    { column: 'updated_at',  type: 'timestamp without time zone', nullable: false },
  ],
  job_leads: [
    { column: 'id',           type: 'uuid', nullable: false },
    { column: 'business_id',  type: 'uuid', nullable: false },
    { column: 'user_id',      type: 'uuid', nullable: true },
    { column: 'title',        type: 'character varying', nullable: false },
    { column: 'description',  type: 'text', nullable: false },
    { column: 'budget',       type: 'numeric', nullable: true },
    { column: 'status',       type: 'USER-DEFINED', nullable: false },
    { column: 'created_at',   type: 'timestamp without time zone', nullable: false },
    { column: 'updated_at',   type: 'timestamp without time zone', nullable: false },
  ],
  chat_conversations: [
    { column: 'id',          type: 'uuid', nullable: false },
    { column: 'user_id',     type: 'uuid', nullable: false },
    { column: 'vendor_id',   type: 'uuid', nullable: false },
    { column: 'business_id', type: 'uuid', nullable: true },
    { column: 'is_active',   type: 'boolean', nullable: false },
    { column: 'created_at',  type: 'timestamp without time zone', nullable: false },
    { column: 'updated_at',  type: 'timestamp without time zone', nullable: false },
  ],
  chat_messages: [
    { column: 'id',              type: 'uuid', nullable: false },
    { column: 'conversation_id', type: 'uuid', nullable: false },
    { column: 'sender_id',       type: 'uuid', nullable: false },
    { column: 'content',         type: 'text', nullable: false },
    { column: 'is_read',         type: 'boolean', nullable: false },
    { column: 'created_at',      type: 'timestamp without time zone', nullable: false },
    { column: 'updated_at',      type: 'timestamp without time zone', nullable: false },
  ],
  follows: [
    { column: 'id',          type: 'uuid', nullable: false },
    { column: 'user_id',     type: 'uuid', nullable: false },
    { column: 'business_id', type: 'uuid', nullable: false },
    { column: 'created_at',  type: 'timestamp without time zone', nullable: false },
  ],
  saved_listings: [
    { column: 'id',          type: 'uuid', nullable: false },
    { column: 'user_id',     type: 'uuid', nullable: false },
    { column: 'business_id', type: 'uuid', nullable: false },
    { column: 'created_at',  type: 'timestamp without time zone', nullable: false },
  ],
};

// ──────────────────────────────────────────────────────────────
//  ALTER TABLE SQL for missing columns (add as needed)
// ──────────────────────────────────────────────────────────────
const FIX_STATEMENTS = {
  // offer_events missing columns
  'offer_events.featured_until': `ALTER TABLE offer_events ADD COLUMN IF NOT EXISTS featured_until TIMESTAMP WITHOUT TIME ZONE;`,
  'offer_events.pricing_id':     `ALTER TABLE offer_events ADD COLUMN IF NOT EXISTS pricing_id UUID REFERENCES offer_event_pricing(id) ON DELETE SET NULL;`,
  'offer_events.highlights':     `ALTER TABLE offer_events ADD COLUMN IF NOT EXISTS highlights JSONB DEFAULT '[]';`,
  'offer_events.terms':          `ALTER TABLE offer_events ADD COLUMN IF NOT EXISTS terms JSONB DEFAULT '[]';`,
  'offer_events.start_date':     `ALTER TABLE offer_events ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITHOUT TIME ZONE;`,
  'offer_events.expiry_date':    `ALTER TABLE offer_events ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMP WITHOUT TIME ZONE;`,
  'offer_events.is_featured':    `ALTER TABLE offer_events ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE;`,

  // businesses missing columns
  'businesses.followers_count':     `ALTER TABLE businesses ADD COLUMN IF NOT EXISTS followers_count INTEGER NOT NULL DEFAULT 0;`,
  'businesses.is_sponsored':        `ALTER TABLE businesses ADD COLUMN IF NOT EXISTS is_sponsored BOOLEAN NOT NULL DEFAULT FALSE;`,
  'businesses.suggested_category_name': `ALTER TABLE businesses ADD COLUMN IF NOT EXISTS suggested_category_name TEXT;`,
  'businesses.faqs':                `ALTER TABLE businesses ADD COLUMN IF NOT EXISTS faqs JSONB NOT NULL DEFAULT '[]';`,

  // users missing columns
  'users.push_subscriptions': `ALTER TABLE users ADD COLUMN IF NOT EXISTS push_subscriptions JSONB DEFAULT '[]';`,
  'users.is_online':          `ALTER TABLE users ADD COLUMN IF NOT EXISTS is_online BOOLEAN NOT NULL DEFAULT FALSE;`,
  'users.last_active_at':     `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITHOUT TIME ZONE;`,
  'users.provider':           `ALTER TABLE users ADD COLUMN IF NOT EXISTS provider VARCHAR(10) DEFAULT 'local';`,
  'users.google_id':          `ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR UNIQUE;`,

  // vendors missing columns
  'vendors.stripe_customer_id': `ALTER TABLE vendors ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR;`,
  'vendors.ntn_number':         `ALTER TABLE vendors ADD COLUMN IF NOT EXISTS ntn_number VARCHAR(15);`,
  'vendors.social_links':       `ALTER TABLE vendors ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '[]';`,

  // subscription_plans missing columns
  'subscription_plans.dashboard_features': `ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS dashboard_features JSONB NOT NULL DEFAULT '{}';`,
  'subscription_plans.stripe_price_id':    `ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS stripe_price_id VARCHAR;`,
  'subscription_plans.is_featured':        `ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE;`,
  'subscription_plans.billing_cycle':      `ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(20) NOT NULL DEFAULT 'monthly';`,

  // system_settings
  'system_settings.key':   `ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS key VARCHAR NOT NULL DEFAULT 'unknown';`,
  'system_settings.value': `ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS value TEXT NOT NULL DEFAULT '';`,

  // transactions
  'transactions.stripe_session_id': `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS stripe_session_id VARCHAR;`,
  'transactions.metadata':          `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS metadata JSONB;`,
};

// ──────────────────────────────────────────────────────────────
//  TABLE CREATION SQL for missing tables
// ──────────────────────────────────────────────────────────────
const CREATE_TABLE_SQL = {
  pricing_plans: `
    CREATE TABLE IF NOT EXISTS pricing_plans (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR NOT NULL,
      description TEXT,
      type VARCHAR(50) NOT NULL DEFAULT 'subscription',
      price NUMERIC(10,2) NOT NULL,
      duration INTEGER NOT NULL DEFAULT 1,
      unit VARCHAR(20) NOT NULL DEFAULT 'days',
      stripe_price_id VARCHAR,
      features JSONB DEFAULT '{}',
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `,
  active_plans: `
    CREATE TABLE IF NOT EXISTS active_plans (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
      plan_id UUID NOT NULL REFERENCES pricing_plans(id) ON DELETE CASCADE,
      target_id UUID,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      start_date TIMESTAMP NOT NULL,
      end_date TIMESTAMP NOT NULL,
      amount_paid NUMERIC(10,2),
      transaction_id VARCHAR,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_active_plans_vendor ON active_plans(vendor_id, status);
    CREATE INDEX IF NOT EXISTS idx_active_plans_target ON active_plans(target_id, status);
  `,
  offer_event_pricing: `
    CREATE TABLE IF NOT EXISTS offer_event_pricing (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      type VARCHAR(20) NOT NULL DEFAULT 'offer',
      name VARCHAR NOT NULL,
      price NUMERIC(10,2) NOT NULL,
      unit VARCHAR(20) NOT NULL DEFAULT 'hours',
      duration INTEGER NOT NULL DEFAULT 1,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `,
  system_settings: `
    CREATE TABLE IF NOT EXISTS system_settings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      key VARCHAR NOT NULL UNIQUE,
      value TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `,
  chat_conversations: `
    CREATE TABLE IF NOT EXISTS chat_conversations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
      business_id UUID,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `,
  chat_messages: `
    CREATE TABLE IF NOT EXISTS chat_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
      sender_id UUID NOT NULL,
      content TEXT NOT NULL,
      is_read BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `,
  comment_replies: `
    CREATE TABLE IF NOT EXISTS comment_replies (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `,
  follows: `
    CREATE TABLE IF NOT EXISTS follows (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, business_id)
    );
  `,
  saved_listings: `
    CREATE TABLE IF NOT EXISTS saved_listings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, business_id)
    );
  `,
};

// ──────────────────────────────────────────────────────────────
//  MAIN
// ──────────────────────────────────────────────────────────────

async function main() {
  const client = new Client(DB_CONFIG);

  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║   Railway DB — Full Schema Verification & Auto-Fix   ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  try {
    await client.connect();
    console.log('✅ Connected to Railway PostgreSQL\n');
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  }

  // ── 1. List all existing tables ──────────────────────────────
  const { rows: tableRows } = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);
  const existingTables = new Set(tableRows.map(r => r.table_name));

  console.log('📋 EXISTING TABLES IN DATABASE:');
  [...existingTables].forEach(t => console.log(`   • ${t}`));
  console.log();

  const results = { created: [], fixed: [], ok: [], missing_tables: [] };

  // ── 2. Create missing tables ─────────────────────────────────
  for (const [table, sql] of Object.entries(CREATE_TABLE_SQL)) {
    if (!existingTables.has(table)) {
      console.log(`🔨 CREATING MISSING TABLE: ${table}`);
      try {
        await client.query(sql);
        console.log(`   ✅ Created "${table}"`);
        results.created.push(table);
        existingTables.add(table);
      } catch (err) {
        console.error(`   ❌ Failed to create "${table}": ${err.message}`);
      }
    }
  }

  // ── 3. Check each table's columns ────────────────────────────
  console.log('\n📊 COLUMN-LEVEL VERIFICATION:\n');

  for (const [table, expectedCols] of Object.entries(EXPECTED_SCHEMA)) {
    if (!existingTables.has(table)) {
      console.log(`⚠️  TABLE "${table}" STILL MISSING (no CREATE SQL defined)`);
      results.missing_tables.push(table);
      continue;
    }

    const { rows: colRows } = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position;
    `, [table]);

    const dbCols = new Map(colRows.map(r => [r.column_name, r]));
    const missingCols = expectedCols.filter(ec => !dbCols.has(ec.column));

    if (missingCols.length === 0) {
      console.log(`✅ ${table.padEnd(30)} — All ${expectedCols.length} columns OK`);
      results.ok.push(table);
    } else {
      console.log(`⚠️  ${table.padEnd(30)} — MISSING ${missingCols.length} column(s):`);
      for (const mc of missingCols) {
        const fixKey = `${table}.${mc.column}`;
        const fixSQL = FIX_STATEMENTS[fixKey];
        if (fixSQL) {
          try {
            await client.query(fixSQL);
            console.log(`   🔧 FIXED: ${mc.column}`);
            results.fixed.push(fixKey);
          } catch (err) {
            console.error(`   ❌ FAILED to fix ${mc.column}: ${err.message}`);
          }
        } else {
          console.log(`   ❓ MISSING (no fix defined): ${mc.column} [${mc.type}]`);
        }
      }
    }
  }

  // ── 4. Check for enum types ───────────────────────────────────
  console.log('\n🏷️  ENUM TYPE CHECK:\n');
  const { rows: enumRows } = await client.query(`
    SELECT typname FROM pg_type WHERE typcategory = 'E' ORDER BY typname;
  `);
  const enumNames = enumRows.map(r => r.typname);
  console.log('   Existing enums:', enumNames.join(', ') || '(none)');

  const requiredEnums = [
    'user_role_enum', 'business_status_enum', 'subscription_plan_type_enum',
    'offer_type_enum', 'offer_status_enum', 'active_plan_status_enum',
    'pricing_plan_type_enum', 'pricing_plan_unit_enum', 'pricing_unit_enum',
  ];

  const missingEnums = requiredEnums.filter(e => !enumNames.some(en => en.includes(e.replace('_enum', ''))));
  if (missingEnums.length === 0) {
    console.log('   ✅ All required enum types found');
  } else {
    console.log('   ⚠️  Some enum types may need verification:', missingEnums.join(', '));
  }

  // ── 5. Verify critical data ───────────────────────────────────
  console.log('\n📊 DATA INTEGRITY CHECK:\n');

  const dataChecks = [
    { label: 'Users total',              q: 'SELECT COUNT(*) FROM users' },
    { label: 'Vendors total',            q: 'SELECT COUNT(*) FROM vendors' },
    { label: 'Businesses total',         q: 'SELECT COUNT(*) FROM businesses' },
    { label: 'Subscription Plans',       q: 'SELECT COUNT(*) FROM subscription_plans' },
    { label: 'Pricing Plans',            q: 'SELECT COUNT(*) FROM pricing_plans' },
    { label: 'Active Plans',             q: 'SELECT COUNT(*) FROM active_plans' },
    { label: 'Offer Events',             q: 'SELECT COUNT(*) FROM offer_events' },
    { label: 'Offer Event Pricing',      q: 'SELECT COUNT(*) FROM offer_event_pricing' },
    { label: 'Leads',                    q: 'SELECT COUNT(*) FROM leads' },
    { label: 'Reviews',                  q: 'SELECT COUNT(*) FROM reviews' },
    { label: 'Subscriptions',            q: 'SELECT COUNT(*) FROM subscriptions' },
    { label: 'Transactions',             q: 'SELECT COUNT(*) FROM transactions' },
    { label: 'Notifications',            q: 'SELECT COUNT(*) FROM notifications' },
    { label: 'Categories',               q: 'SELECT COUNT(*) FROM categories' },
    { label: 'Cities',                   q: 'SELECT COUNT(*) FROM cities' },
    { label: 'Chat Conversations',       q: 'SELECT COUNT(*) FROM chat_conversations' },
    { label: 'Chat Messages',            q: 'SELECT COUNT(*) FROM chat_messages' },
    { label: 'Comments',                 q: 'SELECT COUNT(*) FROM comments' },
    { label: 'Comment Replies',          q: 'SELECT COUNT(*) FROM comment_replies' },
    { label: 'Follows',                  q: 'SELECT COUNT(*) FROM follows' },
    { label: 'Saved Listings',           q: 'SELECT COUNT(*) FROM saved_listings' },
    { label: 'System Settings',          q: 'SELECT COUNT(*) FROM system_settings' },
  ];

  for (const { label, q } of dataChecks) {
    try {
      const { rows } = await client.query(q);
      const count = rows[0].count;
      const icon = count > 0 ? '✅' : '⚠️ ';
      console.log(`   ${icon} ${label.padEnd(28)} ${count} rows`);
    } catch (err) {
      console.log(`   ❌ ${label.padEnd(28)} ERROR: ${err.message}`);
    }
  }

  // ── 6. Check subscription plans have stripe_price_id ────────
  console.log('\n💳 STRIPE INTEGRATION CHECK:\n');
  try {
    const { rows: plans } = await client.query(`SELECT name, plan_type, price, stripe_price_id, is_active FROM subscription_plans ORDER BY price;`);
    if (plans.length === 0) {
      console.log('   ⚠️  No subscription plans found — run seed!');
    } else {
      plans.forEach(p => {
        const hasStripe = p.stripe_price_id ? '✅' : '⚠️ ';
        console.log(`   ${hasStripe} [${p.plan_type}] ${p.name} — PKR ${p.price} — Stripe: ${p.stripe_price_id || 'NOT SET'}`);
      });
    }
  } catch (e) {
    console.log('   ❌ Cannot query subscription_plans:', e.message);
  }

  try {
    const { rows: pricingPlans } = await client.query(`SELECT name, type, price, duration, unit, is_active FROM pricing_plans ORDER BY type, price;`);
    if (pricingPlans.length === 0) {
      console.log('\n   ⚠️  No pricing plans (offer/event pricing) found — run seed!');
    } else {
      console.log(`\n   Offer/Event Pricing Plans (${pricingPlans.length} total):`);
      pricingPlans.forEach(p => {
        console.log(`   ✅ [${p.type}] ${p.name} — PKR ${p.price} / ${p.duration} ${p.unit}`);
      });
    }
  } catch (e) {
    console.log('   ❌ Cannot query pricing_plans:', e.message);
  }

  // ── 7. Summary ────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('   SUMMARY');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`   ✅ Tables OK with all columns:  ${results.ok.length}`);
  console.log(`   🔨 New tables created:          ${results.created.length}  ${results.created.length ? '→ ' + results.created.join(', ') : ''}`);
  console.log(`   🔧 Columns fixed (ALTER TABLE): ${results.fixed.length}  ${results.fixed.length ? '→ ' + results.fixed.join(', ') : ''}`);
  console.log(`   ❓ Tables still missing:        ${results.missing_tables.length}  ${results.missing_tables.length ? '→ ' + results.missing_tables.join(', ') : ''}`);
  console.log('═══════════════════════════════════════════════════════\n');

  await client.end();
  console.log('🔌 Disconnected.\n');
}

main().catch(err => {
  console.error('\n💥 Fatal error:', err.message);
  process.exit(1);
});
