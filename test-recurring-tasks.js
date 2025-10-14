// 🧪 Recurring Task Functionality Tests
// Test file for enhanced recurring task due date calculation logic

import { calculateNextDueDate, createNextRecurringOccurrence } from '../utils/helperFunction.js';

// Test data for different recurring patterns
const testRecurrencePatterns = {
  
  // 🔹 Daily Recurring Tests
  daily: {
    frequency: 'daily',
    interval: 2, // Every 2 days
    anchorField: 'startDate'
  },
  
  // 🔹 Weekly Recurring Tests
  weeklySimple: {
    frequency: 'weekly',
    interval: 1, // Every week
    anchorField: 'startDate'
  },
  
  weeklySpecificDays: {
    frequency: 'weekly',
    interval: 1,
    daysOfWeek: [1, 3, 5], // Monday, Wednesday, Friday
    anchorField: 'startDate'
  },
  
  // 🔹 Monthly Recurring Tests
  monthlySimple: {
    frequency: 'monthly',
    interval: 1, // Every month
    anchorField: 'startDate'
  },
  
  monthlySpecificDay: {
    frequency: 'monthly',
    interval: 1,
    dayOfMonth: 15, // 15th of every month
    anchorField: 'startDate'
  },
  
  // 🔹 Yearly Recurring Tests
  yearly: {
    frequency: 'yearly',
    interval: 1,
    anchorField: 'startDate'
  },
  
  // 🔹 Custom Pattern Tests
  customEvery10Days: {
    frequency: 'custom',
    customPattern: {
      type: 'every_n_days',
      days: 10
    },
    anchorField: 'startDate'
  },
  
  customFirstAndFifteenth: {
    frequency: 'custom',
    customPattern: {
      type: 'first_and_fifteenth'
    },
    anchorField: 'startDate'
  },
  
  // 🔹 Completion-based Anchor Tests
  dailyCompletionBased: {
    frequency: 'daily',
    interval: 1,
    anchorField: 'completionDate'
  }
};

// Test function for due date calculations
function testRecurringDueDateCalculations() {
  console.log('🧪 =================================');
  console.log('🧪 RECURRING TASK DUE DATE TESTS');
  console.log('🧪 =================================\n');

  const testDate = new Date('2025-10-15T09:00:00.000Z'); // Tuesday, Oct 15, 2025
  const completionDate = new Date('2025-10-16T14:30:00.000Z'); // Wednesday, Oct 16, 2025

  // Test 1: Daily Recurring (Every 2 days)
  console.log('📅 Test 1: Daily Recurring (Every 2 days)');
  console.log('Start Date:', testDate.toLocaleDateString());
  const dailyNext = calculateNextDueDate(testRecurrencePatterns.daily, testDate);
  console.log('Next Due Date:', dailyNext?.toLocaleDateString());
  console.log('Expected: Oct 17, 2025\n');

  // Test 2: Weekly Recurring (Every week)
  console.log('📅 Test 2: Weekly Recurring (Every week)');
  console.log('Start Date:', testDate.toLocaleDateString());
  const weeklyNext = calculateNextDueDate(testRecurrencePatterns.weeklySimple, testDate);
  console.log('Next Due Date:', weeklyNext?.toLocaleDateString());
  console.log('Expected: Oct 22, 2025\n');

  // Test 3: Weekly with Specific Days (Mon, Wed, Fri)
  console.log('📅 Test 3: Weekly Specific Days (Mon, Wed, Fri)');
  console.log('Start Date:', testDate.toLocaleDateString(), '(Tuesday)');
  const weeklySpecificNext = calculateNextDueDate(testRecurrencePatterns.weeklySpecificDays, testDate);
  console.log('Next Due Date:', weeklySpecificNext?.toLocaleDateString());
  console.log('Expected: Oct 17, 2025 (Next Friday)\n');

  // Test 4: Monthly Recurring
  console.log('📅 Test 4: Monthly Recurring (Same day of month)');
  console.log('Start Date:', testDate.toLocaleDateString());
  const monthlyNext = calculateNextDueDate(testRecurrencePatterns.monthlySimple, testDate);
  console.log('Next Due Date:', monthlyNext?.toLocaleDateString());
  console.log('Expected: Nov 15, 2025\n');

  // Test 5: Monthly with Specific Day (15th)
  console.log('📅 Test 5: Monthly Specific Day (15th of every month)');
  const monthlySpecificNext = calculateNextDueDate(testRecurrencePatterns.monthlySpecificDay, testDate);
  console.log('Next Due Date:', monthlySpecificNext?.toLocaleDateString());
  console.log('Expected: Nov 15, 2025\n');

  // Test 6: Yearly Recurring
  console.log('📅 Test 6: Yearly Recurring');
  console.log('Start Date:', testDate.toLocaleDateString());
  const yearlyNext = calculateNextDueDate(testRecurrencePatterns.yearly, testDate);
  console.log('Next Due Date:', yearlyNext?.toLocaleDateString());
  console.log('Expected: Oct 15, 2026\n');

  // Test 7: Custom Pattern (Every 10 days)
  console.log('📅 Test 7: Custom Pattern (Every 10 days)');
  console.log('Start Date:', testDate.toLocaleDateString());
  const customNext = calculateNextDueDate(testRecurrencePatterns.customEvery10Days, testDate);
  console.log('Next Due Date:', customNext?.toLocaleDateString());
  console.log('Expected: Oct 25, 2025\n');

  // Test 8: Completion-based Anchor
  console.log('📅 Test 8: Completion-based Anchor (Daily)');
  console.log('Start Date:', testDate.toLocaleDateString());
  console.log('Completion Date:', completionDate.toLocaleDateString());
  const completionBasedNext = calculateNextDueDate(
    testRecurrencePatterns.dailyCompletionBased, 
    testDate, 
    'completionDate', 
    completionDate
  );
  console.log('Next Due Date:', completionBasedNext?.toLocaleDateString());
  console.log('Expected: Oct 17, 2025 (Completion + 1 day)\n');

  // Test 9: Edge Case - Month End (January 31st)
  console.log('📅 Test 9: Edge Case - Month End Adjustment');
  const jan31 = new Date('2025-01-31T09:00:00.000Z');
  console.log('Start Date:', jan31.toLocaleDateString(), '(Jan 31)');
  const monthEndNext = calculateNextDueDate(testRecurrencePatterns.monthlySimple, jan31);
  console.log('Next Due Date:', monthEndNext?.toLocaleDateString());
  console.log('Expected: Feb 28, 2025 (Adjusted for February)\n');

  // Test 10: Leap Year Edge Case
  console.log('📅 Test 10: Leap Year Edge Case (Feb 29)');
  const feb29 = new Date('2024-02-29T09:00:00.000Z'); // 2024 is leap year
  console.log('Start Date:', feb29.toLocaleDateString(), '(Feb 29, 2024)');
  const leapYearNext = calculateNextDueDate(testRecurrencePatterns.yearly, feb29);
  console.log('Next Due Date:', leapYearNext?.toLocaleDateString());
  console.log('Expected: Feb 28, 2025 (Non-leap year adjustment)\n');
}

// Test function for recurring task creation
function testRecurringTaskCreation() {
  console.log('🧪 =====================================');
  console.log('🧪 RECURRING TASK CREATION TESTS');
  console.log('🧪 =====================================\n');

  const sampleTask = {
    _id: 'test-task-id-123',
    title: 'Weekly Team Meeting',
    description: 'Regular team sync meeting',
    isRecurring: true,
    recurrencePattern: {
      frequency: 'weekly',
      interval: 1,
      daysOfWeek: [2], // Tuesday
      anchorField: 'startDate'
    },
    dueDate: new Date('2025-10-15T10:00:00.000Z'),
    startDate: new Date('2025-10-15T10:00:00.000Z'),
    status: 'completed',
    priority: 'medium',
    createdBy: 'user-123',
    assignedTo: 'user-456',
    tags: ['meeting', 'weekly'],
    comments: [
      { _id: '1', text: 'Initial task created', author: 'user-123' }
    ]
  };

  console.log('🔄 Creating next occurrence for completed task:');
  console.log('Original Task:', {
    title: sampleTask.title,
    dueDate: sampleTask.dueDate.toLocaleDateString(),
    status: sampleTask.status
  });

  const nextOccurrence = createNextRecurringOccurrence(sampleTask, new Date('2025-10-15T11:30:00.000Z'));

  if (nextOccurrence) {
    console.log('\n✅ Next Occurrence Created:');
    console.log('Title:', nextOccurrence.title);
    console.log('Due Date:', nextOccurrence.dueDate?.toLocaleDateString());
    console.log('Status:', nextOccurrence.status);
    console.log('Comments Reset:', nextOccurrence.comments.length === 0 ? 'Yes' : 'No');
    console.log('Next Next Due Date:', nextOccurrence.nextDueDate?.toLocaleDateString());
    console.log('Expected Next Due: Oct 22, 2025 (Next Tuesday)\n');
  } else {
    console.log('❌ Failed to create next occurrence\n');
  }
}

// Test function for end conditions
function testEndConditions() {
  console.log('🧪 ==============================');
  console.log('🧪 RECURRENCE END CONDITION TESTS');
  console.log('🧪 ==============================\n');

  // Test with end date
  console.log('📅 Test: End Date Condition');
  const patternWithEndDate = {
    frequency: 'daily',
    interval: 1,
    endDate: new Date('2025-10-20T23:59:59.000Z')
  };

  const testDateAfterEnd = new Date('2025-10-21T09:00:00.000Z');
  const resultAfterEnd = calculateNextDueDate(patternWithEndDate, testDateAfterEnd);
  
  console.log('Current Date:', testDateAfterEnd.toLocaleDateString());
  console.log('End Date:', patternWithEndDate.endDate.toLocaleDateString());
  console.log('Next Due Date:', resultAfterEnd ? resultAfterEnd.toLocaleDateString() : 'null (ended)');
  console.log('Expected: null (recurrence ended)\n');
}

// Main test runner
function runAllTests() {
  console.log('🚀 Starting Recurring Task Tests...\n');
  
  try {
    testRecurringDueDateCalculations();
    testRecurringTaskCreation();
    testEndConditions();
    
    console.log('✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// API endpoint test function
async function testRecurringTaskAPIs() {
  console.log('🌐 API Endpoint Tests (Manual Testing Guide)');
  console.log('==========================================\n');
  
  console.log('1. Create Recurring Task:');
  console.log('POST /api/create-task');
  console.log('Body: {');
  console.log('  "title": "Daily Standup",');
  console.log('  "taskType": "recurring",');
  console.log('  "dueDate": "2025-10-15T09:00:00.000Z",');
  console.log('  "recurrencePattern": {');
  console.log('    "frequency": "daily",');
  console.log('    "interval": 1,');
  console.log('    "anchorField": "startDate"');
  console.log('  }');
  console.log('}\n');
  
  console.log('2. Complete Recurring Task (Triggers Next Occurrence):');
  console.log('PUT /api/tasks/{taskId}/status');
  console.log('Body: { "status": "completed" }\n');
  
  console.log('3. Skip Next Occurrence:');
  console.log('POST /api/tasks/{taskId}/recurring/skip');
  console.log('Body: { "reason": "Holiday - office closed" }\n');
  
  console.log('4. Stop Recurring Sequence:');
  console.log('POST /api/tasks/{taskId}/recurring/stop');
  console.log('Body: { "reason": "Project completed" }\n');
  
  console.log('5. Generate Scheduled Tasks (Cron Job):');
  console.log('POST /api/recurring-tasks/generate');
  console.log('Body: {} (empty)\n');
}

// Export test functions
export { 
  runAllTests, 
  testRecurringDueDateCalculations, 
  testRecurringTaskCreation, 
  testEndConditions,
  testRecurringTaskAPIs 
};

// If running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
  testRecurringTaskAPIs();
}