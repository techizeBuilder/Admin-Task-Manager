import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Search, User, Settings, LogOut, Edit3 } from "lucide-react";
import ProfileUpdateModal from "@/components/profile/ProfileUpdateModal";

export default function Header({ user }) {
  const [, setLocation] = useLocation();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const queryClient = useQueryClient();

  // Fetch fresh user data for the header - prioritize profile API
  const { data: profileUser } = useQuery({
    queryKey: ["/api/profile"],
  });

  const { data: authUser } = useQuery({
    queryKey: ["/api/auth/verify"],
    initialData: user,
  });

  // Use profile data if available, fallback to auth data
  const currentUser = profileUser || authUser || user;

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      localStorage.removeItem("token");
      queryClient.clear();
      setLocation("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Force logout even if API call fails
      localStorage.removeItem("token");
      queryClient.clear();
      setLocation("/login");
    }
  };

  const getDisplayName = () => {
    if (currentUser?.firstName && currentUser?.lastName) {
      return `${currentUser.firstName} ${currentUser.lastName}`;
    }
    return currentUser?.email?.split("@")[0] || "User";
  };

  const getInitials = () => {
    // Always prioritize first name + last name initials
    if (currentUser?.firstName && currentUser?.lastName) {
      return `${currentUser.firstName.charAt(0)}${currentUser.lastName.charAt(0)}`.toUpperCase();
    }
    
    // If only first name exists, use first character twice
    if (currentUser?.firstName) {
      return `${currentUser.firstName.charAt(0)}${currentUser.firstName.charAt(0)}`.toUpperCase();
    }
    
    // Fallback to email prefix only if no name is available
    if (currentUser?.email) {
      const emailPrefix = currentUser.email.split('@')[0];
      return emailPrefix.substring(0, 2).toUpperCase();
    }
    
    return "U";
  };

  return (
    <header className="bg-white border-b border-gray-200 px-3 py-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
         
          <div className="relative ml-4">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-6 pr-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent w-32"
            />
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Bell className="h-3 w-3" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-6 w-6 rounded-full p-0"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={currentUser?.profileImageUrl}
                    alt={getDisplayName()}
                  />
                  <AvatarFallback className="bg-blue-600 text-white text-xs font-semibold">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 bg-gray-800 text-white"
              align="end"
              forceMount
            >
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium leading-none">
                  {getDisplayName()}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {currentUser?.email}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setLocation("/edit-profile")} className="cursor-pointer">
                <Edit3 className="mr-2 h-4 w-4" />
                <span>Edit Profile</span>
              </DropdownMenuItem>
              {/* <DropdownMenuItem onClick={() => setShowProfileModal(true)}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem> */}
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ProfileUpdateModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </header>
  );
}
