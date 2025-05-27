// scripts/create-global-admin.mjs
import { PrismaClient } from '@prisma/client';
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// Initialize Firebase Admin SDK
const serviceAccountPath = path.resolve(
  process.cwd(),
  './api/firebase-admin-sdk.json'
);
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const prisma = new PrismaClient();

async function main() {
  // Create the Global Admin role
  const globalAdminRole = await prisma.role.create({
    data: {
      name: 'Global Admin',
      description: 'Administrator with full access across all Dealer Groups and Dealerships',
    },
  });
  console.log('Created Global Admin Role:', globalAdminRole);

  // Create a Global Admin user in Firebase
  const firebaseUser = await admin.auth().createUser({
    email: '', // Update with the desired admin email
    password: '', // Update with a secure password
    displayName: 'Global Admin',
  });

  console.log('Created Global Admin Firebase User:', firebaseUser);

  // Create a Global Admin user in Prisma
  const globalAdminUser = await prisma.user.create({
    data: {
      first_name: 'Global',
      last_name: 'Admin',
      email: firebaseUser.email,
      firebaseUid: firebaseUser.uid,
      primary_dealership_id: null, // Assuming global users are not tied to a specific dealership; adjust if needed
      roles: {
        create: {
          role_id: globalAdminRole.id,
        },
      },
    },
  });

  console.log('Created Global Admin User in SQL:', globalAdminUser);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
