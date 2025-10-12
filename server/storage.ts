import { users, organizations, projects, tasks, taskApprovals, taskComments, taskStatuses, type User, type InsertUser, type Task, type InsertTask, type TaskApproval, type InsertTaskApproval, type TaskComment, type InsertTaskComment, type Organization, type Project } from "../shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, inArray, sql } from "drizzle-orm";

// Storage interface definition
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  
  // Organization operations
  getOrganization(id: number): Promise<Organization | undefined>;
  getOrganizationBySlug(slug: string): Promise<Organization | undefined>;
  
  // Project operations
  getProject(id: number): Promise<Project | undefined>;
  getProjectsByOrganization(organizationId: number): Promise<Project[]>;
  
  // Task operations
  createTask(insertTask: InsertTask): Promise<Task>;
  getTask(id: number): Promise<Task | undefined>;
  getTasksByProject(projectId: number): Promise<Task[]>;
  getTasksByOrganization(organizationId: number): Promise<Task[]>;
  getTasksByAssignee(assigneeId: number): Promise<Task[]>;
  updateTask(id: number, updates: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Task approval operations
  createTaskApproval(insertApproval: InsertTaskApproval): Promise<TaskApproval>;
  getTaskApprovals(taskId: number): Promise<TaskApproval[]>;
  updateTaskApproval(id: number, updates: Partial<InsertTaskApproval>): Promise<TaskApproval | undefined>;
  
  // Task comment operations
  createTaskComment(insertComment: InsertTaskComment): Promise<TaskComment>;
  getTaskComments(taskId: number): Promise<TaskComment[]>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Assuming username is email in this case
    return this.getUserByEmail(username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getOrganization(id: number): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.id, id));
    return org || undefined;
  }

  async getOrganizationBySlug(slug: string): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.slug, slug));
    return org || undefined;
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async getProjectsByOrganization(organizationId: number): Promise<Project[]> {
    return db.select().from(projects).where(eq(projects.organizationId, organizationId));
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values(insertTask)
      .returning();
    return task;
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async getTasksByProject(projectId: number): Promise<Task[]> {
    return db.select().from(tasks).where(eq(tasks.projectId, projectId)).orderBy(desc(tasks.createdAt));
  }

  async getTasksByOrganization(organizationId: number): Promise<Task[]> {
    return db.select().from(tasks).where(eq(tasks.organizationId, organizationId)).orderBy(desc(tasks.createdAt));
  }

  async getTasksByAssignee(assigneeId: number): Promise<Task[]> {
    return db.select().from(tasks).where(eq(tasks.assignedToId, assigneeId)).orderBy(desc(tasks.createdAt));
  }

  async updateTask(id: number, updates: Partial<InsertTask>): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return task || undefined;
  }

  async deleteTask(id: number): Promise<boolean> {
    const [task] = await db
      .update(tasks)
      .set({ isDeleted: true, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return !!task;
  }

  async createTaskApproval(insertApproval: InsertTaskApproval): Promise<TaskApproval> {
    const [approval] = await db
      .insert(taskApprovals)
      .values(insertApproval)
      .returning();
    return approval;
  }

  async getTaskApprovals(taskId: number): Promise<TaskApproval[]> {
    return db.select().from(taskApprovals).where(eq(taskApprovals.taskId, taskId));
  }

  async updateTaskApproval(id: number, updates: Partial<InsertTaskApproval>): Promise<TaskApproval | undefined> {
    const [approval] = await db
      .update(taskApprovals)
      .set(updates)
      .where(eq(taskApprovals.id, id))
      .returning();
    return approval || undefined;
  }

  async createTaskComment(insertComment: InsertTaskComment): Promise<TaskComment> {
    const [comment] = await db
      .insert(taskComments)
      .values(insertComment)
      .returning();
    return comment;
  }

  async getTaskComments(taskId: number): Promise<TaskComment[]> {
    return db.select().from(taskComments).where(eq(taskComments.taskId, taskId)).orderBy(asc(taskComments.createdAt));
  }
}

export const storage = new DatabaseStorage();