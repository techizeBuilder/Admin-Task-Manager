import { useEffect, useState } from "react";
import { X } from "lucide-react";
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

import SignatureCanvas from "react-signature-canvas";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

export function FormPreview({ form, onClose, layout }) {
  const [formData, setFormData] = useState({});
  const signatureCanvasRef = useState(null);
  const evaluateConditions = (field) => {
    if (!field.conditions || field.conditions.length === 0) return true;

    return field.conditions.every((condition) => {
      const targetField = form.fields.find((f) => f.id === condition.field);
      if (!targetField) return false;

      const targetValue = targetField.value || ""; // Assume `value` holds the current value of the field
      switch (condition.operator) {
        case "equals":
          return targetValue === condition.value;
        case "not_equals":
          return targetValue !== condition.value;
        case "contains":
          return targetValue.includes(condition.value);
        default:
          return false;
      }
    });
  };

  const renderField = (field) => {
    const handleChange = (value) => {
      setFormData((prev) => ({ ...prev, [field.id]: value }));
    };

    const commonProps = {
      placeholder: field.placeholder,
      required: field.required,
      value: formData[field.id] || "",
      onChange: (e) => handleChange(e.target.value),
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
          <Select value={formData[field.id] || ""} onValueChange={handleChange}>
            <SelectTrigger>
              <SelectValue
                placeholder={field.placeholder || "Select an option"}
              />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "multiselect":
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`${field.id}_${index}`}
                  checked={(formData[field.id] || []).includes(option)}
                  onChange={(e) => {
                    const currentValues = formData[field.id] || [];
                    const newValues = e.target.checked
                      ? [...currentValues, option]
                      : currentValues.filter((v) => v !== option);
                    handleChange(newValues);
                  }}
                  className="rounded"
                />
                <label htmlFor={`${field.id}_${index}`} className="text-sm">
                  {option}
                </label>
              </div>
            ))}
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
          const signatureData = signatureCanvasRef.current.toDataURL();
          handleChange(signatureData);
        }}
        ref={signatureCanvasRef}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => signatureCanvasRef.current.clear()}
        className="mt-2"
      >
        Clear Signature
      </Button>
    </div>
      );

    case "file_upload":
      return (
        <div>
          <input
            type="file"
            id={`file_${field.id}`}
            accept={field.accept || "*"}
            onChange={(e) => handleChange(e.target.files)}
            className="border border-gray-300 rounded-md p-2 w-full"
          />
          <p className="text-sm text-gray-500 mt-1">
            {field.placeholder || "Upload a file"}
          </p>
        </div>
      );

case "location_picker":
  const [userLocation, setUserLocation] = useState({ lat: 51.505, lng: -0.09 }); // Default location

  // Fetch user's location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          handleChange({ lat: latitude, lng: longitude }); // Set initial location in form data
        },
        (error) => {
          console.error("Error fetching location:", error);
        }
      );
    }
  }, []);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, // Use API key from environment variables
  });

  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <div className="border border-gray-300 rounded-md p-4">
      <p className="text-sm text-gray-500 mb-2">Pick a location:</p>
      <div className="w-full h-64">
        <GoogleMap
          center={formData[field.id] || userLocation} // Use user's location or form data
          zoom={13}
          mapContainerStyle={{ width: "100%", height: "100%" }}
          onClick={(e) => {
            const latLng = e.latLng.toJSON();
            handleChange(latLng); // Update form data on map click
          }}
        >
          <Marker
            position={formData[field.id] || userLocation} // Use user's location or form data
            draggable={true}
            onDragEnd={(e) => {
              const latLng = e.latLng.toJSON();
              handleChange(latLng); // Update form data on marker drag
            }}
          />
        </GoogleMap>
      </div>
    </div>
  );
   
  
  
  default:
        return (
          <div className="text-gray-500">Unknown field type: {field.type}</div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Form Preview</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Form Header */}
          <div>
            <h1 className="text-2xl font-bold">
              {form.title || "Untitled Form"}
            </h1>
            {form.description && (
              <p className="text-gray-600 mt-2">{form.description}</p>
            )}
          </div>

          {/* Form Fields */}
          <div
            className={`grid gap-4 ${
              layout === "1-column"
                ? "grid-cols-1"
                : layout === "2-column"
                ? "grid-cols-2"
                : "grid-cols-3"
            }`}
          >
            {form.fields.map(
              (field) =>
                evaluateConditions(field) && (
                  <div key={field.id} className="space-y-2">
                    <label className="block text-sm font-medium">
                      {field.label}
                      {field.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    {renderField(field)}
                  </div>
                )
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t">
            <Button className="w-full" disabled>
              Submit Form (Preview Mode)
            </Button>
            <p className="text-sm text-gray-500 mt-2 text-center">
              This is a preview. The form cannot be submitted in preview mode.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
