// User Data Manager - Manages static user data for demonstration
// Based on the data structure requirements from the specification

// License Pool Management
let licensePool = {
  'Explore (Free)': { total: 10, used: 1, available: 9 },
  'Plan': { total: 5, used: 1, available: 4 },
  'Execute': { total: 3, used: 1, available: 2 },
  'Optimize': { total: 2, used: 1, available: 1 }
};

// Static User Data - Following the use case examples from specification
let userData = [
  {
    id: '1',
    name: 'Priya Sharma',
    email: 'priya@company.com',
    role: 'Company Admin',
    licenseId: 'Optimize',
    department: 'Administration',
    designation: 'Admin Manager', 
    location: 'Mumbai',
    status: 'Active',
    dateCreated: '2024-01-15T00:00:00.000Z',
    lastLogin: '2025-09-05T10:30:00.000Z',
    tasksAssigned: 25,
    tasksCompleted: 22,
    formsCreated: 8,
    activeProcesses: 3
  },
  {
    id: '2', 
    name: 'Arjun Mehta',
    email: 'arjun@company.com',
    role: 'Manager',
    licenseId: 'Execute',
    department: 'Operations',
    designation: 'Operations Manager',
    location: 'Delhi',
    status: 'Active',
    dateCreated: '2024-02-10T00:00:00.000Z',
    lastLogin: '2025-09-04T15:45:00.000Z',
    tasksAssigned: 18,
    tasksCompleted: 16,
    formsCreated: 5,
    activeProcesses: 2
  },
  {
    id: '3',
    name: 'Rohan Kumar', 
    email: 'rohan@company.com',
    role: 'Regular User',
    licenseId: 'Plan',
    department: 'Development',
    designation: 'Software Developer',
    location: 'Bangalore', 
    status: 'Inactive',
    dateCreated: '2024-03-05T00:00:00.000Z',
    lastLogin: '2025-08-15T12:00:00.000Z',
    tasksAssigned: 12,
    tasksCompleted: 8,
    formsCreated: 2,
    activeProcesses: 4
  },
  {
    id: '4',
    name: 'Sneha Patel',
    email: 'sneha@company.com', 
    role: 'Regular User',
    licenseId: 'Explore (Free)',
    department: 'Marketing',
    designation: 'Marketing Executive',
    location: 'Pune',
    status: 'Pending',
    dateCreated: '2025-09-03T00:00:00.000Z',
    lastLogin: null,
    tasksAssigned: 3,
    tasksCompleted: 0,
    formsCreated: 0,
    activeProcesses: 3
  },
  {
    id: '1',
    name: 'Priya Sharma',
    email: 'priya@company.com',
    role: 'Company Admin',
    licenseId: 'Optimize',
    department: 'Administration',
    designation: 'Admin Manager', 
    location: 'Mumbai',
    status: 'Active',
    dateCreated: '2024-01-15T00:00:00.000Z',
    lastLogin: '2025-09-05T10:30:00.000Z',
    tasksAssigned: 25,
    tasksCompleted: 22,
    formsCreated: 8,
    activeProcesses: 3
  },
  {
    id: '2', 
    name: 'Arjun Mehta',
    email: 'arjun@company.com',
    role: 'Manager',
    licenseId: 'Execute',
    department: 'Operations',
    designation: 'Operations Manager',
    location: 'Delhi',
    status: 'Active',
    dateCreated: '2024-02-10T00:00:00.000Z',
    lastLogin: '2025-09-04T15:45:00.000Z',
    tasksAssigned: 18,
    tasksCompleted: 16,
    formsCreated: 5,
    activeProcesses: 2
  },
  {
    id: '3',
    name: 'Rohan Kumar', 
    email: 'rohan@company.com',
    role: 'Regular User',
    licenseId: 'Plan',
    department: 'Development',
    designation: 'Software Developer',
    location: 'Bangalore', 
    status: 'Inactive',
    dateCreated: '2024-03-05T00:00:00.000Z',
    lastLogin: '2025-08-15T12:00:00.000Z',
    tasksAssigned: 12,
    tasksCompleted: 8,
    formsCreated: 2,
    activeProcesses: 4
  },
  {
    id: '4',
    name: 'Sneha Patel',
    email: 'sneha@company.com', 
    role: 'Regular User',
    licenseId: 'Explore (Free)',
    department: 'Marketing',
    designation: 'Marketing Executive',
    location: 'Pune',
    status: 'Pending',
    dateCreated: '2025-09-03T00:00:00.000Z',
    lastLogin: null,
    tasksAssigned: 3,
    tasksCompleted: 0,
    formsCreated: 0,
    activeProcesses: 3
  },{
    id: '1',
    name: 'Priya Sharma',
    email: 'priya@company.com',
    role: 'Company Admin',
    licenseId: 'Optimize',
    department: 'Administration',
    designation: 'Admin Manager', 
    location: 'Mumbai',
    status: 'Active',
    dateCreated: '2024-01-15T00:00:00.000Z',
    lastLogin: '2025-09-05T10:30:00.000Z',
    tasksAssigned: 25,
    tasksCompleted: 22,
    formsCreated: 8,
    activeProcesses: 3
  },
  {
    id: '2', 
    name: 'Arjun Mehta',
    email: 'arjun@company.com',
    role: 'Manager',
    licenseId: 'Execute',
    department: 'Operations',
    designation: 'Operations Manager',
    location: 'Delhi',
    status: 'Active',
    dateCreated: '2024-02-10T00:00:00.000Z',
    lastLogin: '2025-09-04T15:45:00.000Z',
    tasksAssigned: 18,
    tasksCompleted: 16,
    formsCreated: 5,
    activeProcesses: 2
  },
  {
    id: '3',
    name: 'Rohan Kumar', 
    email: 'rohan@company.com',
    role: 'Regular User',
    licenseId: 'Plan',
    department: 'Development',
    designation: 'Software Developer',
    location: 'Bangalore', 
    status: 'Inactive',
    dateCreated: '2024-03-05T00:00:00.000Z',
    lastLogin: '2025-08-15T12:00:00.000Z',
    tasksAssigned: 12,
    tasksCompleted: 8,
    formsCreated: 2,
    activeProcesses: 4
  },
  {
    id: '4',
    name: 'Sneha Patel',
    email: 'sneha@company.com', 
    role: 'Regular User',
    licenseId: 'Explore (Free)',
    department: 'Marketing',
    designation: 'Marketing Executive',
    location: 'Pune',
    status: 'Pending',
    dateCreated: '2025-09-03T00:00:00.000Z',
    lastLogin: null,
    tasksAssigned: 3,
    tasksCompleted: 0,
    formsCreated: 0,
    activeProcesses: 3
  },{
    id: '1',
    name: 'Priya Sharma',
    email: 'priya@company.com',
    role: 'Company Admin',
    licenseId: 'Optimize',
    department: 'Administration',
    designation: 'Admin Manager', 
    location: 'Mumbai',
    status: 'Active',
    dateCreated: '2024-01-15T00:00:00.000Z',
    lastLogin: '2025-09-05T10:30:00.000Z',
    tasksAssigned: 25,
    tasksCompleted: 22,
    formsCreated: 8,
    activeProcesses: 3
  },
  {
    id: '2', 
    name: 'Arjun Mehta',
    email: 'arjun@company.com',
    role: 'Manager',
    licenseId: 'Execute',
    department: 'Operations',
    designation: 'Operations Manager',
    location: 'Delhi',
    status: 'Active',
    dateCreated: '2024-02-10T00:00:00.000Z',
    lastLogin: '2025-09-04T15:45:00.000Z',
    tasksAssigned: 18,
    tasksCompleted: 16,
    formsCreated: 5,
    activeProcesses: 2
  },
  {
    id: '3',
    name: 'Rohan Kumar', 
    email: 'rohan@company.com',
    role: 'Regular User',
    licenseId: 'Plan',
    department: 'Development',
    designation: 'Software Developer',
    location: 'Bangalore', 
    status: 'Inactive',
    dateCreated: '2024-03-05T00:00:00.000Z',
    lastLogin: '2025-08-15T12:00:00.000Z',
    tasksAssigned: 12,
    tasksCompleted: 8,
    formsCreated: 2,
    activeProcesses: 4
  },
  {
    id: '4',
    name: 'Sneha Patel',
    email: 'sneha@company.com', 
    role: 'Regular User',
    licenseId: 'Explore (Free)',
    department: 'Marketing',
    designation: 'Marketing Executive',
    location: 'Pune',
    status: 'Pending',
    dateCreated: '2025-09-03T00:00:00.000Z',
    lastLogin: null,
    tasksAssigned: 3,
    tasksCompleted: 0,
    formsCreated: 0,
    activeProcesses: 3
  },{
    id: '1',
    name: 'Priya Sharma',
    email: 'priya@company.com',
    role: 'Company Admin',
    licenseId: 'Optimize',
    department: 'Administration',
    designation: 'Admin Manager', 
    location: 'Mumbai',
    status: 'Active',
    dateCreated: '2024-01-15T00:00:00.000Z',
    lastLogin: '2025-09-05T10:30:00.000Z',
    tasksAssigned: 25,
    tasksCompleted: 22,
    formsCreated: 8,
    activeProcesses: 3
  },
  {
    id: '2', 
    name: 'Arjun Mehta',
    email: 'arjun@company.com',
    role: 'Manager',
    licenseId: 'Execute',
    department: 'Operations',
    designation: 'Operations Manager',
    location: 'Delhi',
    status: 'Active',
    dateCreated: '2024-02-10T00:00:00.000Z',
    lastLogin: '2025-09-04T15:45:00.000Z',
    tasksAssigned: 18,
    tasksCompleted: 16,
    formsCreated: 5,
    activeProcesses: 2
  },
  {
    id: '3',
    name: 'Rohan Kumar', 
    email: 'rohan@company.com',
    role: 'Regular User',
    licenseId: 'Plan',
    department: 'Development',
    designation: 'Software Developer',
    location: 'Bangalore', 
    status: 'Inactive',
    dateCreated: '2024-03-05T00:00:00.000Z',
    lastLogin: '2025-08-15T12:00:00.000Z',
    tasksAssigned: 12,
    tasksCompleted: 8,
    formsCreated: 2,
    activeProcesses: 4
  },
  {
    id: '4',
    name: 'Sneha Patel',
    email: 'sneha@company.com', 
    role: 'Regular User',
    licenseId: 'Explore (Free)',
    department: 'Marketing',
    designation: 'Marketing Executive',
    location: 'Pune',
    status: 'Pending',
    dateCreated: '2025-09-03T00:00:00.000Z',
    lastLogin: null,
    tasksAssigned: 3,
    tasksCompleted: 0,
    formsCreated: 0,
    activeProcesses: 3
  },{
    id: '1',
    name: 'Priya Sharma',
    email: 'priya@company.com',
    role: 'Company Admin',
    licenseId: 'Optimize',
    department: 'Administration',
    designation: 'Admin Manager', 
    location: 'Mumbai',
    status: 'Active',
    dateCreated: '2024-01-15T00:00:00.000Z',
    lastLogin: '2025-09-05T10:30:00.000Z',
    tasksAssigned: 25,
    tasksCompleted: 22,
    formsCreated: 8,
    activeProcesses: 3
  },
  {
    id: '2', 
    name: 'Arjun Mehta',
    email: 'arjun@company.com',
    role: 'Manager',
    licenseId: 'Execute',
    department: 'Operations',
    designation: 'Operations Manager',
    location: 'Delhi',
    status: 'Active',
    dateCreated: '2024-02-10T00:00:00.000Z',
    lastLogin: '2025-09-04T15:45:00.000Z',
    tasksAssigned: 18,
    tasksCompleted: 16,
    formsCreated: 5,
    activeProcesses: 2
  },
  {
    id: '3',
    name: 'Rohan Kumar', 
    email: 'rohan@company.com',
    role: 'Regular User',
    licenseId: 'Plan',
    department: 'Development',
    designation: 'Software Developer',
    location: 'Bangalore', 
    status: 'Inactive',
    dateCreated: '2024-03-05T00:00:00.000Z',
    lastLogin: '2025-08-15T12:00:00.000Z',
    tasksAssigned: 12,
    tasksCompleted: 8,
    formsCreated: 2,
    activeProcesses: 4
  },
  {
    id: '4',
    name: 'Sneha Patel',
    email: 'sneha@company.com', 
    role: 'Regular User',
    licenseId: 'Explore (Free)',
    department: 'Marketing',
    designation: 'Marketing Executive',
    location: 'Pune',
    status: 'Pending',
    dateCreated: '2025-09-03T00:00:00.000Z',
    lastLogin: null,
    tasksAssigned: 3,
    tasksCompleted: 0,
    formsCreated: 0,
    activeProcesses: 3
  }
];

// Field validation rules based on specification
export const VALIDATION_RULES = {
  name: { required: true, maxLength: 50 },
  email: { required: true, unique: true },
  role: { required: true, enum: ['Regular User', 'Manager', 'Company Admin'] },
  licenseId: { required: true },
  department: { required: false, maxLength: 50 },
  designation: { required: false, maxLength: 50 },
  location: { required: false, maxLength: 50 },
  status: { required: true, enum: ['Active', 'Inactive', 'Pending'] }
};

// Available roles
export const USER_ROLES = [
  'Regular User',
  'Manager', 
  'Company Admin'
];

// Available license types
export const LICENSE_TYPES = [
  'Explore (Free)',
  'Plan',
  'Execute',
  'Optimize'
];

// System behaviors implementation

class UserDataManager {
  constructor() {
    this.users = [...userData];
    this.licenses = { ...licensePool };
  }

  // Get all users
  getAllUsers() {
    return [...this.users];
  }

  // Get user by ID
  getUserById(id) {
    return this.users.find(user => user.id === id);
  }

  // Get user by email (for uniqueness validation)
  getUserByEmail(email) {
    return this.users.find(user => user.email.toLowerCase() === email.toLowerCase());
  }

  // Get license pool status
  getLicensePool() {
    return { ...this.licenses };
  }

  // Check if license is available
  isLicenseAvailable(licenseType) {
    return this.licenses[licenseType] && this.licenses[licenseType].available > 0;
  }

  // Validate user data
  validateUser(userData, isUpdate = false, currentUserId = null) {
    const errors = {};

    // Name validation
    if (!userData.name || userData.name.trim() === '') {
      errors.name = 'Name is required';
    } else if (userData.name.length > 50) {
      errors.name = 'Name must be less than 50 characters';
    }

    // Email validation
    if (!userData.email || userData.email.trim() === '') {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        errors.email = 'Please enter a valid email address';
      } else {
        // Check uniqueness (skip current user for updates)
        const existingUser = this.getUserByEmail(userData.email);
        if (existingUser && (!isUpdate || existingUser.id !== currentUserId)) {
          errors.email = 'Email address is already registered';
        }
      }
    }

    // Role validation
    if (!userData.role) {
      errors.role = 'Role selection is required';
    } else if (!USER_ROLES.includes(userData.role)) {
      errors.role = 'Invalid role selected';
    }

    // License validation
    if (!userData.licenseId) {
      errors.licenseId = 'License selection is required';
    } else if (!LICENSE_TYPES.includes(userData.licenseId)) {
      errors.licenseId = 'Invalid license type selected';
    } else if (!isUpdate && !this.isLicenseAvailable(userData.licenseId)) {
      errors.licenseId = 'Selected license type is not available';
    }

    // Optional field validations
    if (userData.department && userData.department.length > 50) {
      errors.department = 'Department must be less than 50 characters';
    }
    if (userData.designation && userData.designation.length > 50) {
      errors.designation = 'Designation must be less than 50 characters';
    }
    if (userData.location && userData.location.length > 50) {
      errors.location = 'Location must be less than 50 characters';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Add new user (UC-8.1: Adding a New User)
  addUser(newUserData) {
    const validation = this.validateUser(newUserData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
    }

    // Check license availability
    if (!this.isLicenseAvailable(newUserData.licenseId)) {
      throw new Error(`License type "${newUserData.licenseId}" is not available`);
    }

    // Generate new user ID
    const newId = (Math.max(...this.users.map(u => parseInt(u.id))) + 1).toString();

    const user = {
      id: newId,
      name: newUserData.name.trim(),
      email: newUserData.email.toLowerCase().trim(),
      role: newUserData.role,
      licenseId: newUserData.licenseId,
      department: newUserData.department?.trim() || '',
      designation: newUserData.designation?.trim() || '',
      location: newUserData.location?.trim() || '',
      status: 'Pending', // New users start as Pending
      dateCreated: new Date().toISOString(),
      lastLogin: null,
      tasksAssigned: 0,
      tasksCompleted: 0,
      formsCreated: 0,
      activeProcesses: 0
    };

    // Add user to list
    this.users.push(user);

    // Decrease available license count
    this.licenses[newUserData.licenseId].used += 1;
    this.licenses[newUserData.licenseId].available -= 1;

    return user;
  }

  // Update existing user (UC-8.2: Editing User Role)
  updateUser(userId, updatedData) {
    const user = this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const validation = this.validateUser(updatedData, true, userId);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
    }

    const oldLicense = user.licenseId;
    const newLicense = updatedData.licenseId;

    // Check if license change requires availability check
    if (oldLicense !== newLicense && !this.isLicenseAvailable(newLicense)) {
      throw new Error(`License type "${newLicense}" is not available`);
    }

    // Update user data
    Object.assign(user, {
      name: updatedData.name.trim(),
      role: updatedData.role,
      licenseId: updatedData.licenseId,
      department: updatedData.department?.trim() || '',
      designation: updatedData.designation?.trim() || '',
      location: updatedData.location?.trim() || ''
    });

    // Update license counts if license changed
    if (oldLicense !== newLicense) {
      // Free old license
      this.licenses[oldLicense].used -= 1;
      this.licenses[oldLicense].available += 1;
      
      // Assign new license
      this.licenses[newLicense].used += 1;
      this.licenses[newLicense].available -= 1;
    }

    return user;
  }

  // Deactivate user (UC-8.3: Deactivating a User)
  deactivateUser(userId) {
    const user = this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.status === 'Inactive') {
      throw new Error('User is already inactive');
    }

    user.status = 'Inactive';
    // Note: License is NOT freed on deactivation as per specification
    return user;
  }

  // Reactivate user
  reactivateUser(userId) {
    const user = this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.status === 'Active') {
      throw new Error('User is already active');
    }

    user.status = 'Active';

    // Check if last login > 90 days ago and resend invitation email if needed
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    if (!user.lastLogin || new Date(user.lastLogin) < ninetyDaysAgo) {
      // In a real system, this would trigger email sending
      console.log(`Reactivation: Invitation email would be sent to ${user.email}`);
    }

    return user;
  }

  // Remove user (UC-8.4: Removing a User and Freeing License)
  removeUser(userId) {
    const user = this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user has active processes - prevent removal if they do
    if (user.activeProcesses > 0) {
      throw new Error(`Cannot remove user. They have ${user.activeProcesses} active task(s). Please reassign tasks before removal.`);
    }

    // Remove user from list
    this.users = this.users.filter(u => u.id !== userId);

    // Free the license
    this.licenses[user.licenseId].used -= 1;
    this.licenses[user.licenseId].available += 1;

    return user;
  }

  // Activate pending user (when they accept invitation)
  activateUser(userId) {
    const user = this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.status !== 'Pending') {
      throw new Error('User is not in pending status');
    }

    user.status = 'Active';
    user.lastLogin = new Date().toISOString();
    return user;
  }

  // Get user statistics
  getUserStats() {
    const stats = {
      total: this.users.length,
      active: this.users.filter(u => u.status === 'Active').length,
      inactive: this.users.filter(u => u.status === 'Inactive').length,
      pending: this.users.filter(u => u.status === 'Pending').length
    };

    return stats;
  }

  // Export user data for CSV
  exportUserData() {
    return this.users.map(user => ({
      Name: user.name,
      Email: user.email,
      Role: user.role,
      License: user.licenseId,
      Department: user.department || 'N/A',
      Designation: user.designation || 'N/A',
      Location: user.location || 'N/A',
      Status: user.status,
      'Date Joined': new Date(user.dateCreated).toLocaleDateString(),
      'Last Login': user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never',
      'Tasks Assigned': user.tasksAssigned,
      'Tasks Completed': user.tasksCompleted,
      'Forms Created': user.formsCreated,
      'Active Processes': user.activeProcesses,
      'Completion Rate': user.tasksAssigned > 0 ? `${((user.tasksCompleted / user.tasksAssigned) * 100).toFixed(1)}%` : '0%'
    }));
  }
}

// Create singleton instance
const userDataManager = new UserDataManager();

export default userDataManager;