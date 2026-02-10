import { neon } from '@neondatabase/serverless';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupDatabase() {
    console.log('Setting up Neon database (data) + Supabase (auth)...\n');

    try {
        // =============================================
        // NEON: Create application tables
        // =============================================

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
        console.log('[Neon] Categories table created');

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
        console.log('[Neon] Products table created');

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
        console.log('[Neon] Orders table created');

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
        console.log('[Neon] Classes table created');

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
        console.log('[Neon] Bookings table created');

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
        console.log('[Neon] Contact messages table created');

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
        console.log('[Neon] Custom requests table created');

        // Add customer_id columns (Supabase UUIDs, no FK since cross-database)
        await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id UUID`;
        console.log('[Neon] Orders customer_id column ensured');

        await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_id UUID`;
        console.log('[Neon] Bookings customer_id column ensured');

        console.log('\n[Neon] Database setup completed!\n');

        // =============================================
        // SUPABASE: Seed admin user
        // =============================================

        console.log('[Supabase] Setting up admin user...');

        const adminEmail = 'admin@lastingimpressions.com';
        const adminPassword = 'admin123';

        // Check if admin already exists
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingAdmin = existingUsers?.users?.find(u => u.email === adminEmail);

        if (existingAdmin) {
            // Update password to reset it
            await supabaseAdmin.auth.admin.updateUserById(existingAdmin.id, {
                password: adminPassword,
            });
            // Ensure profile has admin role
            await supabaseAdmin
                .from('profiles')
                .upsert({
                    id: existingAdmin.id,
                    email: adminEmail,
                    name: 'Admin',
                    role: 'admin',
                });
            console.log('[Supabase] Admin user password reset (email: admin@lastingimpressions.com, password: admin123)');
        } else {
            // Create new admin user
            const { data, error } = await supabaseAdmin.auth.admin.createUser({
                email: adminEmail,
                password: adminPassword,
                email_confirm: true,
                user_metadata: { name: 'Admin', role: 'admin' },
            });

            if (error) {
                console.error('[Supabase] Error creating admin:', error.message);
            } else {
                // Ensure profile has admin role (trigger should handle this, but be safe)
                await supabaseAdmin
                    .from('profiles')
                    .upsert({
                        id: data.user.id,
                        email: adminEmail,
                        name: 'Admin',
                        role: 'admin',
                    });
                console.log('[Supabase] Admin user created (email: admin@lastingimpressions.com, password: admin123)');
            }
        }

        console.log('\nSetup completed successfully!');
    } catch (error) {
        console.error('Error during setup:', error);
        process.exit(1);
    }
}

setupDatabase();
