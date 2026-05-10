import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const StatCard = ({ label, value, color }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-5">
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    <p className={`text-3xl font-bold ${color}`}>{value}</p>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/tasks/stats"), api.get("/tasks?limit=5")])
      .then(([statsRes, tasksRes]) => {
        setStats(statsRes.data);
        setRecentTasks(tasksRes.data.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Loading...
      </div>
    );
  }

  const statusColor = {
    todo: "bg-gray-100 text-gray-600",
    "in-progress": "bg-blue-50 text-blue-600",
    done: "bg-green-50 text-green-600",
  };

  const priorityColor = {
    low: "text-gray-400",
    medium: "text-yellow-500",
    high: "text-red-500",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Good to see you, {user?.name.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Here's what's happening today
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Tasks"
          value={stats?.total ?? 0}
          color="text-gray-900"
        />
        <StatCard
          label="In Progress"
          value={stats?.inProgress ?? 0}
          color="text-blue-600"
        />
        <StatCard
          label="Completed"
          value={stats?.done ?? 0}
          color="text-green-600"
        />
        <StatCard
          label="Overdue"
          value={stats?.overdue ?? 0}
          color="text-red-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Recent Tasks</h2>
          <Link to="/tasks" className="text-xs text-blue-600 hover:underline">
            View all
          </Link>
        </div>
        {recentTasks.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-gray-400">
            No tasks yet.{" "}
            {user?.role === "admin" && (
              <Link to="/tasks" className="text-blue-600 hover:underline">
                Create one
              </Link>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {recentTasks.map((task) => (
              <li
                key={task._id}
                className="px-5 py-3.5 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {task.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {task.project?.name}
                    {task.assignee ? ` · ${task.assignee.name}` : ""}
                    {task.dueDate
                      ? ` · Due ${new Date(task.dueDate).toLocaleDateString()}`
                      : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-xs font-medium capitalize ${priorityColor[task.priority]}`}
                  >
                    {task.priority}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusColor[task.status]}`}
                  >
                    {task.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
