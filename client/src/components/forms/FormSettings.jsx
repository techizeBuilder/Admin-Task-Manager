import { Divide, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export function FormSettings({
  settings,
  onUpdate,
  onClose,
  layout,
  setLayout,
}) {
  const handleChange = (key, value) => {
    onUpdate({ ...settings, [key]: value });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Form Settings</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Allow Anonymous Submissions
            </label>
            <Switch
              checked={settings.allowAnonymous}
              onCheckedChange={(checked) =>
                handleChange("allowAnonymous", checked)
              }
            />
          </div>
          {/* <div className="h-6 border-b border-gray-300 mx-4"></div> */}
          <div className="space-y-4">

              <label className="text-sm font-medium">
                 Select Layout
            </label>
          <div className="flex items-center space-x-2">
            <Button
              className={`${layout === "1-column" ? "bg-blue-500 text-white" : ""}`}
              variant={layout === "1-column" ? "solid" : "outline"}
              onClick={() => setLayout("1-column")}
            >
              1 Column
            </Button>
            <Button
              className={`${layout === "2-column" ? "bg-blue-500 text-white" : ""}`}
              variant={layout === "2-column" ? "solid" : "outline"}
              onClick={() => setLayout("2-column")}
            >
              2 Columns
            </Button>
            <Button
              className={`${layout === "3-column" ? "bg-blue-500 text-white" : ""}`}
              variant={layout === "3-column" ? "solid" : "outline"}
              onClick={() => setLayout("3-column")}
            >
              3 Columns
            </Button>
          </div>
          </div>
                    {/* <div className="h-6 border-b border-gray-300 mx-4"></div> */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Submit Message
            </label>
            <Textarea
              value={settings.submitMessage}
              onChange={(e) => handleChange("submitMessage", e.target.value)}
              placeholder="Thank you for your submission!"
              rows={3}
            />
          </div>
          {/* <div className="h-6 border-b border-gray-300 mx-4"></div> */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Maximum Submissions (optional)
            </label>
            <Input
              type="number"
              value={settings.maxSubmissions || ""}
              onChange={(e) =>
                handleChange(
                  "maxSubmissions",
                  e.target.value ? parseInt(e.target.value) : null
                )
              }
              placeholder="No limit"
            />
          </div>
          {/* <div className="h-6 border-b border-gray-300 mx-4"></div> */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Redirect URL (optional)
            </label>
            <Input
              type="url"
              value={settings.redirectUrl || ""}
              onChange={(e) => handleChange("redirectUrl", e.target.value)}
              placeholder="https://example.com/thank-you"
            />
          </div>

          <div className="flex justify-between space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button className='bg-blue-500 text-white' onClick={onClose}>Save Settings</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
