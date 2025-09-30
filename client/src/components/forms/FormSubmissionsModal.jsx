import React from "react";
import { Button } from "@/components/ui/button";
import { X, FileText, Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const FormSubmissionsModal = ({ isOpen, onClose, form }) => {
  if (!isOpen || !form) return null;

  // Use submissions and fields directly from the passed form prop
  const submissions = form.submissions || [];
  const formFields = form.fields || [];
  console.log("Form Fields:", form);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-lg p-6 max-w-6xl w-full shadow-xl flex flex-col"
        style={{ maxHeight: "90vh" }}
      >
        <div className="flex items-center justify-between mb-4 border-b pb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            User Submissions: <span className="text-gray-700">{form.name}</span>
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto">
          <Table className="min-w-full">
            <TableHeader className="sticky top-0 bg-gray-50">
              <TableRow>
                {formFields.map((field) => (
                  <TableHead key={field.id}>{field.label}</TableHead>
                ))}{" "}
                <TableHead>Submitted By</TableHead>{" "}
                <TableHead>Submitted At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.length > 0 ? (
                submissions.map((submission, index) => (
                  <TableRow key={index}>
                    {formFields.map((field) => (
                      <TableCell key={field.id}>
                        {submission.data[field.id] || "N/A"}
                      </TableCell>
                    ))}
                    <TableCell>
                      <div className="font-medium">
                        {submission.submittedBy.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {submission.submittedBy.email}
                      </div>
                    </TableCell>
                    <TableCell>{submission.submittedAt}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={formFields.length + 2}
                    className="text-center h-24"
                  >
                    No submissions found for this form.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default FormSubmissionsModal;