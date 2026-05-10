import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`text-sm font-medium px-3 py-1.5 rounded-lg transition ${
        location.pathname === to
          ? "bg-blue-50 text-blue-600"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-base font-bold text-gray-900">
            TaskFlow
          </Link>
          <div className="flex items-center gap-1">
            {navLink("/", "Dashboard")}
            {navLink("/projects", "Projects")}
            {navLink("/tasks", "Tasks")}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {user?.name}
            <span className="ml-1.5 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
              {user?.role}
            </span>
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-red-500 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
