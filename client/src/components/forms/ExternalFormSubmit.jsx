import { useEffect, useRef, useState } from "react";
import { useRoute } from "wouter";
import SignatureCanvas from "react-signature-canvas";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Demo schema used when token=demo, ?demo=1, or API fails
const DEMO_FORM = {
  title: "Public Demo Form",
  description: "This is a demo of the external submission page.",
  fields: [
    { id: "full_name", type: "text", label: "Full Name", required: true, placeholder: "John Doe", default_value: "John Demo" },
    { id: "email", type: "email", label: "Email", required: true, placeholder: "name@example.com", default_value: "john@example.com" },
    { id: "vendor_type", type: "dropdown", label: "Vendor Type", options: ["Manufacturer", "Supplier", "Distributor"], placeholder: "Select type", default_value: "Supplier" },
    { id: "services", type: "multiselect", label: "Services", options: ["Logistics", "Packaging", "QC"], default_value: ["QC"] },
    { id: "about", type: "textarea", label: "About", placeholder: "Tell us about your company", default_value: "Sample description for demo." },
    { id: "quantity", type: "number", label: "Quantity", validation: { min: 1, max: 1000 }, default_value: 10 },
    { id: "expected_date", type: "date", label: "Expected Date" },
    { id: "location", type: "location_picker", label: "Location" },
    { id: "signature", type: "signature", label: "Signature" },
    { id: "files", type: "file_upload", label: "Attachments", placeholder: "Upload files", multiple: true, accept: "*" },
  ],
};

export default function ExternalFormSubmit() {
  const [match, params] = useRoute("/public-forms/:token");
  const token = params?.token;
  const isDemo =
    !token ||
    token === "demo" ||
    new URLSearchParams(window.location.search).has("demo");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(null);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  // Refs/hooks needed by certain controls
  const signatureCanvasRef = useRef(null);
  const [userLocation, setUserLocation] = useState({
    lat: 20.5937,
    lng: 78.9629,
  }); // India default
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) =>
          setUserLocation({ lat: coords.latitude, lng: coords.longitude }),
        () => {}
      );
    }
  }, []);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  // Fetch published form schema by token (with demo fallback)
  useEffect(() => {
    let isMounted = true;

    const initDefaults = (schema) => {
      const defaults = {};
      schema?.fields?.forEach((f) => {
        if (f.default_value != null) defaults[f.id] = f.default_value;
      });
      // If there’s a location field and no default, set Bengaluru for demo
      const loc = schema?.fields?.find((f) => f.type === "location_picker");
      if (loc && defaults[loc.id] == null) {
        defaults[loc.id] = { lat: 12.9716, lng: 77.5946 };
      }
      return defaults;
    };

    // Demo mode: skip API
    if (isDemo) {
      const defaults = initDefaults(DEMO_FORM);
      setForm(DEMO_FORM);
      setFormData(defaults);
      setLoading(false);
      return () => {};
    }

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/public/forms/${token}`);
        if (!res.ok) throw new Error("Failed to load form");
        const data = await res.json();
        if (!isMounted) return;
        setForm(data);
        setFormData(initDefaults(data));
      } catch (e) {
        console.error(e);
        // Fallback to demo on error
        if (!isMounted) return;
        setForm(DEMO_FORM);
        setFormData(initDefaults(DEMO_FORM));
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [token, isDemo]);

  const evaluateConditions = (field) => {
    if (!field?.conditions?.length) return true;
    const evalCond = (cond) => {
      const left = formData[cond.field];
      switch (cond.operator) {
        case "equals":
          return left === cond.value;
        case "not_equals":
          return left !== cond.value;
        case "contains":
          return String(left ?? "").includes(cond.value);
        default:
          return true;
      }
    };
    return field.conditions.every(evalCond);
  };

  const validateRequired = () => {
    const nextErrors = {};
    form?.fields?.forEach((f) => {
      if (!evaluateConditions(f)) return;
      if (f.required) {
        const v = formData[f.id];
        const empty =
          v == null || v === "" || (Array.isArray(v) && v.length === 0);
        if (empty) nextErrors[f.id] = "This field is required.";
      }
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const setValue = (fieldId, value) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    setErrors((prev) => ({ ...prev, [fieldId]: undefined }));
  };

  const renderField = (field) => {
    const commonProps = {
      placeholder: field.placeholder,
      required: field.required,
      value: formData[field.id] ?? "",
      onChange: (e) => setValue(field.id, e.target.value),
    };

    switch (field.type) {
      case "text":
      case "email":
      case "phone":
        return (
          <Input
            {...commonProps}
            type={
              field.type === "email"
                ? "email"
                : field.type === "phone"
                ? "tel"
                : "text"
            }
          />
        );

      case "number":
        return (
          <Input
            {...commonProps}
            type="number"
            min={field.validation?.min}
            max={field.validation?.max}
          />
        );

      case "date":
        return <Input {...commonProps} type="date" />;

      case "textarea":
        return <Textarea {...commonProps} rows={4} />;

      case "dropdown":
        return (
          <Select
            value={formData[field.id] ?? ""}
            onValueChange={(v) => setValue(field.id, v)}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={field.placeholder || "Select an option"}
              />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((o, i) => (
                <SelectItem key={i} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "multiselect":
        return (
          <div className="space-y-2">
            {field.options?.map((option, idx) => {
              const selected = Array.isArray(formData[field.id])
                ? formData[field.id]
                : [];
              const checked = selected.includes(option);
              return (
                <label key={idx} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const next = new Set(selected);
                      if (e.target.checked) next.add(option);
                      else next.delete(option);
                      setValue(field.id, Array.from(next));
                    }}
                  />
                  <span className="text-sm">{option}</span>
                </label>
              );
            })}
          </div>
        );

      case "file_upload":
        return (
          <div>
            <input
              type="file"
              accept={field.accept || "*"}
              multiple={!!field.multiple}
              onChange={(e) => setValue(field.id, e.target.files)}
              className="border border-gray-300 rounded-md p-2 w-full"
            />
            {field.placeholder && (
              <p className="text-sm text-gray-500 mt-1">{field.placeholder}</p>
            )}
          </div>
        );

      case "signature":
        return (
          <div className="border border-gray-300 rounded-md p-4">
            <p className="text-sm text-gray-500 mb-2">Draw your signature:</p>
            <SignatureCanvas
              penColor="black"
              canvasProps={{
                width: 500,
                height: 200,
                className: "border border-gray-300 rounded-md",
              }}
              onEnd={() => {
                const data = signatureCanvasRef.current?.toDataURL() || "";
                setValue(field.id, data);
              }}
              ref={signatureCanvasRef}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                signatureCanvasRef.current?.clear();
                setValue(field.id, "");
              }}
              className="mt-2"
            >
              Clear
            </Button>
          </div>
        );

      case "location_picker":
        if (!isLoaded) return <p>Loading map...</p>;
        return (
          <div className="border border-gray-300 rounded-md p-4">
            <p className="text-sm text-gray-500 mb-2">Pick a location:</p>
            <div className="w-full h-64">
              <GoogleMap
                center={formData[field.id] || userLocation}
                zoom={13}
                mapContainerStyle={{ width: "100%", height: "100%" }}
                onClick={(e) => setValue(field.id, e.latLng.toJSON())}
              >
                <Marker
                  position={formData[field.id] || userLocation}
                  draggable
                  onDragEnd={(e) => setValue(field.id, e.latLng.toJSON())}
                />
              </GoogleMap>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-gray-500">Unsupported field: {field.type}</div>
        );
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validateRequired()) return;

    setSubmitting(true);
    try {
      // Always send multipart: JSON payload + files
      const fd = new FormData();
      const payload = {};
      Object.entries(formData).forEach(([key, val]) => {
        if (val instanceof FileList) {
          Array.from(val).forEach((file, idx) => {
            fd.append(`${key}[${idx}]`, file);
          });
        } else {
          payload[key] = val;
        }
      });
      fd.append("payload", JSON.stringify(payload));

      // In demo mode, skip API and show success
      if (isDemo) {
        await new Promise((r) => setTimeout(r, 600));
        alert("Submitted (demo). No data sent to server.");
        return;
      }

      const res = await fetch(`/api/public/forms/${token}/submit`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrors(data?.errors || {});
        throw new Error("Submission failed");
      }
      alert("Submitted successfully!");
    } catch (err) {
      console.error(err);
      alert("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (match === false) return <div className="p-6">URL not matched.</div>;

  if (loading) return <div className="p-6">Loading form…</div>;
  if (!form) return <div className="p-6">Form not found or unavailable.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-md shadow p-6">
          {isDemo && (
            <div className="mb-4 rounded bg-amber-50 text-amber-800 p-2 text-sm">
              Demo mode: showing sample form. Use /public-forms/&lt;token&gt; for real forms.
            </div>
          )}
          <h1 className="text-2xl font-bold">{form.title || "Public Form"}</h1>
          {form.description && (
            <p className="text-gray-600 mt-2">{form.description}</p>
          )}
          <form onSubmit={onSubmit} className="mt-6 space-y-6">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-1">
              {form.fields?.map((field) => {
                if (!evaluateConditions(field)) return null;
                return (
                  <div key={field.id} className="space-y-2 md:col-span-1">
                    <label className="block text-sm font-medium">
                      {field.label}
                      {field.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    {renderField(field)}
                    {errors[field.id] && (
                      <p className="text-sm text-red-600">{errors[field.id]}</p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t">
              <Button className="w-full bg-blue-500 text-white" type="submit" disabled={submitting}>
                {submitting ? "Submitting…" : "Submit"}
              </Button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Public submission. You are not signed in.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}