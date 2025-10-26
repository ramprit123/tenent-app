import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create tenants
  console.log('🏢 Creating tenants...');
  const tenant1 = await prisma.tenant.create({
    data: {
      name: 'Sunrise Apartments',
      domain: 'sunrise-apartments.com',
      plan: 'premium',
      meta: {
        address: '123 Main Street, City, State',
        phone: '+1-555-0123',
        email: 'admin@sunrise-apartments.com',
      },
    },
  });

  // Hash password for test users
  const hashedPassword = await bcrypt.hash('password123', 12);

  // Create users
  console.log('👥 Creating users...');
  const adminUser = await prisma.user.create({
    data: {
      tenantId: tenant1.id,
      email: 'admin@sunrise-apartments.com',
      name: 'Admin User',
      phone: '+1-555-0100',
      passwordHash: hashedPassword,
      roles: JSON.stringify(['admin', 'manager']),
      isActive: true,
    },
  });

  const managerUser = await prisma.user.create({
    data: {
      tenantId: tenant1.id,
      email: 'manager@sunrise-apartments.com',
      name: 'Manager User',
      phone: '+1-555-0101',
      passwordHash: hashedPassword,
      roles: JSON.stringify(['manager']),
      isActive: true,
    },
  });

  const regularUser = await prisma.user.create({
    data: {
      tenantId: tenant1.id,
      email: 'user@sunrise-apartments.com',
      name: 'Regular User',
      phone: '+1-555-0102',
      passwordHash: hashedPassword,
      roles: JSON.stringify(['user']),
      isActive: true,
    },
  });

  console.log('✅ Database seeding completed successfully!');
  console.log(`
📊 Summary:
- Tenants: 1
- Users: 3 (1 admin, 1 manager, 1 regular user)

🔐 Test Credentials:
Admin: admin@sunrise-apartments.com / password123
Manager: manager@sunrise-apartments.com / password123
User: user@sunrise-apartments.com / password123

Tenant ID: ${tenant1.id}
  `);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });