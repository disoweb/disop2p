import { Pool } from "pg"

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

// Database schemas
export const createTables = async () => {
  const client = await pool.connect()

  try {
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        bvn VARCHAR(11),
        state VARCHAR(50),
        city VARCHAR(50),
        kyc_status VARCHAR(20) DEFAULT 'pending',
        kyc_level INTEGER DEFAULT 0,
        is_verified BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        rating DECIMAL(3,2) DEFAULT 0.00,
        total_trades INTEGER DEFAULT 0,
        successful_trades INTEGER DEFAULT 0,
        total_volume DECIMAL(15,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // KYC documents table
    await client.query(`
      CREATE TABLE IF NOT EXISTS kyc_documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        document_type VARCHAR(50) NOT NULL,
        document_number VARCHAR(100),
        document_url VARCHAR(500),
        verification_status VARCHAR(20) DEFAULT 'pending',
        verified_at TIMESTAMP,
        verified_by UUID,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(10) NOT NULL CHECK (type IN ('buy', 'sell')),
        cryptocurrency VARCHAR(10) NOT NULL,
        amount DECIMAL(18,8) NOT NULL,
        rate DECIMAL(15,2) NOT NULL,
        min_limit DECIMAL(15,2) NOT NULL,
        max_limit DECIMAL(15,2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        payment_time_limit INTEGER DEFAULT 15,
        instructions TEXT,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Trades table
    await client.query(`
      CREATE TABLE IF NOT EXISTS trades (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
        buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
        seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
        cryptocurrency VARCHAR(10) NOT NULL,
        amount DECIMAL(18,8) NOT NULL,
        rate DECIMAL(15,2) NOT NULL,
        total_amount DECIMAL(15,2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        escrow_address VARCHAR(100),
        escrow_amount DECIMAL(18,8),
        payment_proof_url VARCHAR(500),
        dispute_reason TEXT,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        trade_id UUID REFERENCES trades(id) ON DELETE CASCADE,
        sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        message_type VARCHAR(20) DEFAULT 'text',
        attachment_url VARCHAR(500),
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Disputes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS disputes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        trade_id UUID REFERENCES trades(id) ON DELETE CASCADE,
        complainant_id UUID REFERENCES users(id) ON DELETE CASCADE,
        respondent_id UUID REFERENCES users(id) ON DELETE CASCADE,
        reason VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        evidence_urls TEXT[],
        status VARCHAR(20) DEFAULT 'open',
        assigned_to UUID,
        resolution TEXT,
        resolved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Notifications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        data JSONB,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Fraud detection logs
    await client.query(`
      CREATE TABLE IF NOT EXISTS fraud_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        action VARCHAR(100) NOT NULL,
        risk_score INTEGER NOT NULL,
        factors JSONB,
        ip_address INET,
        user_agent TEXT,
        blocked BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Payment transactions
    await client.query(`
      CREATE TABLE IF NOT EXISTS payment_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        trade_id UUID REFERENCES trades(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        gateway VARCHAR(50) NOT NULL,
        transaction_ref VARCHAR(100) UNIQUE NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        gateway_response JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    console.log("Database tables created successfully")
  } catch (error) {
    console.error("Error creating tables:", error)
    throw error
  } finally {
    client.release()
  }
}

export { pool }
