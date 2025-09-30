import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Palette, Upload, RotateCcw, Eye, Save } from "lucide-react";

export default function LoginCustomization() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    backgroundColor: "#f3f4f6",
    gradientFrom: "#e5e7eb", 
    gradientTo: "#d1d5db",
    useGradient: true,
    backgroundImage: "",
    overlayOpacity: 0.5
  });
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const gradientPresets = [
    { name: "Default Gray", from: "#f3f4f6", to: "#e5e7eb" },
    { name: "Ocean Blue", from: "#0ea5e9", to: "#0284c7" },
    { name: "Sunset Orange", from: "#f97316", to: "#ea580c" },
    { name: "Forest Green", from: "#16a34a", to: "#15803d" },
    { name: "Purple Night", from: "#7c3aed", to: "#5b21b6" },
    { name: "Rose Gold", from: "#f43f5e", to: "#e11d48" },
    { name: "Dark Slate", from: "#334155", to: "#1e293b" }
  ];

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File",
          description: "Please select an image file",
          variant: "destructive"
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive"
        });
        return;
      }

      try {
        // Upload the file to the server
        const formData = new FormData();
        formData.append('backgroundImage', file);

        const response = await fetch('/api/super-admin/upload-background', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        if (response.ok) {
          const result = await response.json();
          handleSettingChange('backgroundImage', result.imageUrl);
          toast({
            title: "Image Uploaded",
            description: "Background image uploaded successfully"
          });
        } else {
          throw new Error('Upload failed');
        }
      } catch (error) {
        // Fallback to base64 for local preview
        const reader = new FileReader();
        reader.onload = (e) => {
          handleSettingChange('backgroundImage', e.target.result);
        };
        reader.readAsDataURL(file);
        
        toast({
          title: "Local Preview",
          description: "Image loaded for preview. Save settings to persist changes."
        });
      }
    }
  };

  const resetToDefault = () => {
    setSettings({
      backgroundColor: "#f3f4f6",
      gradientFrom: "#e5e7eb",
      gradientTo: "#d1d5db", 
      useGradient: true,
      backgroundImage: "",
      overlayOpacity: 0.5
    });
    toast({
      title: "Reset to Default",
      description: "Login page styling has been reset to default settings"
    });
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/super-admin/login-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        toast({
          title: "Settings Saved",
          description: "Login page customization has been applied successfully"
        });
      } else {
        throw new Error("Failed to save settings");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateBackgroundStyle = () => {
    if (settings.backgroundImage) {
      return {
        backgroundImage: `linear-gradient(rgba(0,0,0,${settings.overlayOpacity}), rgba(0,0,0,${settings.overlayOpacity})), url(${settings.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    } else if (settings.useGradient) {
      return {
        background: `linear-gradient(135deg, ${settings.gradientFrom}, ${settings.gradientTo})`
      };
    } else {
      return {
        backgroundColor: settings.backgroundColor
      };
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Login Page Customization</h1>
        <p className="text-sm text-gray-600 mt-1">
          Customize the appearance of the login pages for both regular users and super admin access
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Settings Panel */}
        <div className="space-y-6">
          {/* Background Type */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Background Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    checked={!settings.backgroundImage && settings.useGradient}
                    onChange={() => {
                      handleSettingChange('backgroundImage', '');
                      handleSettingChange('useGradient', true);
                    }}
                    className="text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Gradient Background</span>
                </label>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    checked={!settings.backgroundImage && !settings.useGradient}
                    onChange={() => {
                      handleSettingChange('backgroundImage', '');
                      handleSettingChange('useGradient', false);
                    }}
                    className="text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Solid Color</span>
                </label>
              </div>

              {/* <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    checked={!!settings.backgroundImage}
                    onChange={() => {
                      // Trigger file input when custom image is selected
                      const fileInput = document.querySelector('input[type="file"]');
                      if (fileInput) {
                        fileInput.click();
                      }
                    }}
                    className="text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Custom Image</span>
                </label>
              </div> */}
            </div>
          </div>

          {/* Image Upload */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Background Image</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              {settings.backgroundImage && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Overlay Opacity: {Math.round(settings.overlayOpacity * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.overlayOpacity}
                    onChange={(e) => handleSettingChange('overlayOpacity', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </div>
          {/* Gradient Settings */}
          {!settings.backgroundImage && settings.useGradient && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Gradient Colors</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Color</label>
                  <input
                    type="color"
                    value={settings.gradientFrom}
                    onChange={(e) => handleSettingChange('gradientFrom', e.target.value)}
                    className="w-full h-10 rounded border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To Color</label>
                  <input
                    type="color"
                    value={settings.gradientTo}
                    onChange={(e) => handleSettingChange('gradientTo', e.target.value)}
                    className="w-full h-10 rounded border border-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Preset Gradients</label>
                <div className="grid grid-cols-2 gap-2">
                  {gradientPresets.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        handleSettingChange('gradientFrom', preset.from);
                        handleSettingChange('gradientTo', preset.to);
                      }}
                      className="p-2 rounded text-xs font-medium border border-gray-200 hover:border-gray-300 transition-colors"
                      style={{
                        background: `linear-gradient(135deg, ${preset.from}, ${preset.to})`,
                        color: 'white',
                        textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                      }}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Solid Color Settings */}
          {!settings.backgroundImage && !settings.useGradient && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Background Color</h3>
              <input
                type="color"
                value={settings.backgroundColor}
                onChange={(e) => handleSettingChange('backgroundColor', e.target.value)}
                className="w-full h-12 rounded border border-gray-300"
              />
            </div>
          )}


          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={saveSettings}
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{isLoading ? "Saving..." : "Save Settings"}</span>
            </button>
            
            <button
              onClick={resetToDefault}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center space-x-2 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                <Eye className="h-4 w-4" />
                <span>{previewMode ? "Exit" : "Fullscreen"}</span>
              </button>
            </div>
            
            <div 
              className="relative h-96 rounded-lg overflow-hidden border border-gray-200"
              style={generateBackgroundStyle()}
            >
              {/* Mock Login Form */}
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg p-6 w-80 shadow-xl">
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-2"></div>
                    <h2 className="text-xl font-bold">Welcome Back</h2>
                    <p className="text-gray-600 text-sm">Sign in to your account</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="w-full h-10 bg-gray-100 rounded border"></div>
                    </div>
                    <div>
                      <div className="w-full h-10 bg-gray-100 rounded border"></div>
                    </div>
                    <div className="w-full h-10 bg-blue-600 rounded text-white flex items-center justify-center text-sm font-medium">
                      Sign In
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-yellow-800 mb-2">Important Notes</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Changes will apply to both /login and /super-admin/login routes</li>
              <li>• Use high contrast backgrounds to ensure login form readability</li>
              <li>• Recommended image size: 1920x1080px or larger</li>
              <li>• Changes take effect immediately after saving</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Fullscreen Preview Modal */}
      {previewMode && (
        <div className="fixed inset-0 z-50" style={generateBackgroundStyle()}>
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4"></div>
                <h2 className="text-2xl font-bold">Welcome Back</h2>
                <p className="text-gray-600">Sign in to your account</p>
              </div>
              
              <div className="space-y-4">
                <input className="w-full p-3 border rounded-lg" placeholder="Email address" />
                <input className="w-full p-3 border rounded-lg" placeholder="Password" type="password" />
                <button className="w-full p-3 bg-blue-600 text-white rounded-lg font-medium">
                  Sign In
                </button>
              </div>
              
              <button
                onClick={() => setPreviewMode(false)}
                className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}