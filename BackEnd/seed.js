const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('./models/User');
const Followup = require('./models/Followup');

function d(iso) {
  return iso ? new Date(iso) : null;
}

async function main() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/purchase_followup';
  await mongoose.connect(mongoUri);

  // --- Seed users ---
  const usersToEnsure = [
    { username: 'rupak', password: 'rupak123', role: 'rupak', displayName: 'Rupak (Purchase Accountant)' },
    { username: 'anindita', password: 'anindita123', role: 'anindita', displayName: 'Anindita (Process Coordinator)' },
  ];

  for (const u of usersToEnsure) {
    const existing = await User.findOne({ username: u.username });
    if (!existing) {
      const passwordHash = await bcrypt.hash(u.password, 10);
      await User.create({ username: u.username, passwordHash, role: u.role, displayName: u.displayName });
      console.log('Created user:', u.username);
    }
  }

  // --- Seed followups if empty ---
  const count = await Followup.countDocuments();
  if (count === 0) {
    const now = new Date();

    const pcBase = [
      {
        site: 'HIPL', uniqueId: 'DEMO-PC-001', indentNumber: 'IN-3002', itemNumber: '8', item: 'Cable Glands',
        description: 'For MV cable termination', uom: 'NOS', totalQty: 120, submittedBy: 'Rafiq',
        vendorName: 'Star Fittings', leadDays: 9, paymentCondition: 'Against commissioning',
        poNumber: 'PO-DEMO-PC-001', poDate: d('2025-12-06T00:00:00.000Z'), timestamp: d('2025-12-05T10:00:00.000Z'),
      },
      {
        site: 'SUNAGROW', uniqueId: 'DEMO-PC-002', indentNumber: 'IN-5001', itemNumber: '11', item: 'Solar Cable',
        description: 'DC cable for PV array', uom: 'MTR', totalQty: 500, submittedBy: 'Ritika',
        vendorName: 'GreenWire', leadDays: 14, paymentCondition: 'Against PI',
        poNumber: 'PO-DEMO-PC-002', poDate: d('2025-12-08T00:00:00.000Z'), timestamp: d('2025-12-08T09:30:00.000Z'),
      },
      {
        site: 'HRM', uniqueId: 'DEMO-PC-003', indentNumber: 'IN-5002', itemNumber: '12', item: 'Motor',
        description: 'Spare for conveyor', uom: 'NOS', totalQty: 2, submittedBy: 'Meera',
        vendorName: 'Power Motors', leadDays: 18, paymentCondition: '30 days credit',
        poNumber: 'PO-DEMO-PC-003', poDate: d('2025-12-09T00:00:00.000Z'), timestamp: d('2025-12-09T11:00:00.000Z'),
      },
    ];

    // Create PC followup rows for form 1/2/3 (same purchase rows, different stage)
    const pcDocs = [];
    for (const base of pcBase) {
      pcDocs.push({ type: 'pc', formNumber: 1, ...base, status: 'PENDING' });
      pcDocs.push({ type: 'pc', formNumber: 2, ...base, status: 'PENDING' });
      pcDocs.push({ type: 'pc', formNumber: 3, ...base, status: 'PENDING' });
    }

    const paymentBase = [
      {
        site: 'HIPL', uniqueId: 'DEMO-PAY-001', indentNumber: 'IN-7001', itemNumber: '1', item: 'Control Panel',
        description: 'MCC panel for new line', uom: 'SET', totalQty: 1, submittedBy: 'Arjun',
        vendorName: 'PowerTech', leadDays: 12, poNumber: 'PO-HI-1001',
        poDate: d('2025-12-05T00:00:00.000Z'),
        materialReceivedActualDate: d('2025-12-10T00:00:00.000Z'),
        timestamp: d('2025-12-05T10:00:00.000Z'),
      },
      {
        site: 'RSIPL', uniqueId: 'DEMO-PAY-002', indentNumber: 'IN-7002', itemNumber: '2', item: 'VFD Panel',
        description: 'For mixer drive', uom: 'SET', totalQty: 1, submittedBy: 'Sumit',
        vendorName: 'Motion Drives', leadDays: 20, poNumber: 'PO-RS-2002',
        poDate: d('2025-12-07T00:00:00.000Z'),
        materialReceivedActualDate: d('2025-12-12T00:00:00.000Z'),
        timestamp: d('2025-12-07T09:00:00.000Z'),
      },
    ];

    const paymentDocs = [];
    // For each base, create records for each formNumber + different paymentCondition codes so routing works
    for (const base of paymentBase) {
      paymentDocs.push({ type: 'payment', formNumber: 1, ...base, paymentCondition: 'After_Receive' });
      paymentDocs.push({ type: 'payment', formNumber: 2, ...base, paymentCondition: 'PWP_BBD' });
      paymentDocs.push({ type: 'payment', formNumber: 3, ...base, paymentCondition: 'Before_Dispatch' });
      paymentDocs.push({ type: 'payment', formNumber: 4, ...base, paymentCondition: 'PWP_BBD_PAPW' });
      // Additional mixed conditions
      paymentDocs.push({ type: 'payment', formNumber: 1, ...base, uniqueId: base.uniqueId + '-FAR', paymentCondition: 'PWP_BBD_FAR' });
    }

    await Followup.insertMany([...pcDocs, ...paymentDocs]);
    console.log('Seeded followups:', pcDocs.length + paymentDocs.length);
  } else {
    console.log('Followups already exist, skipping seed. Count:', count);
  }

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
