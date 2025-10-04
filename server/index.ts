import "./env.ts"; // Load environment variables first
import express from "express";
import mongoose from "mongoose";
import swaggerJSDoc from "swagger-jsdoc";
import * as swaggerUi from "swagger-ui-express";
import { setupVite, serveStatic, log } from "./vite.js";
import { registerRoutes } from "./routes.js";
import { registerUserInvitationRoutes } from "./routes/userInvitation.js";
import taskfeedRoutes from "./routes/taskfeedRoutes.js";
import quickTaskRoutes from "./routes/quickTaskRoutes.js";

const app = express();

// Swagger configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "TaskSetu API Documentation",
      version: "1.0.0",
      description: "API documentation for TaskSetu task management system",
      contact: {
        name: "API Support",
        email: "support@tasksetu.com",
      },
    },
    servers: [
      {
        url: process.env.API_URL || "http://localhost:5000",
        description: "API Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./server/routes/*.js", "./server/models/*.js", "./server/modals/*.js"],
  failOnErrors: true, // Whether or not to throw when parsing errors
  encoding: "utf8", // Encoding for reading files
  verbose: true, // Include errors in the console
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Serve Swagger documentation with custom options
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "TaskSetu API Documentation",
    customfavIcon: "/favicon.ico",
    swaggerOptions: {
      persistAuthorization: true,
      filter: true,
      displayRequestDuration: true,
      docExpansion: "none",
    },
  })
);

// Serve Swagger spec as JSON for third-party tools
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Add error handling for uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// MongoDB connection
const connectToMongoDB = async () => {
  try {
    const mongoUri =
      "mongodb+srv://jeeturadicalloop:Mjvesqnj8gY3t0zP@cluster0.by2xy6x.mongodb.net/TaskSetu";

    // Add MongoDB connection options
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB TaskSetu database");

    // Register routes with error handling
    try {
      await registerRoutes(app);
      console.log("Main routes registered");

      registerUserInvitationRoutes(app);
      console.log("User invitation routes registered");

      // Register taskfeed routes
      app.use("/api", taskfeedRoutes);
      console.log("Taskfeed routes registered");

      // Register Quick Task routes
      app.use("/api/quick-tasks", quickTaskRoutes);
      console.log("Quick Task routes registered");
    } catch (routeError) {
      console.error("Error registering routes:", routeError);
      throw routeError;
    }

    // Initialize sample data if needed
    await initializeSampleData();
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Initialize comprehensive sample data
async function initializeSampleData() {
  try {
    const { Project, Task, TaskStatus, Form, ProcessFlow, FormResponse } =
      await import("./models.js");
    const { User } = await import("./modals/userModal.js");
    const { Organization } = await import("./modals/organizationModal.js");
    // Check if sample data already exists
    const existingOrgs = await Organization.countDocuments();
    const existingUsers = await User.countDocuments();
    console.log(
      `Found ${existingOrgs} organizations and ${existingUsers} users in database`
    );

    if (existingOrgs > 0 && existingUsers > 1) {
      console.log("Sample data already exists, skipping initialization");
      return;
    }

    console.log("Initializing sample data...");

    try {
      // Create sample organizations
      const organizations = [
        {
          name: "TechCorp Solutions",
          slug: "techcorp-solutions",
          description: "Leading technology solutions provider",
          website: "https://techcorp.com",
          industry: "Technology",
          size: "large",
          settings: {
            allowGuestAccess: false,
            requireApproval: true,
            defaultTaskStatus: "open",
          },
        },
        {
          name: "Creative Studio Inc",
          slug: "creative-studio-inc",
          description: "Full-service creative design agency",
          website: "https://creativestudio.com",
          industry: "Design",
          size: "medium",
          settings: {
            allowGuestAccess: true,
            requireApproval: false,
            defaultTaskStatus: "open",
          },
        },
        {
          name: "Global Marketing Co",
          slug: "global-marketing-co",
          description: "International digital marketing consultancy",
          website: "https://globalmarketing.com",
          industry: "Marketing",
          size: "small",
          settings: {
            allowGuestAccess: false,
            requireApproval: true,
            defaultTaskStatus: "open",
          },
        },
      ];

      const savedOrgs = [];
      for (const orgData of organizations) {
        const org = new Organization(orgData);
        await org.save();
        savedOrgs.push(org);
      }

      // Create comprehensive sample users
      const users = [
        {
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@techcorp.com",
          passwordHash:
            "$2a$10$Yx8z3V4K2QwZ5R7N8B9C1uX4Y6T7R8N9M0L1K2J3H4G5F6D7C8B9A0",
          role: "admin",
          organization: null, // Will be set after org creation
          profile: {
            title: "CTO",
            department: "Engineering",
            bio: "Experienced technology leader with 15+ years in software development",
            avatar:
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
            skills: ["JavaScript", "React", "Node.js", "MongoDB"],
            location: "San Francisco, CA",
          },
          isEmailVerified: true,
          isActive: true,
        },
        {
          firstName: "Jane",
          lastName: "Smith",
          email: "jane.smith@techcorp.com",
          passwordHash:
            "$2a$10$Yx8z3V4K2QwZ5R7N8B9C1uX4Y6T7R8N9M0L1K2J3H4G5F6D7C8B9A0",
          role: "employee",
          organization: null,
          profile: {
            title: "Senior Developer",
            department: "Engineering",
            bio: "Full-stack developer passionate about creating great user experiences",
            avatar:
              "https://images.unsplash.com/photo-1494790108755-2616b62c5e46?w=150",
            skills: ["React", "TypeScript", "Python", "PostgreSQL"],
            location: "Austin, TX",
          },
          isEmailVerified: true,
          isActive: true,
        },
        {
          firstName: "Mike",
          lastName: "Johnson",
          email: "mike.johnson@creativestudio.com",
          passwordHash:
            "$2a$10$Yx8z3V4K2QwZ5R7N8B9C1uX4Y6T7R8N9M0L1K2J3H4G5F6D7C8B9A0",
          role: "admin",
          organization: null,
          profile: {
            title: "Creative Director",
            department: "Design",
            bio: "Award-winning creative director with expertise in brand identity and digital design",
            avatar:
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
            skills: [
              "Adobe Creative Suite",
              "Figma",
              "Brand Strategy",
              "UI/UX",
            ],
            location: "New York, NY",
          },
          isEmailVerified: true,
          isActive: true,
        },
        {
          firstName: "Sarah",
          lastName: "Wilson",
          email: "sarah.wilson@creativestudio.com",
          passwordHash:
            "$2a$10$Yx8z3V4K2QwZ5R7N8B9C1uX4Y6T7R8N9M0L1K2J3H4G5F6D7C8B9A0",
          role: "employee",
          organization: null,
          profile: {
            title: "UX Designer",
            department: "Design",
            bio: "User experience designer focused on creating intuitive and accessible designs",
            avatar:
              "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
            skills: ["Figma", "Sketch", "User Research", "Prototyping"],
            location: "Seattle, WA",
          },
          isEmailVerified: true,
          isActive: true,
        },
        {
          firstName: "David",
          lastName: "Brown",
          email: "david.brown@globalmarketing.com",
          passwordHash:
            "$2a$10$Yx8z3V4K2QwZ5R7N8B9C1uX4Y6T7R8N9M0L1K2J3H4G5F6D7C8B9A0",
          role: "admin",
          organization: null,
          profile: {
            title: "Marketing Director",
            department: "Marketing",
            bio: "Digital marketing expert specializing in growth strategies and analytics",
            avatar:
              "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
            skills: ["Google Analytics", "SEO", "Content Strategy", "PPC"],
            location: "Chicago, IL",
          },
          isEmailVerified: true,
          isActive: true,
        },
        {
          firstName: "Emily",
          lastName: "Davis",
          email: "emily.davis@globalmarketing.com",
          passwordHash:
            "$2a$10$Yx8z3V4K2QwZ5R7N8B9C1uX4Y6T7R8N9M0L1K2J3H4G5F6D7C8B9A0",
          role: "employee",
          organization: null,
          profile: {
            title: "Content Manager",
            department: "Marketing",
            bio: "Content strategist with expertise in storytelling and brand voice development",
            avatar:
              "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150",
            skills: [
              "Content Writing",
              "Social Media",
              "Brand Voice",
              "Copywriting",
            ],
            location: "Los Angeles, CA",
          },
          isEmailVerified: true,
          isActive: true,
        },
        {
          firstName: "Alex",
          lastName: "Thompson",
          email: "alex.thompson@techcorp.com",
          passwordHash:
            "$2a$10$Yx8z3V4K2QwZ5R7N8B9C1uX4Y6T7R8N9M0L1K2J3H4G5F6D7C8B9A0",
          role: "employee",
          organization: null,
          profile: {
            title: "Product Manager",
            department: "Product",
            bio: "Product manager with a focus on user-centered design and agile methodologies",
            avatar:
              "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150",
            skills: ["Product Strategy", "Agile", "User Research", "Analytics"],
            location: "Boston, MA",
          },
          isEmailVerified: true,
          isActive: true,
        },
      ];

      // Assign users to organizations
      users[0].organization = savedOrgs[0]._id; // John to TechCorp
      users[1].organization = savedOrgs[0]._id; // Jane to TechCorp
      users[6].organization = savedOrgs[0]._id; // Alex to TechCorp
      users[2].organization = savedOrgs[1]._id; // Mike to Creative Studio
      users[3].organization = savedOrgs[1]._id; // Sarah to Creative Studio
      users[4].organization = savedOrgs[2]._id; // David to Global Marketing
      users[5].organization = savedOrgs[2]._id; // Emily to Global Marketing

      const savedUsers = [];
      for (const userData of users) {
        const user = new User(userData);
        await user.save();
        savedUsers.push(user);
      }

      // Create comprehensive sample projects
      const projects = [
        {
          name: "Customer Portal Redesign",
          description:
            "Complete overhaul of customer-facing portal with modern UI/UX",
          organization: savedOrgs[0]._id,
          owner: savedUsers[0]._id,
          status: "active",
          color: "#3B82F6",
        },
        {
          name: "Mobile App Development",
          description:
            "Native mobile application for iOS and Android platforms",
          organization: savedOrgs[0]._id,
          owner: savedUsers[1]._id,
          status: "active",
          color: "#10B981",
        },
        {
          name: "Brand Identity Refresh",
          description: "Complete brand redesign and style guide",
          organization: savedOrgs[1]._id,
          owner: savedUsers[3]._id,
          status: "active",
          color: "#F59E0B",
        },
        {
          name: "Digital Marketing Campaign",
          description: "Q4 product launch marketing strategy",
          organization: savedOrgs[2]._id,
          owner: savedUsers[5]._id,
          status: "active",
          color: "#EF4444",
        },
      ];

      const savedProjects = [];
      for (const projectData of projects) {
        const project = new Project(projectData);
        await project.save();
        savedProjects.push(project);
      }

      // Create default task statuses for each organization
      for (const org of savedOrgs) {
        const defaultStatuses = [
          {
            name: "To Do",
            color: "#6B7280",
            order: 0,
            isDefault: true,
            organization: org._id,
          },
          {
            name: "In Progress",
            color: "#3B82F6",
            order: 1,
            organization: org._id,
          },
          { name: "Review", color: "#F59E0B", order: 2, organization: org._id },
          {
            name: "Completed",
            color: "#10B981",
            order: 3,
            isCompleted: true,
            organization: org._id,
          },
        ];

        for (const status of defaultStatuses) {
          const taskStatus = new TaskStatus(status);
          await taskStatus.save();
        }
      }

      // Create comprehensive sample tasks
      const tasks = [
        {
          title: "Design user authentication flow",
          description:
            "Create wireframes and mockups for login and registration process",
          organization: savedOrgs[0]._id,
          project: savedProjects[0]._id,
          createdBy: savedUsers[0]._id,
          assignedTo: savedUsers[1]._id,
          status: "in-progress",
          priority: "high",
          dueDate: new Date("2024-06-15"),
          tags: ["design", "authentication", "wireframes"],
          progress: 75,
        },
        {
          title: "Implement user dashboard",
          description: "Build responsive dashboard with charts and analytics",
          organization: savedOrgs[0]._id,
          project: savedProjects[0]._id,
          createdBy: savedUsers[1]._id,
          assignedTo: savedUsers[1]._id,
          status: "completed",
          priority: "high",
          dueDate: new Date("2024-06-10"),
          tags: ["development", "dashboard", "charts"],
          progress: 100,
        },
        {
          title: "API integration testing",
          description: "Test all API endpoints and error handling scenarios",
          organization: savedOrgs[0]._id,
          project: savedProjects[1]._id,
          createdBy: savedUsers[0]._id,
          assignedTo: savedUsers[6]._id,
          status: "todo",
          priority: "medium",
          dueDate: new Date("2024-06-20"),
          tags: ["testing", "api", "integration"],
          progress: 0,
        },
        {
          title: "Logo design concepts",
          description: "Create 5 different logo concepts for brand refresh",
          organization: savedOrgs[1]._id,
          project: savedProjects[2]._id,
          createdBy: savedUsers[2]._id,
          assignedTo: savedUsers[3]._id,
          status: "review",
          priority: "high",
          dueDate: new Date("2024-06-12"),
          tags: ["design", "logo", "branding"],
          progress: 90,
        },
        {
          title: "Typography system development",
          description:
            "Establish comprehensive typography guidelines and font pairings",
          organization: savedOrgs[1]._id,
          project: savedProjects[2]._id,
          createdBy: savedUsers[2]._id,
          assignedTo: savedUsers[3]._id,
          status: "in-progress",
          priority: "medium",
          dueDate: new Date("2024-06-18"),
          tags: ["typography", "design-system", "fonts"],
          progress: 45,
        },
        {
          title: "Color palette finalization",
          description:
            "Select and document primary and secondary color schemes",
          organization: savedOrgs[1]._id,
          project: savedProjects[2]._id,
          createdBy: savedUsers[2]._id,
          assignedTo: savedUsers[3]._id,
          status: "in-progress",
          priority: "medium",
          dueDate: new Date("2024-06-18"),
          tags: ["branding", "colors", "palette"],
          progress: 60,
        },
        {
          title: "Social media campaign strategy",
          description: "Plan and execute Q4 social media marketing campaign",
          organization: savedOrgs[2]._id,
          project: savedProjects[3]._id,
          createdBy: savedUsers[5]._id,
          assignedTo: savedUsers[5]._id,
          status: "in-progress",
          priority: "high",
          dueDate: new Date("2024-06-30"),
          tags: ["marketing", "social-media", "strategy"],
          progress: 40,
        },
        {
          title: "Email marketing automation",
          description: "Setup automated email sequences for lead nurturing",
          organization: savedOrgs[2]._id,
          project: savedProjects[3]._id,
          createdBy: savedUsers[5]._id,
          assignedTo: savedUsers[5]._id,
          status: "todo",
          priority: "medium",
          dueDate: new Date("2024-07-05"),
          tags: ["email", "automation", "leads"],
          progress: 0,
        },
      ];

      for (const taskData of tasks) {
        const task = new Task(taskData);
        await task.save();
      }

      console.log("Comprehensive sample data initialized successfully");
      console.log(
        `Created ${savedOrgs.length} organizations, ${savedUsers.length} users, ${savedProjects.length} projects, and ${tasks.length} tasks`
      );
    } catch (error) {
      console.error("Error initializing sample data:", error);
    }
  } catch (error) {
    console.error("Critical error in sample data initialization:", error);
  }
}

(async () => {
  await connectToMongoDB();

  const server = await registerRoutes(app);

  // Important: This setup is for production. In development, Vite will handle HMR.
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    await setupVite(app, server);
  }

  const PORT = Number(process.env.PORT) || 5000;
  server.listen(PORT, (err) => {
    if (err) {
      console.error(`Failed to start server on port ${PORT}:`, err);
      process.exit(1);
    }
    log(`TaskSetu Server running on port ${PORT}`);
  });
})();
