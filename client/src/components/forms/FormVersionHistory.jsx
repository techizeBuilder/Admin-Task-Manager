import React, { useMemo, useState } from "react";
import { Clock, Search, Eye, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Pagination from "@/components/common/Pagination";

// Importing existing mock data from FormLibrary
import {
  mockFormList,
  mockFormVersions,
  // mockFormVersionDetails, // if you later add a details modal
} from "@/components/forms/FormLibrary";

const ITEMS_PER_PAGE = 8;

const statusColors = {
  published: "bg-green-100 text-green-800",
  draft: "bg-yellow-100 text-yellow-800",
  archived: "bg-gray-100 text-gray-800",
};

function formatDate(d) {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleString();
  } catch {
    return d;
  }
}

const FormVersionHistory = () => {
  const [selectedFormId, setSelectedFormId] = useState(
    mockFormList?.[0]?.formId || ""
  );
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const versions = useMemo(() => {
    const list = mockFormVersions[selectedFormId] ?? [];
    // search across version, notes, tags
    const q = searchTerm.trim().toLowerCase();
    let filtered = list.filter((v) => {
      const matchesStatus = statusFilter === "all" || v.status === statusFilter;
      const matchesSearch =
        !q ||
        v.version.toLowerCase().includes(q) ||
        (v.notes || "").toLowerCase().includes(q) ||
        (v.tags || []).some((t) => t.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    });

    // sort by createdAt desc by default
    filtered.sort((a, b) => {
      const aT = new Date(a.createdAt).getTime();
      const bT = new Date(b.createdAt).getTime();
      return bT - aT;
    });

    return filtered;
  }, [selectedFormId, statusFilter, searchTerm]);

  const totalPages = Math.ceil(versions.length / ITEMS_PER_PAGE) || 1;
  const pageSlice = versions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const selectedFormName =
    mockFormList.find((f) => f.formId === selectedFormId)?.formName || "";

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Clock className="h-8 w-8 text-blue-600" />
          Form Version History
        </h1>
        <p className="text-gray-600 mt-1">
          Review and manage versions of your form templates.
        </p>
      </header>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex gap-3 w-full md:w-auto">
            <Select
              value={selectedFormId}
              onValueChange={(val) => {
                setSelectedFormId(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select a form" />
              </SelectTrigger>
              <SelectContent>
                {mockFormList.map((f) => (
                  <SelectItem key={f.formId} value={f.formId}>
                    {f.formName} (v{f.currentVersion})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="relative w-full md:w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search version, notes, or tags..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Published At</TableHead>
                <TableHead>Changes</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageSlice.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    No versions found for {selectedFormName || "selected form"}.
                  </TableCell>
                </TableRow>
              ) : (
                pageSlice.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">
                      <Badge variant="outline">v{v.version}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[v.status] || ""}>
                        {v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(v.createdAt)}</TableCell>
                    <TableCell>{v.createdBy?.name || "-"}</TableCell>
                    <TableCell>{formatDate(v.publishedAt)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Badge variant="outline">+{v.changes?.added ?? 0}</Badge>
                        <Badge variant="outline">
                          ~{v.changes?.modified ?? 0}
                        </Badge>
                        <Badge variant="outline">-{v.changes?.removed ?? 0}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[320px] truncate">
                      {v.notes || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={!v.canRollback}
                          title={
                            v.canRollback ? "Rollback to this version" : "Not eligible for rollback"
                          }
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Rollback
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={ITEMS_PER_PAGE}
          totalItems={versions.length}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default FormVersionHistory;