import sqlite3 from 'sqlite3'
import { open, Database } from 'sqlite'

let db: Database | null = null

export async function getDatabase(): Promise<Database> {
  if (db) return db
  
  db = await open({
    filename: './data/bagprice.db',
    driver: sqlite3.Database
  })
  
  await db.run(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
      openid TEXT UNIQUE,
      username TEXT UNIQUE,
      password TEXT,
      company_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  
  await db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
      client_id TEXT,
      length REAL NOT NULL,
      width REAL NOT NULL,
      height REAL NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      total_price REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id)
    )
  `)
  
  await db.run(`
    CREATE TABLE IF NOT EXISTS price_parameters (
      id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
      raw_material_price REAL NOT NULL DEFAULT 12000,
      markup_ratio REAL NOT NULL DEFAULT 0.3,
      waste_cost REAL NOT NULL DEFAULT 0.1,
      shipping_cost REAL NOT NULL DEFAULT 500,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  
  await db.run(`
    CREATE TABLE IF NOT EXISTS price_history (
      id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
      parameter_id TEXT,
      raw_material_price REAL NOT NULL,
      markup_ratio REAL NOT NULL,
      waste_cost REAL NOT NULL,
      shipping_cost REAL NOT NULL,
      changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parameter_id) REFERENCES price_parameters(id)
    )
  `)
  
  const paramExists = await db.get('SELECT COUNT(*) as count FROM price_parameters')
  if (paramExists?.count === 0) {
    await db.run(`
      INSERT INTO price_parameters (raw_material_price, markup_ratio, waste_cost, shipping_cost)
      VALUES (12000, 0.3, 0.1, 500)
    `)
  }
  
  return db
}