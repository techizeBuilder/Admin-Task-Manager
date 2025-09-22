import React, { useState, useMemo } from "react";
import {
  Search,
  MoreHorizontal,
  Eye,
  Copy,
  Edit,
  Trash2,
  Play,
  Pause,
  BarChart2,
  File,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Pagination from "@/components/common/Pagination";
import { Link } from "wouter";
import FormUsageModal from "./FormUsageModal";
import FormSubmissionsModal from "./FormSubmissionsModal";
import FormPublishModal from "./FormPublishModal";

// Mock data based on your requirements
export const mockFormTemplates = [
  {
    id: "FRM-001",
    name: "Vendor Onboarding Form",
    category: "Procurement",
    tags: ["vendor", "compliance"],
    status: "Published",
    lastUsed: "2025-09-15",
    owner: "Nitesh Gautam",
    fields: [
      { id: "f1", label: "Vendor Name" },
      { id: "f2", label: "Contact Email" },
      { id: "f3", label: "Vendor Type" },
    ],
    submissions: [
      {
        submittedBy: { name: "John Doe", email: "john.d@example.com" },
        submittedAt: "2025-09-20",
        data: {
          f1: "Innovate Inc.",
          f2: "contact@innovate.com",
          f3: "Software",
        },
      },
      {
        submittedBy: { name: "Jane Smith", email: "jane.s@example.com" },
        submittedAt: "2025-09-19",
        data: { f1: "Supply Co.", f2: "sales@supplyco.com", f3: "Goods" },
      },
    ],
  },
  {
    id: "FRM-002",
    name: "Employee Expense Reimbursement",
    category: "Finance",
    tags: ["expense", "employee"],
    status: "Published",
    lastUsed: "2025-09-18",
    owner: "Priya Sharma",
    fields: [
      { id: "e1", label: "Expense Type" },
      { id: "e2", label: "Amount" },
      { id: "e3", label: "Date of Expense" },
    ],
    submissions: [
      {
        submittedBy: { name: "Peter Jones", email: "peter.j@example.com" },
        submittedAt: "2025-09-18",
        data: { e1: "Travel", e2: "$500", e3: "2025-09-15" },
      },
      {
        submittedBy: { name: "Samantha Bee", email: "samantha.b@example.com" },
        submittedAt: "2025-09-17",
        data: { e1: "Software", e2: "$120", e3: "2025-09-16" },
      },
    ],
  },
  {
    id: "FRM-003",
    name: "IT Asset Request",
    category: "IT",
    tags: ["asset", "hardware"],
    status: "Draft",
    lastUsed: null,
    owner: "Admin",
    fields: [
      { id: "it1", label: "Asset Type" },
      { id: "it2", label: "Justification" },
      { id: "it3", label: "Delivery Location" },
    ],
    submissions: [],
  },
  {
    id: "FRM-004",
    name: "Customer Feedback Survey",
    category: "Marketing",
    tags: ["customer", "survey"],
    status: "Archived",
    lastUsed: "2024-01-20",
    owner: "Rajesh Kumar",
    fields: [
      { id: "cf1", label: "Service Rating (1-5)" },
      { id: "cf2", label: "Feedback" },
    ],
    submissions: [
      {
        submittedBy: { name: "Alice Johnson", email: "alice.j@example.com" },
        submittedAt: "2024-01-18",
        data: { cf1: "5", cf2: "Excellent service!" },
      },
      {
        submittedBy: { name: "Bob Williams", email: "bob.w@example.com" },
        submittedAt: "2024-01-17",
        data: { cf1: "4", cf2: "Good, but could be faster." },
      },
    ],
  },
  {
    id: "FRM-005",
    name: "Leave Application Form",
    category: "HR",
    tags: ["leave", "hr"],
    status: "Published",
    lastUsed: "2025-09-19",
    owner: "Priya Sharma",
    fields: [
      { id: "la1", label: "Leave Type" },
      { id: "la2", label: "Start Date" },
      { id: "la3", label: "End Date" },
      { id: "la4", label: "Reason" },
    ],
    submissions: [
      {
        submittedBy: { name: "Michael Chen", email: "michael.c@example.com" },
        submittedAt: "2025-09-19",
        data: {
          la1: "Sick Leave",
          la2: "2025-09-19",
          la3: "2025-09-19",
          la4: "Fever",
        },
      },
    ],
  },
  {
    id: "FRM-007",
    name: "Incident Report Form",
    category: "Operations",
    tags: ["incident", "safety"],
    status: "Published",
    lastUsed: "2025-08-30",
    owner: "Admin",
    fields: [
      { id: "ir1", label: "Incident Type" },
      { id: "ir2", label: "Location" },
      { id: "ir3", label: "Description" },
    ],
    submissions: [
      {
        submittedBy: { name: "Security Desk", email: "security@example.com" },
        submittedAt: "2025-08-30",
        data: {
          ir1: "Safety Hazard",
          ir2: "Warehouse A",
          ir3: "Water spill near aisle 3.",
        },
      },
    ],
  },
  // ... other forms without submissions remain the same
  {
    id: "FRM-006",
    name: "Project Kickoff Checklist",
    category: "Projects",
    tags: ["project", "checklist"],
    status: "Draft",
    lastUsed: null,
    owner: "Nitesh Gautam",
    fields: [],
    submissions: [],
  },
  {
    id: "FRM-008",
    name: "New Hire Information",
    category: "HR",
    tags: ["onboarding", "hr"],
    status: "Published",
    lastUsed: "2025-09-05",
    owner: "Priya Sharma",
    fields: [],
    submissions: [],
  },
  {
    id: "FRM-009",
    name: "Software Access Request",
    category: "IT",
    tags: ["software", "access"],
    status: "Archived",
    lastUsed: "2023-11-10",
    owner: "Admin",
    fields: [],
    submissions: [],
  },
  {
    id: "FRM-010",
    name: "Marketing Campaign Brief",
    category: "Marketing",
    tags: ["campaign", "creative"],
    status: "Draft",
    lastUsed: null,
    owner: "Rajesh Kumar",
    fields: [],
    submissions: [],
  },
];
export const mockFormList = [
  {
    formId: "frm_onboarding",
    formName: "Employee Onboarding",
    currentVersion: "1.4.0",
    lastUpdatedAt: "2025-09-15T10:22:00Z",
    lastUpdatedBy: { id: "u_12", name: "Priya Sharma" },
  },
  {
    formId: "frm_expense",
    formName: "Expense Reimbursement",
    currentVersion: "3.1.0",
    lastUpdatedAt: "2025-09-12T14:00:00Z",
    lastUpdatedBy: { id: "u_07", name: "Rahul Verma" },
  },
];

// Version list per form for the Versions UI (summary rows)
export const mockFormVersions = {
  frm_onboarding: [
    {
      id: "ver_onb_1_4_0",
      version: "1.4.0",
      status: "published",
      createdAt: "2025-09-14T09:02:00Z",
      createdBy: { id: "u_12", name: "Priya Sharma" },
      publishedAt: "2025-09-15T10:22:00Z",
      notes: "Added Address Line 2; tweaked validations.",
      changes: { added: 2, modified: 3, removed: 0 },
      fieldsCount: 24,
      sectionsCount: 5,
      canRollback: true,
      tags: ["minor", "validation"],
    },
    {
      id: "ver_onb_1_3_0",
      version: "1.3.0",
      status: "archived",
      createdAt: "2025-08-28T12:30:00Z",
      createdBy: { id: "u_07", name: "Rahul Verma" },
      publishedAt: "2025-08-29T08:00:00Z",
      notes: "Added Emergency Contact section.",
      changes: { added: 5, modified: 1, removed: 0 },
      fieldsCount: 22,
      sectionsCount: 5,
      canRollback: true,
      tags: ["feature"],
    },
    {
      id: "ver_onb_1_2_1",
      version: "1.2.1",
      status: "archived",
      createdAt: "2025-08-12T09:00:00Z",
      createdBy: { id: "u_12", name: "Priya Sharma" },
      publishedAt: "2025-08-12T10:00:00Z",
      notes: "Bugfix: required field flag on PAN.",
      changes: { added: 0, modified: 1, removed: 0 },
      fieldsCount: 17,
      sectionsCount: 4,
      canRollback: true,
      tags: ["patch"],
    },
    {
      id: "ver_onb_draft_next",
      version: "1.5.0",
      status: "draft",
      createdAt: "2025-09-20T16:10:00Z",
      createdBy: { id: "u_99", name: "System" },
      notes: "WIP: new Bank Details section.",
      changes: { added: 4, modified: 0, removed: 0 },
      fieldsCount: 28,
      sectionsCount: 6,
      canRollback: false,
      tags: ["draft"],
    },
  ],
  frm_expense: [
    {
      id: "ver_exp_3_1_0",
      version: "3.1.0",
      status: "published",
      createdAt: "2025-09-10T11:00:00Z",
      createdBy: { id: "u_03", name: "Anita Gupta" },
      publishedAt: "2025-09-12T14:00:00Z",
      notes: "Mileage cap raised; currency list updated.",
      changes: { added: 1, modified: 4, removed: 1 },
      fieldsCount: 18,
      sectionsCount: 3,
      canRollback: true,
      tags: ["minor"],
    },
    {
      id: "ver_exp_3_0_0",
      version: "3.0.0",
      status: "archived",
      createdAt: "2025-08-20T09:45:00Z",
      createdBy: { id: "u_03", name: "Anita Gupta" },
      publishedAt: "2025-08-22T10:15:00Z",
      notes: "Revamped receipt upload + validation rules.",
      changes: { added: 6, modified: 2, removed: 2 },
      fieldsCount: 17,
      sectionsCount: 3,
      canRollback: true,
      tags: ["major"],
    },
  ],
};

// Optional: detailed payload per version for a details panel
export const mockFormVersionDetails = {
  ver_onb_1_4_0: {
    id: "ver_onb_1_4_0",
    formId: "frm_onboarding",
    version: "1.4.0",
    status: "published",
    createdAt: "2025-09-14T09:02:00Z",
    createdBy: { id: "u_12", name: "Priya Sharma" },
    publishedAt: "2025-09-15T10:22:00Z",
    notes: "Added Address Line 2; tweaked validations.",
    diff: [
      { type: "added", path: "sections.address.fields.addressLine2", newValue: { type: "text", required: false } },
      { type: "modified", path: "sections.identity.fields.pan.required", oldValue: true, newValue: false },
      { type: "modified", path: "sections.identity.fields.aadhaar.pattern", oldValue: "^[0-9]{12}$", newValue: "^[2-9][0-9]{11}$" },
    ],
    jsonSchemaSnapshot: { /* trimmed example */ title: "Employee Onboarding", type: "object" },
    uiSchemaSnapshot: { /* trimmed example */ "ui:order": ["identity", "address", "emergency"] },
  },
  ver_exp_3_1_0: {
    id: "ver_exp_3_1_0",
    formId: "frm_expense",
    version: "3.1.0",
    status: "published",
    createdAt: "2025-09-10T11:00:00Z",
    createdBy: { id: "u_03", name: "Anita Gupta" },
    publishedAt: "2025-09-12T14:00:00Z",
    notes: "Mileage cap raised; currency list updated.",
    diff: [
      { type: "modified", path: "sections.mileage.fields.maxKmPerDay", oldValue: 150, newValue: 200 },
      { type: "removed", path: "sections.general.fields.legacyCategory" },
      { type: "modified", path: "sections.general.fields.currency.enum", oldValue: ["INR","USD","EUR"], newValue: ["INR","USD","EUR","GBP"] },
    ],
    jsonSchemaSnapshot: { title: "Expense Reimbursement", type: "object" },
    uiSchemaSnapshot: { "ui:order": ["general", "mileage", "attachments"] },
  },
};

const ITEMS_PER_PAGE = 7;

const FormLibrary = () => {
  const [forms, setForms] = useState(mockFormTemplates);
  const [isPublishOpen, setIsPublishOpen] = useState(false); // <-- add
  const [selectedFormForPublish, setSelectedFormForPublish] = useState(null); // <-- add
  const [selectedDraftSchema, setSelectedDraftSchema] = useState(null); // <-- add

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "ascending",
  });

  // usage model
  const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);
  const [selectedFormForUsage, setSelectedFormForUsage] = useState(null);

  //  submission model
  const [isSubmissionsModalOpen, setIsSubmissionsModalOpen] = useState(false);
  const [selectedFormForSubmissions, setSelectedFormForSubmissions] =
    useState(null);

  const statusColors = {
    Published: "bg-green-100 text-green-800",
    Draft: "bg-yellow-100 text-yellow-800",
    Archived: "bg-gray-100 text-gray-800",
  };

  const filteredAndSortedForms = useMemo(() => {
    let filtered = forms.filter((form) => {
      const searchMatch =
        form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        );
      const statusMatch =
        statusFilter === "all" || form.status === statusFilter;
      return searchMatch && statusMatch;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [forms, searchTerm, statusFilter, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedForms.length / ITEMS_PER_PAGE);
  const paginatedForms = filteredAndSortedForms.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const buildDraftSchema = (form) => ({
    title: form.name,
    description: `${form.category || ""} template`,
    fields: (form.fields || []).map((f) => ({
      id: f.id,
      type: "text", // placeholder type for mock rows
      label: f.label,
      required: false,
      placeholder: "",
    })),
  });
  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending" ? " ▲" : " ▼";
  };
  // usage model
  const handleOpenUsageModal = (form) => {
    setSelectedFormForUsage(form);
    setIsUsageModalOpen(true);
  };

  const handleCloseUsageModal = () => {
    setIsUsageModalOpen(false);
    setSelectedFormForUsage(null);
  };

  // submission model
  const handleOpenSubmissionsModal = (form) => {
    setSelectedFormForSubmissions(form);
    setIsSubmissionsModalOpen(true);
  };

  const handleCloseSubmissionsModal = () => {
    setIsSubmissionsModalOpen(false);
    setSelectedFormForSubmissions(null);
  };
  const handleOpenPublishFromLibrary = (form) => {
    setSelectedFormForPublish(form);
    setSelectedDraftSchema(buildDraftSchema(form));
    setIsPublishOpen(true);
  };
  const handleClosePublish = (published) => {
    setIsPublishOpen(false);
    if (published && selectedFormForPublish) {
      // Optimistically mark as Published in table
      setForms((prev) =>
        prev.map((f) =>
          f.id === selectedFormForPublish.id ? { ...f, status: "Published" } : f
        )
      );
    }
    setSelectedFormForPublish(null);
    setSelectedDraftSchema(null);
  };
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <header className="mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <File className="h-8 w-8 text-blue-600" />
            Form Library
          </h1>
          <p className="text-gray-600 mt-1">
            Manage, create, and track all your form templates.
          </p>
        </div>
      </header>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4 gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, owner, or tag..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Published">Published</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Link href="/form-builder">
              <Button>Create New Form</Button>
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          <Table className="min-w-full">
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead
                  onClick={() => handleSort("name")}
                  className="cursor-pointer"
                >
                  Name{getSortIndicator("name")}
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead
                  onClick={() => handleSort("lastUsed")}
                  className="cursor-pointer"
                >
                  Last Used{getSortIndicator("lastUsed")}
                </TableHead>
                <TableHead
                  onClick={() => handleSort("owner")}
                  className="cursor-pointer"
                >
                  Owner{getSortIndicator("owner")}
                </TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedForms.map((form) => (
                <TableRow key={form.id}>
                  <TableCell className="font-medium">{form.name}</TableCell>
                  <TableCell>
                    <Badge
                      className={`${statusColors[form.status]} hover:${
                        statusColors[form.status]
                      }`}
                    >
                      {form.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{form.lastUsed || "N/A"}</TableCell>
                  <TableCell>{form.owner}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {form.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag.charAt(0).toUpperCase() +
                            tag.slice(1).toLowerCase()}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-white" align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" /> Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleOpenSubmissionsModal(form)}
                        >
                          <FileText className="mr-2 h-4 w-4" /> Submission
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" /> Clone
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled={form.status !== "Draft"}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        {form.status === "Published" ? (
                          <DropdownMenuItem>
                            <Pause className="mr-2 h-4 w-4" /> Unpublish
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            // disabled={form.status === "Archived"}
                            onClick={() => handleOpenPublishFromLibrary(form)} // <-- open modal
                          >
                            <Play className="mr-2 h-4 w-4" /> Publish
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleOpenUsageModal(form)}
                        >
                          <BarChart2 className="mr-2 h-4 w-4" /> Usage
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-500"
                          disabled={form.status === "Published"}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* submission modal  */}
        <FormSubmissionsModal
          isOpen={isSubmissionsModalOpen}
          onClose={handleCloseSubmissionsModal}
          form={selectedFormForSubmissions}
        />
        {/* Usage Modal */}
        <FormUsageModal
          isOpen={isUsageModalOpen}
          onClose={handleCloseUsageModal}
          form={selectedFormForUsage}
        />
        {/* Publish Modal from Library */}
        <FormPublishModal
          open={isPublishOpen}
          onClose={handleClosePublish}
          formId={selectedFormForPublish?.id}
          draftSchema={selectedDraftSchema}
        />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={ITEMS_PER_PAGE}
          totalItems={filteredAndSortedForms.length}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default FormLibrary;
