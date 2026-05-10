import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const Modal = ({ onClose, children }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
      {children}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
      >
        ×
      </button>
    </div>
  </div>
);

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchProjects = () => {
    api
      .get("/projects")
      .then((res) => setProjects(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setCreating(true);
    try {
      const res = await api.post("/projects", form);
      setProjects((prev) => [res.data, ...prev]);
      setShowCreate(false);
      setForm({ name: "", description: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project and all its tasks?")) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p._id !== id));
    } catch {
      alert("Failed to delete project");
    }
  };

  if (loading)
    return (
      <div className="text-sm text-gray-400 py-12 text-center">Loading...</div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        {user?.role === "admin" && (
          <button
            onClick={() => setShowCreate(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            + New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl py-16 text-center">
          <p className="text-gray-400 text-sm">No projects yet.</p>
          {user?.role === "admin" && (
            <button
              onClick={() => setShowCreate(true)}
              className="mt-3 text-blue-600 text-sm hover:underline"
            >
              Create your first project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project._id}
              className="bg-white border border-gray-100 rounded-xl p-5 flex flex-col gap-3 hover:shadow-sm transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="font-semibold text-gray-900 truncate">
                    {project.name}
                  </h2>
                  {project.description && (
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                </div>
                {user?.role === "admin" &&
                  project.createdBy?._id === user._id && (
                    <button
                      onClick={() => handleDelete(project._id)}
                      className="text-gray-300 hover:text-red-400 text-lg leading-none shrink-0 transition"
                    >
                      ×
                    </button>
                  )}
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>
                  {project.taskCount ?? 0} task
                  {project.taskCount !== 1 ? "s" : ""}
                </span>
                <span>·</span>
                <span>
                  {project.members?.length ?? 0} member
                  {project.members?.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                <div className="flex -space-x-1.5">
                  {project.members?.slice(0, 4).map((m) => (
                    <div
                      key={m._id}
                      title={m.name}
                      className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-medium border-2 border-white"
                    >
                      {m.name[0].toUpperCase()}
                    </div>
                  ))}
                  {project.members?.length > 4 && (
                    <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs flex items-center justify-center font-medium border-2 border-white">
                      +{project.members.length - 4}
                    </div>
                  )}
                </div>
                <Link
                  to={`/projects/${project._id}`}
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  View →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <Modal
          onClose={() => {
            setShowCreate(false);
            setError("");
          }}
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4">New Project</h2>
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg mb-3">
              {error}
            </div>
          )}
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Project name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="What's this project about?"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowCreate(false);
                  setError("");
                }}
                className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-lg transition disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
