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

CREATE TABLE IF NOT EXISTS page_views (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id     TEXT NOT NULL REFERENCES item_records(id),
  viewed_at   TEXT NOT NULL DEFAULT (datetime('now')),
  referrer    TEXT
);

CREATE INDEX IF NOT EXISTS idx_views_item ON page_views(item_id);
