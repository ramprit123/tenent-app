import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data (optional - remove if you want to keep existing data)
  console.log('🧹 Cleaning existing data...');
  await prisma.auditLog.deleteMany();
  await prisma.rentPayment.deleteMany();
  await prisma.agreement.deleteMany();
  await prisma.lease.deleteMany();
  await prisma.kycRecord.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.maintenance.deleteMany();
  await prisma.tenantTenant.deleteMany();
  await prisma.occupant.deleteMany();
  await prisma.flat.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();

  // Create Tenants (Organizations)
  console.log('👥 Creating tenants...');
  const tenant1 = await prisma.tenant.create({
    data: {
      name: 'Sunrise Properties',
      domain: 'sunrise-properties.com',
      plan: 'premium',
      meta: {
        address: '123 Business District, Mumbai',
        phone: '+91-9876543210',
        email: 'admin@sunrise-properties.com',
      },
    },
  });

  const tenant2 = await prisma.tenant.create({
    data: {
      name: 'Metro Housing Solutions',
      domain: 'metro-housing.com',
      plan: 'standard',
      meta: {
        address: '456 Commercial Street, Delhi',
        phone: '+91-9876543211',
        email: 'info@metro-housing.com',
      },
    },
  });

  // Create Users
  console.log('👤 Creating users...');
  const user1 = await prisma.user.create({
    data: {
      tenantId: tenant1.id,
      email: 'john.manager@sunrise-properties.com',
      phone: '+91-9876543212',
      name: 'John Manager',
      passwordHash: '$2b$10$example.hash.here',
      roles: ['manager', 'admin'],
      isActive: true,
      lastLoginAt: new Date(),
    },
  });

  const user2 = await prisma.user.create({
    data: {
      tenantId: tenant1.id,
      email: 'sarah.broker@sunrise-properties.com',
      phone: '+91-9876543213',
      name: 'Sarah Broker',
      passwordHash: '$2b$10$example.hash.here',
      roles: ['broker'],
      isActive: true,
      lastLoginAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    },
  });

  const user3 = await prisma.user.create({
    data: {
      tenantId: tenant2.id,
      email: 'mike.admin@metro-housing.com',
      phone: '+91-9876543214',
      name: 'Mike Admin',
      passwordHash: '$2b$10$example.hash.here',
      roles: ['admin', 'owner'],
      isActive: true,
    },
  });

  // Create Properties
  console.log('🏢 Creating properties...');
  const property1 = await prisma.property.create({
    data: {
      tenantId: tenant1.id,
      name: 'Sunrise Apartments',
      address: '789 Residential Area, Bandra, Mumbai',
      pincode: '400050',
      type: 'apartment',
    },
  });

  const property2 = await prisma.property.create({
    data: {
      tenantId: tenant1.id,
      name: 'Golden Heights',
      address: '321 Hill View, Andheri, Mumbai',
      pincode: '400058',
      type: 'apartment',
    },
  });

  const property3 = await prisma.property.create({
    data: {
      tenantId: tenant2.id,
      name: 'Metro Towers',
      address: '654 Central Avenue, Connaught Place, Delhi',
      pincode: '110001',
      type: 'commercial',
    },
  });

  // Create Flats
  console.log('🏠 Creating flats...');
  const flats: any[] = [];

  // Flats for Sunrise Apartments
  for (let i = 1; i <= 10; i++) {
    const flat = await prisma.flat.create({
      data: {
        propertyId: property1.id,
        number: `A-${i.toString().padStart(3, '0')}`,
        floor: Math.ceil(i / 2),
        areaSqFt: 850 + i * 50,
      },
    });
    flats.push(flat);
  }

  // Flats for Golden Heights
  for (let i = 1; i <= 8; i++) {
    const flat = await prisma.flat.create({
      data: {
        propertyId: property2.id,
        number: `B-${i.toString().padStart(3, '0')}`,
        floor: Math.ceil(i / 2),
        areaSqFt: 1200 + i * 100,
      },
    });
    flats.push(flat);
  }

  // Flats for Metro Towers
  for (let i = 1; i <= 6; i++) {
    const flat = await prisma.flat.create({
      data: {
        propertyId: property3.id,
        number: `C-${i.toString().padStart(3, '0')}`,
        floor: Math.ceil(i / 3),
        areaSqFt: 2000 + i * 200,
      },
    });
    flats.push(flat);
  }

  // Create Occupants
  console.log('👨‍👩‍👧‍👦 Creating occupants...');
  const occupants: any[] = [];

  const occupantData = [
    {
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@email.com',
      phone: '+91-9876543220',
    },
    {
      name: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      phone: '+91-9876543221',
    },
    {
      name: 'Amit Patel',
      email: 'amit.patel@email.com',
      phone: '+91-9876543222',
    },
    {
      name: 'Sneha Gupta',
      email: 'sneha.gupta@email.com',
      phone: '+91-9876543223',
    },
    {
      name: 'Vikram Singh',
      email: 'vikram.singh@email.com',
      phone: '+91-9876543224',
    },
    {
      name: 'Anita Desai',
      email: 'anita.desai@email.com',
      phone: '+91-9876543225',
    },
    {
      name: 'Rohit Mehta',
      email: 'rohit.mehta@email.com',
      phone: '+91-9876543226',
    },
    {
      name: 'Kavya Reddy',
      email: 'kavya.reddy@email.com',
      phone: '+91-9876543227',
    },
    {
      name: 'Arjun Nair',
      email: 'arjun.nair@email.com',
      phone: '+91-9876543228',
    },
    {
      name: 'Deepika Joshi',
      email: 'deepika.joshi@email.com',
      phone: '+91-9876543229',
    },
  ];

  for (const data of occupantData) {
    const occupant = await prisma.occupant.create({
      data: {
        ...data,
        aadhaarHash: `hash_${Math.random().toString(36).substring(7)}`,
        panHash: `pan_${Math.random().toString(36).substring(7)}`,
        kycStatus: Math.random() > 0.3 ? 'verified' : 'pending',
      },
    });
    occupants.push(occupant);
  }

  // Create KYC Records
  console.log('📋 Creating KYC records...');
  for (let i = 0; i < occupants.length; i++) {
    await prisma.kycRecord.create({
      data: {
        occupantId: occupants[i].id,
        source: i % 2 === 0 ? 'aadhaar' : 'pan',
        status: occupants[i].kycStatus as any,
        providerJobId: `job_${Math.random().toString(36).substring(7)}`,
        performedById: i < 5 ? user1.id : user2.id,
        completedAt: occupants[i].kycStatus === 'verified' ? new Date() : null,
        meta: {
          documentNumber: `DOC${Math.random().toString(36).substring(7).toUpperCase()}`,
          verificationScore: Math.floor(Math.random() * 100),
        },
      },
    });
  }

  // Create Leases
  console.log('📄 Creating leases...');
  const leases: any[] = [];
  for (let i = 0; i < Math.min(flats.length, occupants.length); i++) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - Math.floor(Math.random() * 12));

    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);

    const lease = await prisma.lease.create({
      data: {
        flatId: flats[i].id,
        occupantId: occupants[i].id,
        startAt: startDate,
        endAt: endDate,
        rentAmount: 15000 + i * 2000,
        securityAmt: 30000 + i * 4000,
        status: Math.random() > 0.2 ? 'active' : 'pending',
      },
    });
    leases.push(lease);
  }

  // Create Agreements
  console.log('📋 Creating agreements...');
  for (let i = 0; i < leases.length; i++) {
    await prisma.agreement.create({
      data: {
        propertyId: flats[i].propertyId,
        occupantId: occupants[i].id,
        leaseId: leases[i].id,
        landlordId: user1.id,
        status: Math.random() > 0.3 ? 'signed' : 'sent',
        startAt: leases[i].startAt,
        endAt: leases[i].endAt,
        rentAmount: leases[i].rentAmount,
        securityAmt: leases[i].securityAmt,
        pdfUrl: `https://storage.example.com/agreements/agreement_${i + 1}.pdf`,
        signatureHash: `sig_${Math.random().toString(36).substring(7)}`,
      },
    });
  }

  // Create Rent Payments
  console.log('💰 Creating rent payments...');
  for (let i = 0; i < leases.length; i++) {
    const lease = leases[i];
    const occupant = occupants[i];

    // Create 6 months of rent payments
    for (let month = 0; month < 6; month++) {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() - (5 - month));
      dueDate.setDate(5); // Due on 5th of each month

      const isLate = Math.random() > 0.7; // 30% chance of late payment
      const isPaid = Math.random() > 0.1; // 90% chance of being paid

      let paidAt: Date | null = null;
      if (isPaid) {
        paidAt = new Date(dueDate);
        if (isLate) {
          paidAt.setDate(paidAt.getDate() + Math.floor(Math.random() * 15) + 5); // 5-20 days late
        } else {
          paidAt.setDate(paidAt.getDate() + Math.floor(Math.random() * 5)); // 0-5 days after due
        }
      }

      await prisma.rentPayment.create({
        data: {
          occupantId: occupant.id,
          leaseId: lease.id,
          amount: lease.rentAmount,
          dueDate,
          paidAt,
          status: isPaid ? 'paid' : 'pending',
          providerTxn: isPaid
            ? {
                transactionId: `txn_${Math.random().toString(36).substring(7)}`,
                gateway: 'razorpay',
                method: 'upi',
              }
            : undefined,
          receiptUrl: isPaid
            ? `https://storage.example.com/receipts/receipt_${i}_${month}.pdf`
            : null,
        },
      });
    }
  }

  // Create Complaints
  console.log('📞 Creating complaints...');
  const complaintTypes = [
    {
      title: 'Water Leakage',
      description: 'Water leaking from bathroom ceiling',
    },
    { title: 'Electricity Issue', description: 'Power outage in kitchen area' },
    {
      title: 'Noise Complaint',
      description: 'Loud music from neighboring flat',
    },
    { title: 'Maintenance Request', description: 'AC not working properly' },
    { title: 'Security Concern', description: 'Main gate lock is broken' },
  ];

  for (let i = 0; i < 15; i++) {
    const complaint = complaintTypes[i % complaintTypes.length];
    const flatIndex = Math.floor(Math.random() * flats.length);

    await prisma.complaint.create({
      data: {
        title: complaint.title,
        description: complaint.description,
        status: ['OPEN', 'IN_PROGRESS', 'RESOLVED'][
          Math.floor(Math.random() * 3)
        ],
        flatId: flats[flatIndex].id,
        raisedById: Math.random() > 0.5 ? user1.id : user2.id,
        assigneeId: user1.id,
        events: {
          created: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        },
      },
    });
  }

  // Create Maintenance Records
  console.log('🔧 Creating maintenance records...');
  const maintenanceTypes = [
    {
      title: 'Monthly Cleaning',
      description: 'Regular cleaning of common areas',
      amount: 2000,
    },
    {
      title: 'Elevator Maintenance',
      description: 'Monthly elevator servicing',
      amount: 5000,
    },
    {
      title: 'Garden Maintenance',
      description: 'Landscaping and garden care',
      amount: 3000,
    },
    {
      title: 'Security Service',
      description: 'Monthly security guard charges',
      amount: 8000,
    },
    {
      title: 'Water Tank Cleaning',
      description: 'Quarterly water tank cleaning',
      amount: 1500,
    },
  ];

  for (let i = 0; i < 20; i++) {
    const maintenance = maintenanceTypes[i % maintenanceTypes.length];
    const flatIndex = Math.floor(Math.random() * flats.length);

    await prisma.maintenance.create({
      data: {
        flatId: flats[flatIndex].id,
        title: maintenance.title,
        description: maintenance.description,
        month: new Date().toISOString().substring(0, 7), // YYYY-MM format
        amount: maintenance.amount,
        paid: Math.random() > 0.3,
        status: ['pending', 'in_progress', 'completed'][
          Math.floor(Math.random() * 3)
        ],
        scheduledAt: new Date(
          Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000,
        ), // Random future date
        completedAt: Math.random() > 0.5 ? new Date() : null,
      },
    });
  }

  // Create Audit Logs
  console.log('📊 Creating audit logs...');
  const services = [
    'payment',
    'tenant',
    'property',
    'maintenance',
    'complaint',
    'user',
  ];
  const actions = ['create', 'update', 'delete', 'view', 'export'];
  const entities = [
    'Tenant',
    'Property',
    'Flat',
    'Occupant',
    'RentPayment',
    'Complaint',
    'Maintenance',
  ];

  for (let i = 0; i < 100; i++) {
    const service = services[Math.floor(Math.random() * services.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const entity = entities[Math.floor(Math.random() * entities.length)];

    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30)); // Random date in last 30 days

    await prisma.auditLog.create({
      data: {
        tenantId: Math.random() > 0.5 ? tenant1.id : tenant2.id,
        userId: [user1.id, user2.id, user3.id][Math.floor(Math.random() * 3)],
        service,
        action,
        entity,
        entityId: `entity_${Math.random().toString(36).substring(7)}`,
        diff: {
          changes: `${action} operation on ${entity}`,
          timestamp: createdAt.toISOString(),
          metadata: {
            userAgent: 'Mozilla/5.0 (compatible; PropertyApp/1.0)',
            ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          },
        },
        createdAt,
      },
    });
  }

  console.log('✅ Database seeding completed successfully!');
  console.log(`
📊 Created:
- ${await prisma.tenant.count()} Tenants
- ${await prisma.user.count()} Users  
- ${await prisma.property.count()} Properties
- ${await prisma.flat.count()} Flats
- ${await prisma.occupant.count()} Occupants
- ${await prisma.kycRecord.count()} KYC Records
- ${await prisma.lease.count()} Leases
- ${await prisma.agreement.count()} Agreements
- ${await prisma.rentPayment.count()} Rent Payments
- ${await prisma.complaint.count()} Complaints
- ${await prisma.maintenance.count()} Maintenance Records
- ${await prisma.auditLog.count()} Audit Logs
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
