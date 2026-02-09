import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function setupDatabase() {
    console.log('Setting up database...');

    try {
        // Create users table (for admin authentication)
        await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
        console.log('Users table created');

        // Create categories table
        await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
        console.log('Categories table created');

        // Create products table
        await sql`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        original_price DECIMAL(10, 2),
        category VARCHAR(255),
        material VARCHAR(255),
        color VARCHAR(255),
        size VARCHAR(100),
        quantity VARCHAR(100),
        stock INTEGER DEFAULT 0,
        in_stock BOOLEAN DEFAULT TRUE,
        images TEXT[],
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
        console.log('Products table created');

        // Create orders table
        await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_first_name VARCHAR(255) NOT NULL,
        customer_last_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50),
        items JSONB NOT NULL,
        total DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        shipping_method VARCHAR(50),
        shipping_address JSONB,
        payment_method VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
        console.log('Orders table created');

        // Create classes table
        await sql`
      CREATE TABLE IF NOT EXISTS classes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        level VARCHAR(50),
        date DATE,
        time VARCHAR(100),
        duration VARCHAR(100),
        price DECIMAL(10, 2),
        instructor VARCHAR(255),
        spots INTEGER DEFAULT 10,
        spots_left INTEGER DEFAULT 10,
        type VARCHAR(50) DEFAULT 'in-person',
        image TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
        console.log('Classes table created');

        // Create bookings table
        await sql`
      CREATE TABLE IF NOT EXISTS bookings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
        class_name VARCHAR(255),
        customer_first_name VARCHAR(255) NOT NULL,
        customer_last_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50),
        date DATE,
        time VARCHAR(100),
        attendees INTEGER DEFAULT 1,
        total_price DECIMAL(10, 2),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
        console.log('Bookings table created');

        // Create contact_messages table
        await sql`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(255),
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
        console.log('Contact messages table created');

        // Create custom_requests table
        await sql`
      CREATE TABLE IF NOT EXISTS custom_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_first_name VARCHAR(255) NOT NULL,
        customer_last_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50),
        description TEXT NOT NULL,
        specifications JSONB,
        images TEXT[],
        status VARCHAR(50) DEFAULT 'pending',
        quote JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
        console.log('Custom requests table created');

        // Check if admin user exists, if not create one
        const existingAdmin = await sql`SELECT * FROM users WHERE email = 'admin@lastingimpressions.com' LIMIT 1`;

        if (existingAdmin.length === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await sql`
        INSERT INTO users (email, password_hash, name, role)
        VALUES ('admin@lastingimpressions.com', ${hashedPassword}, 'Admin', 'admin')
      `;
            console.log('Default admin user created (email: admin@lastingimpressions.com, password: admin123)');
        } else {
            console.log('Admin user already exists');
        }

        console.log('\nDatabase setup completed successfully!');
    } catch (error) {
        console.error('Error setting up database:', error);
        process.exit(1);
    }
}

setupDatabase();
