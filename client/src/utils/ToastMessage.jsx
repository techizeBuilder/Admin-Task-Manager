import { CheckCircle, XCircle } from "lucide-react";

const showSuccessToast = (message) => {
  toast({
    title: (
      <div className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <span>Success</span>
      </div>
    ),
    description: message,
    className: "bg-green-50 border-green-200 text-green-800",
  });
};

const showErrorToast = (message) => {
  toast({
    title: (
      <div className="flex items-center gap-2">
        <XCircle className="h-4 w-4 text-red-600" />
        <span>Error</span>
      </div>
    ),
    description: message,
    className: "bg-red-50 border-red-200 text-red-800",
  });
};
export { showSuccessToast, showErrorToast };