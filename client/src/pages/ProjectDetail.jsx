import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [memberEmail, setMemberEmail] = useState("");
  const [memberError, setMemberError] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    api
      .get(`/projects/${id}`)
      .then((res) => setProject(res.data))
      .catch(() => navigate("/projects"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    setMemberError("");
    setAdding(true);
    try {
      const res = await api.post(`/projects/${id}/members`, {
        email: memberEmail,
      });
      setProject(res.data);
      setMemberEmail("");
    } catch (err) {
      setMemberError(err.response?.data?.message || "Failed to add member");
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Remove this member?")) return;
    try {
      const res = await api.delete(`/projects/${id}/members/${userId}`);
      setProject(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove member");
    }
  };

  if (loading)
    return (
      <div className="text-sm text-gray-400 py-12 text-center">Loading...</div>
    );
  if (!project) return null;

  const isOwner = project.createdBy?._id === user?._id;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <button
          onClick={() => navigate("/projects")}
          className="text-sm text-gray-400 hover:text-gray-600 mb-3 inline-block"
        >
          ← Back to Projects
        </button>
        <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
        {project.description && (
          <p className="text-sm text-gray-500 mt-1">{project.description}</p>
        )}
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-900">Team Members</h2>
        <ul className="space-y-2">
          {project.members?.map((m) => (
            <li key={m._id} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm flex items-center justify-center font-medium">
                  {m.name[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{m.name}</p>
                  <p className="text-xs text-gray-400">{m.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full capitalize">
                  {m.role}
                </span>
                {isOwner && m._id !== project.createdBy?._id && (
                  <button
                    onClick={() => handleRemoveMember(m._id)}
                    className="text-gray-300 hover:text-red-400 text-lg leading-none transition"
                  >
                    ×
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>

        {isOwner && (
          <form
            onSubmit={handleAddMember}
            className="pt-2 border-t border-gray-50 space-y-2"
          >
            <label className="block text-xs font-medium text-gray-600">
              Add member by email
            </label>
            {memberError && (
              <p className="text-xs text-red-500">{memberError}</p>
            )}
            <div className="flex gap-2">
              <input
                type="email"
                required
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                placeholder="member@email.com"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={adding}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-50"
              >
                {adding ? "..." : "Add"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
