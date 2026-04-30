CREATE TABLE IF NOT EXISTS code_definitions (
  id           TEXT PRIMARY KEY,
  code_type    TEXT NOT NULL,
  code_value   TEXT NOT NULL,
  code_key     TEXT NOT NULL UNIQUE,
  mode         TEXT NOT NULL,
  name         TEXT NOT NULL DEFAULT '',
  category     TEXT NOT NULL DEFAULT 'other',
  notes        TEXT NOT NULL DEFAULT '',
  created_at   TEXT NOT NULL,
  updated_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS item_records (
  id                  TEXT PRIMARY KEY,
  code_definition_id  TEXT NOT NULL REFERENCES code_definitions(id),
  label               TEXT NOT NULL DEFAULT '',
  notes               TEXT NOT NULL DEFAULT '',
  collected_at        TEXT,
  updated_at          TEXT NOT NULL,
  location_lat        REAL,
  location_lng        REAL,
  location_accuracy   REAL,
  photo_data_url      TEXT,
  photo_name          TEXT,
  photo_width         INTEGER,
  photo_height        INTEGER,
  photo_size          INTEGER,
  meta_price          TEXT,
  meta_currency       TEXT,
  meta_source_shop    TEXT,
  meta_recipient      TEXT,
  meta_consumed       INTEGER NOT NULL DEFAULT 0,
  meta_gifted         INTEGER NOT NULL DEFAULT 0,

  is_public           INTEGER NOT NULL DEFAULT 0,
  show_photo          INTEGER NOT NULL DEFAULT 1,
  show_notes          INTEGER NOT NULL DEFAULT 1,
  show_price          INTEGER NOT NULL DEFAULT 0,
  show_source_shop    INTEGER NOT NULL DEFAULT 0,
  show_recipient      INTEGER NOT NULL DEFAULT 0,
  show_consumed       INTEGER NOT NULL DEFAULT 0,
  show_gifted         INTEGER NOT NULL DEFAULT 0,
  show_location       INTEGER NOT NULL DEFAULT 0,

  admin_notes         TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_items_code_def ON item_records(code_definition_id);
CREATE INDEX IF NOT EXISTS idx_items_public ON item_records(is_public);
-- Speeds up ORDER BY collected_at DESC on all list queries
CREATE INDEX IF NOT EXISTS idx_items_collected_at ON item_records(collected_at);
-- Covers the common pattern: all items for a code, newest first
CREATE INDEX IF NOT EXISTS idx_items_code_collected ON item_records(code_definition_id, collected_at);

CREATE TABLE IF NOT EXISTS page_views (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id     TEXT NOT NULL REFERENCES item_records(id),
  viewed_at   TEXT NOT NULL DEFAULT (datetime('now')),
  referrer    TEXT
);

CREATE INDEX IF NOT EXISTS idx_views_item ON page_views(item_id);
-- Allows time-range analytics queries without a full table scan
CREATE INDEX IF NOT EXISTS idx_views_viewed_at ON page_views(viewed_at);

CREATE TABLE IF NOT EXISTS rate_limits (
  key         TEXT PRIMARY KEY,
  count       INTEGER NOT NULL DEFAULT 0,
  reset_at    INTEGER NOT NULL  -- Unix ms timestamp
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_reset ON rate_limits(reset_at);

CREATE TABLE IF NOT EXISTS api_tokens (
  id          TEXT PRIMARY KEY,       -- random UUID, returned once on creation
  name        TEXT NOT NULL,          -- user-supplied label e.g. "My Phone"
  token_hash  TEXT NOT NULL UNIQUE,   -- SHA-256(raw_token) — raw token never stored
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  last_used_at TEXT                   -- updated on each successful API call
);

-- Add photo_name to existing databases that predate this column
-- sql.js does not support IF NOT EXISTS on ALTER TABLE, so we use a
-- separate migration table to track applied changes.
CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY);

INSERT OR IGNORE INTO _migrations (name) VALUES ('001_photo_name');
-- The actual ALTER is handled at runtime in db/client.js (see applyColumnMigrations).
