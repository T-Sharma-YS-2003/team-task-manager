import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

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

const Modal = ({ onClose, children }) => (
  <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 px-4">
    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
      >
        ×
      </button>
      {children}
    </div>
  </div>
);

const emptyForm = {
  title: "",
  description: "",
  project: "",
  assignee: "",
  status: "todo",
  priority: "medium",
  dueDate: "",
};

const TaskForm = ({
  form,
  setForm,
  onSubmit,
  onClose,
  error,
  saving,
  projects,
  projectMembers,
  isEdit,
}) => (
  <>
    <h2 className="text-lg font-bold text-gray-900 mb-4">
      {isEdit ? "Edit Task" : "New Task"}
    </h2>
    {error && (
      <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg mb-3">
        {error}
      </div>
    )}
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          required
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Task title"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          rows={2}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Project
        </label>
        <select
          required
          value={form.project}
          onChange={(e) =>
            setForm((f) => ({ ...f, project: e.target.value, assignee: "" }))
          }
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">Select project</option>
          {projects.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      {projectMembers.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assignee <span className="text-gray-400">(optional)</span>
          </label>
          <select
            value={form.assignee}
            onChange={(e) =>
              setForm((f) => ({ ...f, assignee: e.target.value }))
            }
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Unassigned</option>
            {projectMembers.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="todo">Todo</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            value={form.priority}
            onChange={(e) =>
              setForm((f) => ({ ...f, priority: e.target.value }))
            }
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Due Date <span className="text-gray-400">(optional)</span>
        </label>
        <input
          type="date"
          value={form.dueDate}
          onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-lg transition disabled:opacity-50"
        >
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Task"}
        </button>
      </div>
    </form>
  </>
);

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    project: "",
    overdue: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchTasks = async () => {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.priority) params.set("priority", filters.priority);
    if (filters.project) params.set("project", filters.project);
    if (filters.overdue) params.set("overdue", filters.overdue);
    const res = await api.get(`/tasks?${params.toString()}`);
    setTasks(res.data);
  };

  useEffect(() => {
    Promise.all([api.get("/projects"), api.get("/tasks")])
      .then(([pRes, tRes]) => {
        setProjects(pRes.data);
        setTasks(tRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading) fetchTasks();
  }, [filters]);

  useEffect(() => {
    if (!form.project) {
      setProjectMembers([]);
      return;
    }
    const found = projects.find((p) => p._id === form.project);
    setProjectMembers(found?.members || []);
  }, [form.project, projects]);

  const openCreate = () => {
    setForm(emptyForm);
    setError("");
    setShowCreate(true);
  };

  const openEdit = (task) => {
    setEditTask(task);
    setForm({
      title: task.title,
      description: task.description || "",
      project: task.project?._id || "",
      assignee: task.assignee?._id || "",
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        ...form,
        assignee: form.assignee || null,
        dueDate: form.dueDate || null,
      };
      if (editTask) {
        const res = await api.put(`/tasks/${editTask._id}`, payload);
        setTasks((prev) =>
          prev.map((t) => (t._id === editTask._id ? res.data : t)),
        );
        setEditTask(null);
      } else {
        const res = await api.post("/tasks", payload);
        setTasks((prev) => [res.data, ...prev]);
        setShowCreate(false);
      }
      setForm(emptyForm);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      const res = await api.put(`/tasks/${task._id}`, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t._id === task._id ? res.data : t)));
    } catch {
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch {
      alert("Failed to delete task");
    }
  };

  const isOverdue = (task) =>
    task.dueDate &&
    task.status !== "done" &&
    new Date(task.dueDate) < new Date();

  if (loading)
    return (
      <div className="text-sm text-gray-400 py-12 text-center">Loading...</div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Tasks</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""}
          </p>
        </div>
        {user?.role === "admin" && (
          <button
            onClick={openCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            + New Task
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="todo">Todo</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select
          value={filters.project}
          onChange={(e) => setFilters({ ...filters, project: e.target.value })}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
        <button
          onClick={() =>
            setFilters({ ...filters, overdue: filters.overdue ? "" : "true" })
          }
          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
            filters.overdue
              ? "bg-red-50 text-red-600 border-red-200"
              : "border-gray-200 text-gray-600 bg-white"
          }`}
        >
          Overdue
        </button>
        {Object.values(filters).some(Boolean) && (
          <button
            onClick={() =>
              setFilters({ status: "", priority: "", project: "", overdue: "" })
            }
            className="px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-gray-600 transition"
          >
            Clear
          </button>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl py-16 text-center">
          <p className="text-gray-400 text-sm">No tasks found.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <ul className="divide-y divide-gray-50">
            {tasks.map((task) => (
              <li key={task._id} className="px-5 py-4 flex items-center gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p
                      className={`text-sm font-medium ${isOverdue(task) ? "text-red-600" : "text-gray-800"}`}
                    >
                      {task.title}
                    </p>
                    {isOverdue(task) && (
                      <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full">
                        Overdue
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {task.project?.name}
                    {task.assignee
                      ? ` · ${task.assignee.name}`
                      : " · Unassigned"}
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
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task, e.target.value)}
                    className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize ${statusColor[task.status]}`}
                  >
                    <option value="todo">Todo</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                  {user?.role === "admin" && (
                    <>
                      <button
                        onClick={() => openEdit(task)}
                        className="text-xs text-gray-400 hover:text-blue-500 transition px-1"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(task._id)}
                        className="text-gray-300 hover:text-red-400 text-lg leading-none transition"
                      >
                        ×
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showCreate && (
        <Modal
          onClose={() => {
            setShowCreate(false);
            setError("");
          }}
        >
          <TaskForm
            form={form}
            setForm={setForm}
            onSubmit={handleSubmit}
            onClose={() => {
              setShowCreate(false);
              setError("");
            }}
            error={error}
            saving={saving}
            projects={projects}
            projectMembers={projectMembers}
            isEdit={false}
          />
        </Modal>
      )}

      {editTask && (
        <Modal
          onClose={() => {
            setEditTask(null);
            setError("");
          }}
        >
          <TaskForm
            form={form}
            setForm={setForm}
            onSubmit={handleSubmit}
            onClose={() => {
              setEditTask(null);
              setError("");
            }}
            error={error}
            saving={saving}
            projects={projects}
            projectMembers={projectMembers}
            isEdit={true}
          />
        </Modal>
      )}
    </div>
  );
}
