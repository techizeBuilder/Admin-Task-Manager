// License pool management
const licensePool = {
  'Explore (Free)': { total: 10, used: 1, available: 9 },
  'Plan': { total: 5, used: 1, available: 4 },
  'Execute': { total: 3, used: 1, available: 2 },
  'Optimize': { total: 2, used: 1, available: 1 }
};

export async function checkLicenseAvailability(licenseType) {
  // In a real implementation, this would check the database
  return licensePool[licenseType] && licensePool[licenseType].available > 0;
}

export async function allocateLicense(licenseType) {
  if (!await checkLicenseAvailability(licenseType)) {
    throw new Error(`License type "${licenseType}" is not available`);
  }

  licensePool[licenseType].used += 1;
  licensePool[licenseType].available -= 1;
  return true;
}

export async function deallocateLicense(licenseType) {
  if (!licensePool[licenseType]) {
    throw new Error(`Invalid license type "${licenseType}"`);
  }

  licensePool[licenseType].used -= 1;
  licensePool[licenseType].available += 1;
  return true;
}

export async function getLicensePool() {
  return { ...licensePool };
}
