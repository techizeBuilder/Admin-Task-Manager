import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import {
  Plus,
  Save,
  Eye,
  Share2,
  Settings,
  Trash2,
  GripVertical,
  FileText,
  Undo2,
  Redo2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { FormFieldTypes } from "@/components/forms/FormFieldTypes";
import { FormPreview } from "@/components/forms/FormPreview";
import { FormSettings } from "@/components/forms/FormSettings";

export default function FormBuilder() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    title: "",
    description: "",
    fields: [],
    settings: {
      allowAnonymous: true,
      submitMessage: "Thank you for your submission!",
    },
  });
  const [layout, setLayout] = useState("1-column");
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [selectedField, setSelectedField] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [draggedField, setDraggedField] = useState(null);
  // Fetch forms
  const { data: forms = [], isLoading } = useQuery({
    queryKey: ["/api/forms"],
  });
  const handleDragStart = (e, field) => {
    setDraggedField(field.id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", field.id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetField) => {
    e.preventDefault();
    const sourceFieldId = draggedField;
    const targetFieldId = targetField.id;

    if (sourceFieldId === targetFieldId) {
      setDraggedField(null);
      return;
    }

    const sourceIndex = form.fields.findIndex((f) => f.id === sourceFieldId);
    const targetIndex = form.fields.findIndex((f) => f.id === targetFieldId);

    if (sourceIndex === -1 || targetIndex === -1) {
      setDraggedField(null);
      return;
    }

    const newFields = [...form.fields];
    const [removed] = newFields.splice(sourceIndex, 1);
    newFields.splice(targetIndex, 0, removed);

    setForm((prev) => ({ ...prev, fields: newFields }));
    setDraggedField(null);
  };
  const updateForm = (newForm) => {
    const newHistory = history.slice(0, currentStep + 1); // Remove future steps
    setHistory([...newHistory, newForm]);
    setCurrentStep(newHistory.length);
    setForm(newForm);
  };
  const handleUndo = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setForm(history[currentStep - 1]);
    }
  };

  const handleRedo = () => {
    if (currentStep < history.length - 1) {
      setCurrentStep((prev) => prev + 1);
      setForm(history[currentStep + 1]);
    }
  };
  // Create form mutation
  const createFormMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Failed to create form");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["/api/forms"]);
      toast({ title: "Success", description: "Form created successfully!" });
      setForm({
        title: "",
        description: "",
        fields: [],
        settings: {
          allowAnonymous: true,
          submitMessage: "Thank you for your submission!",
        },
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create form",
        variant: "destructive",
      });
    },
  });

  // Update form mutation
  const updateFormMutation = useMutation({
    mutationFn: async ({ id, formData }) => {
      const response = await fetch(`/api/forms/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Failed to update form");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["/api/forms"]);
      toast({ title: "Success", description: "Form updated successfully!" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update form",
        variant: "destructive",
      });
    },
  });

  // Delete form mutation
  const deleteFormMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`/api/forms/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete form");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["/api/forms"]);
      toast({ title: "Success", description: "Form deleted successfully!" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete form",
        variant: "destructive",
      });
    },
  });

  // Publish form mutation
  const publishFormMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`/api/forms/${id}/publish`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to publish form");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["/api/forms"]);
      toast({ title: "Success", description: "Form published successfully!" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to publish form",
        variant: "destructive",
      });
    },
  });

  const addField = (fieldType) => {
    const newField = {
      id: `field_${Date.now()}`,
      type: fieldType,
      label: `New ${fieldType} field`,
      placeholder: "",
      required: false,
      options:
        fieldType === "dropdown" || fieldType === "multiselect"
          ? ["Option 1"]
          : [],
      order: form.fields.length,
    };
    updateForm({
      ...form,
      fields: [...form.fields, newField],
    });
  
    setSelectedField(newField.id);
  };
const validateForm = () => {
  const errors = [];

  // Check for missing field labels
  form.fields.forEach((field, index) => {
    if (!field.label || field.label.trim() === "") {
      errors.push(`Field ${index + 1} is missing a label.`);
    }
  });

  // Check for duplicate field IDs
  const fieldIds = form.fields.map((field) => field.id);
  const duplicateIds = fieldIds.filter((id, index) => fieldIds.indexOf(id) !== index);
  if (duplicateIds.length > 0) {
    errors.push("Duplicate field IDs found: " + duplicateIds.join(", "));
  }

  // Check for required fields without default values
  form.fields.forEach((field, index) => {
    if (field.required) {
      if (field.type === "dropdown" || field.type === "multiselect") {
        if (!field.options || field.options.length === 0) {
          errors.push(`Required field ${index + 1} (dropdown/multiselect) has no options.`);
        }
      } else if (field.type === "text" || field.type === "textarea") {
        if (!field.placeholder || field.placeholder.trim() === "") {
          errors.push(`Required field ${index + 1} (text/textarea) has no placeholder.`);
        }
      }
    }
  });

  return errors;
};
  const updateField = (fieldId, updates) => {
    updateForm({
      ...form,
      fields: form.fields.map((field) =>
        field.id === fieldId ? { ...field, ...updates } : field
      ),
    });
    setForm((prev) => ({
      ...prev,
      fields: prev.fields.map((field) =>
        field.id === fieldId ? { ...field, ...updates } : field
      ),
    }));
  };

  const removeField = (fieldId) => {
    updateForm({
      ...form,
      fields: form.fields.filter((field) => field.id !== fieldId),
    });
    setForm((prev) => ({
      ...prev,
      fields: prev.fields.filter((field) => field.id !== fieldId),
    }));
    setSelectedField(null);
  };

  const moveField = (fieldId, direction) => {
    const fieldIndex = form.fields.findIndex((f) => f.id === fieldId);
    if (fieldIndex === -1) return;

    const newIndex = direction === "up" ? fieldIndex - 1 : fieldIndex + 1;
    if (newIndex < 0 || newIndex >= form.fields.length) return;

    const newFields = [...form.fields];
    [newFields[fieldIndex], newFields[newIndex]] = [
      newFields[newIndex],
      newFields[fieldIndex],
    ];

    setForm((prev) => ({ ...prev, fields: newFields }));
  };

  const handleSave = () => {
    if (!form.title.trim()) {
      toast({
        title: "Error",
        description: "Form title is required",
        variant: "destructive",
      });
      return;
    }

    if (form.fields.length === 0) {
      toast({
        title: "Error",
        description: "Form must have at least one field",
        variant: "destructive",
      });
      return;
    }

    createFormMutation.mutate(form);
  };

  const handlePublish = (formId) => {
    publishFormMutation.mutate(formId);
  };

  const handleDelete = (formId) => {
    if (confirm("Are you sure you want to delete this form?")) {
      deleteFormMutation.mutate(formId);
    }
  };

  const copyShareLink = (accessLink) => {
    const shareUrl = `${window.location.origin}/public/forms/${accessLink}`;
    navigator.clipboard.writeText(shareUrl);
    toast({ title: "Success", description: "Share link copied to clipboard!" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading forms...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* Enhanced Header */}
      <div className=" bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Form Builder</h1>
          <p className="text-slate-600 mt-2">
            Create and customize dynamic forms with drag-and-drop simplicity
          </p>
        </div>
        <div className="">
          <div className="flex items-center justify-center space-x-3 mt-2">
            <Button
              onClick={handleSave}
              disabled={createFormMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Form
            </Button>
            <Button
              className="w-100 p-2"
              variant="outline"
              size="icon"
              title="Undo"
              onClick={handleUndo}
              disabled={currentStep <= 0}
            >
              <Undo2 className="mx-2 h-4 w-4" /> Undo
            </Button>
            <Button
              className="w-100 p-2"
              variant="outline"
              size="icon"
              title="Redo"
              onClick={handleRedo}
              disabled={currentStep >= history.length - 1}
            >
              <Redo2 className="mx-2 h-4 w-4" /> Redo
            </Button>
            <Button variant="outline" title="Validation Check" onClick={() => {
    const errors = validateForm();
    if (errors.length > 0) {
      toast({
        title: "Validation Errors",
        description: errors.join("\n"),
        variant: "destructive",
      });
    } else {
      toast({
        title: "Validation Successful",
        description: "No issues found in the form.",
        variant: "success",
      });
    }
  }}>
              <ShieldCheck className="mr-2 h-4 w-4" />
              Validate
            </Button>
            <Button variant="outline" onClick={() => setShowPreview(true)}>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                createFormMutation.isLoading || updateFormMutation.isLoading
              }
            >
              <Save className="mr-2 h-4 w-4" />
              {form.id ? "Save Draft" : "Save Draft"}
            </Button>
            <Button disabled>Save & Publish</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Builder */}
        <div className="lg:col-span-2 space-y-6">
          {/* Form Details */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-4 border-b border-slate-200">
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-blue-600" />
                Form Details
              </CardTitle>
              <p className="text-sm text-slate-900">
                Configure your form's basic information and settings
              </p>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Form Title *
                </label>
                <Input
                  placeholder="Enter a descriptive title for your form"
                  value={form.title}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <Textarea
                  placeholder="Provide a brief description of what this form is for (optional)"
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Fields */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-4 border-b border-slate-200">
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center">
                <Plus className="h-5 w-5 mr-2 text-green-600" />
                Form Fields
                <span className="ml-2 text-sm font-normal text-slate-500">
                  ({form.fields.length} fields)
                </span>
              </CardTitle>
              <p className="text-sm text-slate-600">
                Drag and drop fields to reorder, click to configure properties
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-2">
                {form.fields.map((field, index) => (
                  <div
                    key={field.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, field)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, field)}
                    className={`group border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedField === field.id
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-slate-200 hover:border-slate-300"
                    } ${draggedField === field.id ? "opacity-50" : ""}`}
                    onClick={() => setSelectedField(field.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-1 rounded hover:bg-slate-100 cursor-grab">
                          <GripVertical className="h-4 w-4 text-slate-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                             <span className="font-extrabold font-md text-slate-600">
                              {index+1}
                            </span>
                            <span className="font-medium text-slate-900">
                              {field.label}
                            </span>
                            {field.required && (
                              <span className="text-red-500 text-xs">*</span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-sm text-slate-500 capitalize bg-slate-100 px-2 py-1 rounded">
                              {field.type}
                            </span>
                            {field.placeholder && (
                              <span className="text-xs text-slate-400 italic">
                                "{field.placeholder}"
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveField(field.id, "up");
                          }}
                          disabled={index === 0}
                          className="h-8 w-8 p-0 hover:bg-slate-100"
                        >
                          ↑
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveField(field.id, "down");
                          }}
                          disabled={index === form.fields.length - 1}
                          className="h-8 w-8 p-0 hover:bg-slate-100"
                        >
                          ↓
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeField(field.id);
                          }}
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {form.fields.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-lg">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="p-3 bg-slate-100 rounded-full">
                        <Plus className="h-6 w-6 text-slate-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-slate-900">
                          No fields added yet
                        </h3>
                        <p className="text-slate-500 mt-1">
                          Start building your form by adding fields from the
                          panel on the right
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Form Actions
                </h3>
                <p className="text-sm text-slate-600">
                  Save your form or configure advanced settings
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowSettings(true)}
                  className="border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={
                    createFormMutation.isPending ||
                    !form.title.trim() ||
                    form.fields.length === 0
                  }
                  className="bg-green-600 hover:bg-green-700 text-white disabled:bg-slate-300"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {createFormMutation.isPending ? "Saving..." : "Save Form"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Field Types & Properties */}
        <div className="space-y-6">
          <FormFieldTypes onAddField={addField} />

          {selectedField && (
            <Card className="border-slate-200 shadow-sm bg-white">
              <CardHeader className="pb-4 border-b border-slate-200">
                <CardTitle className="text-lg font-semibold text-slate-900 flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-blue-600" />
                  Field Properties
                </CardTitle>
                <p className="text-sm text-slate-600">
                  Configure the selected field's behavior and appearance
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <FieldProperties
                  field={form.fields.find((f) => f.id === selectedField)}
                  onUpdate={(updates) => updateField(selectedField, updates)}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Existing Forms */}
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader className="pb-4 border-b border-slate-200">
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            Existing Forms
            <span className="ml-2 text-sm font-normal text-slate-500">
              ({forms.length} forms)
            </span>
          </CardTitle>
          <p className="text-sm text-slate-600">
            Manage your previously created forms and their settings
          </p>
        </CardHeader>
        <CardContent className="p-6">
          {forms.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-lg">
              <div className="flex flex-col items-center space-y-3">
                <div className="p-3 bg-slate-100 rounded-full">
                  <FileText className="h-6 w-6 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-900">
                    No forms created yet
                  </h3>
                  <p className="text-slate-500 mt-1">
                    Create your first form using the builder above
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {forms.map((form) => (
                <div
                  key={form._id}
                  className="group border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-slate-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 text-base truncate">
                        {form.title}
                      </h3>
                      {form.description && (
                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                          {form.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {form.isPublished && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyShareLink(form.accessLink)}
                          className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(form._id)}
                        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>{form.fields.length} fields</span>
                    <div className="flex items-center space-x-2">
                      {form.isPublished ? (
                        <span className="flex items-center text-green-600">
                          <Share2 className="h-3 w-3 mr-1" /> Published
                        </span>
                      ) : (
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => handlePublish(form._id)}
                          disabled={publishFormMutation.isPending}
                          className="border-blue-500 text-blue-600 hover:bg-blue-50"
                        >
                          Publish
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showPreview && (
        <FormPreview
          form={form}
          layout={layout}
          onClose={() => setShowPreview(false)}
        />
      )}

      {showSettings && (
        <FormSettings
          settings={form.settings}
          layout={layout}
          setLayout={setLayout}
          onUpdate={(newSettings) =>
            setForm((prev) => ({ ...prev, settings: newSettings }))
          }
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

function FieldProperties({ field, onUpdate }) {
  if (!field) return null;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Label
        </label>
        <Input
          value={field.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {(field.type === "text" ||
        field.type === "textarea" ||
        field.type === "email" ||
        field.type === "number") && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Placeholder
          </label>
          <Input
            value={field.placeholder}
            onChange={(e) => onUpdate({ placeholder: e.target.value })}
            className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      )}

      {(field.type === "dropdown" ||
        field.type === "multiselect" ||
        field.type === "radio" ||
        field.type === "checkbox") && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Options
          </label>
          {field.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                value={option}
                onChange={(e) => {
                  const newOptions = [...field.options];
                  newOptions[index] = e.target.value;
                  onUpdate({ options: newOptions });
                }}
                className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const newOptions = field.options.filter(
                    (_, i) => i !== index
                  );
                  onUpdate({ options: newOptions });
                }}
                className="hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const newOptions = [
                ...field.options,
                `Option ${field.options.length + 1}`,
              ];
              onUpdate({ options: newOptions });
            }}
            className="border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Option
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between pt-4">
        <span className="text-sm font-medium text-slate-700">Required</span>
        <label
          htmlFor={`required-${field.id}`}
          className="flex items-center cursor-pointer"
        >
          <div className="relative">
            <input
              id={`required-${field.id}`}
              type="checkbox"
              className="sr-only"
              checked={field.required}
              onChange={(e) => onUpdate({ required: e.target.checked })}
            />
            <div
              className={`block w-10 h-6 rounded-full ${
                field.required ? "bg-blue-600" : "bg-slate-300"
              }`}
            ></div>
            <div
              className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                field.required ? "transform translate-x-full" : ""
              }`}
            ></div>
          </div>
        </label>
      </div>
    </div>
  );
}
