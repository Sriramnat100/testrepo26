import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User, Settings, LogOut, ClipboardCheck } from "lucide-react";

export const TopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path) => location.pathname.includes(path);

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-8">
        {/* Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer" 
          onClick={() => navigate("/app/dashboard")}
          data-testid="logo-link"
        >
          <div className="w-10 h-10 bg-[#F9A825] rounded-lg flex items-center justify-center">
            <ClipboardCheck className="w-6 h-6 text-gray-900" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-gray-900 leading-tight">Cat Inspect</span>
            <span className="text-xs text-[#F9A825] font-semibold tracking-wide">AI</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Button
            variant={isActive("dashboard") ? "secondary" : "ghost"}
            className="font-medium"
            onClick={() => navigate("/app/dashboard")}
            data-testid="nav-dashboard"
          >
            Dashboard
          </Button>
        </nav>
      </div>

      {/* Profile Dropdown */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="flex items-center gap-2 h-10 px-3 hover:bg-gray-100"
            data-testid="profile-dropdown-trigger"
          >
            <div className="w-8 h-8 rounded-full bg-[#F9A825] flex items-center justify-center">
              <span className="text-sm font-semibold text-gray-900">SN</span>
            </div>
            <span className="hidden sm:inline font-medium text-gray-700">Sriram N.</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium text-gray-900">Sriram Nagarajan</p>
            <p className="text-xs text-gray-500">Field Inspector</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer" data-testid="settings-menu-item">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer text-red-600" data-testid="logout-menu-item">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default TopBar;
