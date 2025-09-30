#!/usr/bin/env node

/**
 * Script to seed the database with license plans and features
 * Run with: node server/scripts/seed-license-data.js
 */

import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { LICENSE_PLANS, SYSTEM_FEATURES, LICENSE_FEATURE_MAPPING } from '../data/enhancedLicenseData.js';

// Load environment variables from .env file
dotenv.config();

const MONGODB_URI = process.env.DATABASE_URL || "mongodb://localhost:27017/admin-task-manager";

async function seedLicenseData() {
  console.log('🌱 Starting license data seeding...');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    
    // Clear existing data
    console.log('🗑️  Clearing existing license data...');
    await db.collection('licenses').deleteMany({});
    await db.collection('features').deleteMany({});
    await db.collection('licensefeatures').deleteMany({});
    
    // Seed License Plans
    console.log('📦 Seeding license plans...');
    const licenseResult = await db.collection('licenses').insertMany(LICENSE_PLANS);
    console.log(`✅ Inserted ${licenseResult.insertedCount} license plans`);
    
    // Seed Features
    console.log('🔧 Seeding system features...');
    const featureResult = await db.collection('features').insertMany(SYSTEM_FEATURES);
    console.log(`✅ Inserted ${featureResult.insertedCount} system features`);
    
    // Seed License-Feature Mappings
    console.log('🔗 Seeding license-feature mappings...');
    
    // Transform LICENSE_FEATURE_MAPPING to simpler format for the existing API
    const simplifiedMappings = LICENSE_FEATURE_MAPPING
      .filter(mapping => mapping.is_enabled) // Only include enabled features
      .map(mapping => ({
        license_code: mapping.license_code,
        feature_code: mapping.feature_code,
        usage_limit: mapping.limit_value === null ? -1 : mapping.limit_value, // -1 for unlimited
        is_enabled: mapping.is_enabled
      }));
    
    const mappingResult = await db.collection('licensefeatures').insertMany(simplifiedMappings);
    console.log(`✅ Inserted ${mappingResult.insertedCount} license-feature mappings`);
    
    console.log('🎉 License data seeding completed successfully!');
    
    // Display summary
    console.log('\n📊 Summary:');
    console.log(`   License Plans: ${licenseResult.insertedCount}`);
    console.log(`   System Features: ${featureResult.insertedCount}`);
    console.log(`   Feature Mappings: ${mappingResult.insertedCount}`);
    
  } catch (error) {
    console.error('❌ Error seeding license data:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
seedLicenseData().catch(console.error);