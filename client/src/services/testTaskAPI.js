// API Testing Helper
export const testTaskCreation = async () => {
    const sampleTaskData = {
        taskName: "Test Task from Form",
        description: "This is a test task created using the form",
        priority: { value: "High", label: "High" },
        assignedTo: { value: "self", label: "Self" },
        dueDate: "2025-09-25",
        visibility: "private",
        tags: [
            { value: "urgent", label: "Urgent" },
            { value: "test", label: "Test" }
        ],
        taskType: { value: "regular", label: "Regular" },
        attachments: []
    };

    try {
        const { taskService } = await import('./taskService');
        const response = await taskService.createTask({
            title: sampleTaskData.taskName,
            description: sampleTaskData.description,
            priority: sampleTaskData.priority.value,
            assignedTo: sampleTaskData.assignedTo.value,
            dueDate: new Date(sampleTaskData.dueDate).toISOString(),
            visibility: sampleTaskData.visibility,
            tags: sampleTaskData.tags.map(tag => tag.value),
            taskType: sampleTaskData.taskType.value,
            createdByRole: 'individual',
            status: 'todo',
            attachments: []
        });

        console.log('✅ Task created successfully:', response);
        return response;
    } catch (error) {
        console.error('❌ Task creation failed:', error);
        throw error;
    }
};

// Usage:
// testTaskCreation().then(result => console.log(result));