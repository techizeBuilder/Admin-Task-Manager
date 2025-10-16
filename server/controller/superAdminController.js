export const superAdminController = {
  async test(req, res) {
    try {
      const { Organization } = await import("../modals/organizationModal.js");
      const { User } = await import("../modals/userModal.js");
      const totalOrgs = (await Organization.countDocuments()) || 0;
      const totalUsers = (await User.countDocuments()) || 0;
      res.json({
        message: "Test endpoint working",
        totalOrgs,
        totalUsers,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.json({ error: error.message, timestamp: new Date().toISOString() });
    }
  },

  async createSampleData(req, res) {
    try {
      const { Project, Task } = await import("../models.js");
      const { Organization } = await import("../modals/organizationModal.js");
      const { User } = await import("../modals/userModal.js");
      if (req.body.force) {
        await Promise.all([
          Task.deleteMany({}),
          Project.deleteMany({}),
          User.deleteMany({ role: { $ne: "super_admin" } }),
          Organization.deleteMany({}),
        ]);
      }
    if (req.body.force) {
         await Promise.all([
           Task.deleteMany({}),
           Project.deleteMany({}),
           User.deleteMany({ role: { $ne: "super_admin" } }),
           Organization.deleteMany({}),
         ]);
         console.log("Cleared existing sample data");
       }
 
       // Create sample organizations
       const org1 = await Organization.create({
         name: "TechCorp Solutions",
         slug: "techcorp-solutions",
         description: "Leading technology solutions provider",
         industry: "Technology",
         size: "medium",
         website: "https://techcorp.example.com",
         status: "active",
       });
 
       const org2 = await Organization.create({
         name: "Design Studio Pro",
         slug: "design-studio-pro",
         description: "Creative design and branding agency",
         industry: "Design",
         size: "small",
         website: "https://designstudio.example.com",
         status: "active",
       });
 
       const org3 = await Organization.create({
         name: "Global Marketing Inc",
         slug: "global-marketing-inc",
         description: "International marketing and advertising firm",
         industry: "Marketing",
         size: "large",
         status: "pending",
       });
 
       // Create sample users
       const users = await User.create([
         {
           firstName: "John",
           lastName: "Smith",
           email: "john.smith@techcorp.example.com",
           role: "admin",
           organization: org1._id,
           status: "active",
           passwordHash: await storage.hashPassword("password123"),
         },
         {
           firstName: "Sarah",
           lastName: "Johnson",
           email: "sarah.johnson@techcorp.example.com",
           role: "member",
           organization: org1._id,
           status: "active",
           passwordHash: await storage.hashPassword("password123"),
         },
         {
           firstName: "Mike",
           lastName: "Davis",
           email: "mike.davis@designstudio.example.com",
           role: "admin",
           organization: org2._id,
           status: "active",
           passwordHash: await storage.hashPassword("password123"),
         },
         {
           firstName: "Emily",
           lastName: "Wilson",
           email: "emily.wilson@designstudio.example.com",
           role: "member",
           organization: org2._id,
           status: "active",
           passwordHash: await storage.hashPassword("password123"),
         },
         {
           firstName: "David",
           lastName: "Brown",
           email: "david.brown@globalmarketing.example.com",
           role: "admin",
           organization: org3._id,
           status: "pending",
           passwordHash: await storage.hashPassword("password123"),
         },
         {
           firstName: "Lisa",
           lastName: "Taylor",
           email: "lisa.taylor@individual.example.com",
           role: "member",
           status: "active",
           passwordHash: await storage.hashPassword("password123"),
         },
       ]);
 
       // Create sample projects
       const projects = await Project.create([
         {
           name: "Website Redesign",
           description: "Complete redesign of company website",
           organization: org1._id,
           status: "active",
         },
         {
           name: "Mobile App Development",
           description: "iOS and Android mobile application",
           organization: org1._id,
           status: "active",
         },
         {
           name: "Brand Identity Project",
           description: "New brand identity and logo design",
           organization: org2._id,
           status: "completed",
         },
       ]);
 
       // Create sample tasks
       await Task.create([
         {
           title: "Design Homepage Mockup",
           description: "Create initial homepage design mockup",
           project: projects[0]._id,
           organization: org1._id,
           assignedTo: users[1]._id,
           status: "in-progress",
         },
         {
           title: "Develop User Authentication",
           description: "Implement user login and registration",
           project: projects[1]._id,
           organization: org1._id,
           assignedTo: users[0]._id,
           status: "completed",
         },
         {
           title: "Create Logo Concepts",
           description: "Design multiple logo concept variations",
           project: projects[2]._id,
           organization: org2._id,
           assignedTo: users[2]._id,
           status: "completed",
         },
       ]);
 
       const finalCounts = {
         organizations: await Organization.countDocuments(),
         users: await User.countDocuments(),
         projects: await Project.countDocuments(),
         tasks: await Task.countDocuments(),
       };
 
       res.json({
         message: "Sample data created successfully",
         counts: finalCounts,
         timestamp: new Date().toISOString(),
       });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async analytics(req, res) {
    try {
      const { storage } = await import("../mongodb-storage.js");
      const stats = await storage.getPlatformAnalytics();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch platform analytics" });
    }
  },

  async companies(req, res) {
    try {
      const { Project, Task, Form } = await import("../models.js");
      const { Organization } = await import("../modals/organizationModal.js");
      const { User } = await import("../modals/userModal.js");
      const companies = await Organization.find({}).sort({ createdAt: -1 });
 const companiesWithStats = await Promise.all(
        companies.map(async (company) => {
          const userCount = await User.countDocuments({
            $or: [
              { organizationId: company._id },
              { organization: company._id },
            ],
          });
          const projectCount = await Project.countDocuments({
            $or: [
              { organizationId: company._id },
              { organization: company._id },
            ],
          });
          const taskCount = await Task.countDocuments({
            $or: [
              { organizationId: company._id },
              { organization: company._id },
            ],
          });
          const formCount = await Form.countDocuments({
            $or: [
              { organizationId: company._id },
              { organization: company._id },
            ],
          });

          return {
            ...company.toObject(),
            userCount,
            projectCount,
            taskCount,
            formCount,
            stats: {
              users: userCount,
              projects: projectCount,
              tasks: taskCount,
              forms: formCount,
            },
          };
        })
      );

      
      res.json(companiesWithStats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  },

  async users(req, res) {
    try {
      const { User } = await import("../modals/userModal.js");
      const users = await User.find({}).sort({ createdAt: -1 });
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  },

  async createSuperAdmin(req, res) {
    try {
      const { storage } = await import("../mongodb-storage.js");
      const { firstName, lastName, email, password } = req.body;
      const superAdmin = await storage.createSuperAdmin({
        firstName,
        lastName,
        email,
        password,
      });
      res.json({
        message: "Super admin created successfully",
        user: {
          id: superAdmin._id,
          email: superAdmin.email,
          firstName: superAdmin.firstName,
          lastName: superAdmin.lastName,
          role: superAdmin.role,
        },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async logs(req, res) {
    try {
      const { storage } = await import("../mongodb-storage.js");
      const { limit = 100 } = req.query;
      const logs = await storage.getSystemLogs(parseInt(limit));
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch system logs" });
    }
  },

  async assignAdmin(req, res) {
    try {
      const { storage } = await import("../mongodb-storage.js");
      const { companyId, userId } = req.body;
      await storage.assignCompanyAdmin(companyId, userId);
      res.json({ message: "Company admin assigned successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to assign company admin" });
    }
  },

  async updateCompanyStatus(req, res) {
    try {
      const { storage } = await import("../mongodb-storage.js");
      const { id } = req.params;
      const { status } = req.body;
      await storage.updateCompanyStatus(id, status);
      res.json({ message: "Company status updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update company status" });
    }
  },
};