const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/User");
const { auth, adminOnly } = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  try {
    const query =
      req.user.role === "admin"
        ? { $or: [{ createdBy: req.user._id }, { members: req.user._id }] }
        : { members: req.user._id };

    const projects = await Project.find(query)
      .populate("createdBy", "name email")
      .populate("members", "name email role")
      .sort("-createdAt");

    const result = await Promise.all(
      projects.map(async (p) => {
        const taskCount = await Task.countDocuments({ project: p._id });
        return { ...p.toObject(), taskCount };
      }),
    );

    res.json(result);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

router.post(
  "/",
  auth,
  adminOnly,
  [body("name").trim().notEmpty().withMessage("Project name is required")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ message: errors.array()[0].msg });

    try {
      const { name, description } = req.body;
      const project = await Project.create({
        name,
        description,
        createdBy: req.user._id,
        members: [req.user._id],
      });
      const populated = await Project.findById(project._id)
        .populate("createdBy", "name email")
        .populate("members", "name email role");
      res.status(201).json({ ...populated.toObject(), taskCount: 0 });
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  },
);

router.get("/:id", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("members", "name email role");

    if (!project) return res.status(404).json({ message: "Project not found" });

    const isMember = project.members.some(
      (m) => m._id.toString() === req.user._id.toString(),
    );
    if (!isMember) return res.status(403).json({ message: "Access denied" });

    res.json(project);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", auth, adminOnly, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const { name, description } = req.body;
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    await project.save();
    const updated = await Project.findById(project._id)
      .populate("createdBy", "name email")
      .populate("members", "name email role");
    res.json(updated);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", auth, adminOnly, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    await Task.deleteMany({ project: project._id });
    await project.deleteOne();
    res.json({ message: "Project deleted" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:id/members", auth, adminOnly, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const userToAdd = await User.findOne({ email: email.toLowerCase() });
    if (!userToAdd) return res.status(404).json({ message: "User not found" });
    if (project.members.includes(userToAdd._id)) {
      return res.status(400).json({ message: "Already a member" });
    }

    project.members.push(userToAdd._id);
    await project.save();

    const updated = await Project.findById(project._id)
      .populate("createdBy", "name email")
      .populate("members", "name email role");
    res.json(updated);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id/members/:userId", auth, adminOnly, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (project.createdBy.toString() === req.params.userId) {
      return res.status(400).json({ message: "Cannot remove project creator" });
    }
    project.members = project.members.filter(
      (m) => m.toString() !== req.params.userId,
    );
    await project.save();
    const updated = await Project.findById(project._id)
      .populate("createdBy", "name email")
      .populate("members", "name email role");
    res.json(updated);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
