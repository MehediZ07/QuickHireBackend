import { pool } from './src/config/database';
import bcrypt from 'bcryptjs';

const seedDatabase = async () => {
  try {
    console.log('🗑️  Clearing old data...');
    
    // Drop tables in correct order (due to foreign keys)
    await pool.query('DROP TABLE IF EXISTS applications CASCADE');
    await pool.query('DROP TABLE IF EXISTS jobs CASCADE');
    await pool.query('DROP TABLE IF EXISTS bookings CASCADE');
    await pool.query('DROP TABLE IF EXISTS vehicles CASCADE');
    await pool.query('DROP TABLE IF EXISTS users CASCADE');
    
    console.log('✅ Old data cleared');
    console.log('📦 Creating tables...');
    
    // Create users table
    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(15) NOT NULL,
        role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create jobs table
    await pool.query(`
      CREATE TABLE jobs (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        company VARCHAR(200) NOT NULL,
        location VARCHAR(200) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        logo VARCHAR(500),
        type VARCHAR(50) DEFAULT 'Full-Time',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create applications table
    await pool.query(`
      CREATE TABLE applications (
        id SERIAL PRIMARY KEY,
        job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL,
        resume_link VARCHAR(500) NOT NULL,
        cover_note TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log('✅ Tables created');
    console.log('👤 Inserting admin user...');
    
    // Insert admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await pool.query(
      'INSERT INTO users (name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5)',
      ['Admin User', 'admin@quickhire.com', hashedPassword, '1234567890', 'admin']
    );
    
    console.log('✅ Admin user created (email: admin@quickhire.com, password: admin123)');
    console.log('💼 Inserting sample jobs...');
    
    // Insert sample jobs
    const jobs = [
      {
        title: 'Senior Frontend Developer',
        company: 'Google',
        location: 'San Francisco, USA',
        category: 'Technology',
        description: 'We are looking for an experienced Frontend Developer to join our team. You will be responsible for building responsive web applications using React, TypeScript, and modern web technologies.',
        logo: 'https://logo.clearbit.com/google.com',
        type: 'Full-Time'
      },
      {
        title: 'UI/UX Designer',
        company: 'Apple',
        location: 'Cupertino, USA',
        category: 'Design',
        description: 'Join our design team to create beautiful and intuitive user interfaces. Experience with Figma, Sketch, and design systems required.',
        logo: 'https://logo.clearbit.com/apple.com',
        type: 'Full-Time'
      },
      {
        title: 'Marketing Manager',
        company: 'Microsoft',
        location: 'Seattle, USA',
        category: 'Marketing',
        description: 'Lead our marketing initiatives and develop strategies to grow our brand presence. Experience in digital marketing and analytics required.',
        logo: 'https://logo.clearbit.com/microsoft.com',
        type: 'Full-Time'
      },
      {
        title: 'Data Analyst',
        company: 'Amazon',
        location: 'New York, USA',
        category: 'Technology',
        description: 'Analyze large datasets to provide insights and drive business decisions. Strong SQL and Python skills required.',
        logo: 'https://logo.clearbit.com/amazon.com',
        type: 'Full-Time'
      },
      {
        title: 'Product Manager',
        company: 'Meta',
        location: 'Menlo Park, USA',
        category: 'Business',
        description: 'Drive product strategy and work with cross-functional teams to deliver innovative solutions.',
        logo: 'https://logo.clearbit.com/meta.com',
        type: 'Full-Time'
      },
      {
        title: 'Backend Engineer',
        company: 'Netflix',
        location: 'Los Angeles, USA',
        category: 'Engineering',
        description: 'Build scalable backend systems using Node.js, PostgreSQL, and microservices architecture.',
        logo: 'https://logo.clearbit.com/netflix.com',
        type: 'Full-Time'
      },
      {
        title: 'Sales Executive',
        company: 'Salesforce',
        location: 'Chicago, USA',
        category: 'Sales',
        description: 'Drive sales growth and build relationships with enterprise clients. B2B sales experience preferred.',
        logo: 'https://logo.clearbit.com/salesforce.com',
        type: 'Full-Time'
      },
      {
        title: 'HR Manager',
        company: 'LinkedIn',
        location: 'Boston, USA',
        category: 'Human Resource',
        description: 'Manage recruitment, employee relations, and HR operations. Experience in tech industry preferred.',
        logo: 'https://logo.clearbit.com/linkedin.com',
        type: 'Full-Time'
      },
      {
        title: 'DevOps Engineer',
        company: 'Spotify',
        location: 'Stockholm, Sweden',
        category: 'Engineering',
        description: 'Manage cloud infrastructure and CI/CD pipelines. Experience with AWS, Docker, and Kubernetes required.',
        logo: 'https://logo.clearbit.com/spotify.com',
        type: 'Full-Time'
      },
      {
        title: 'Content Writer',
        company: 'Medium',
        location: 'Remote',
        category: 'Marketing',
        description: 'Create engaging content for our blog and marketing materials. Strong writing and SEO skills required.',
        logo: 'https://logo.clearbit.com/medium.com',
        type: 'Part-Time'
      }
    ];
    
    for (const job of jobs) {
      await pool.query(
        'INSERT INTO jobs (title, company, location, category, description, logo, type) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [job.title, job.company, job.location, job.category, job.description, job.logo, job.type]
      );
    }
    
    console.log(`✅ ${jobs.length} sample jobs inserted`);
    console.log('🎉 Database seeded successfully!');
    console.log('\n📝 Summary:');
    console.log('- Admin: admin@quickhire.com / admin123');
    console.log(`- Jobs: ${jobs.length} sample jobs`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
