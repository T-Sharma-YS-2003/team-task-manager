const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Task = require("../models/Task");
const Project = require("../models/Project");
const { auth, adminOnly } = require("../middleware/auth");

router.get("/stats", auth, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ createdBy: req.user._id }, { members: req.user._id }],
    }).select("_id");
    const ids = projects.map((p) => p._id);

    const base =
      req.user.role === "admin"
        ? { project: { $in: ids } }
        : { project: { $in: ids }, assignee: req.user._id };

    const [total, todo, inProgress, done, overdue] = await Promise.all([
      Task.countDocuments(base),
      Task.countDocuments({ ...base, status: "todo" }),
      Task.countDocuments({ ...base, status: "in-progress" }),
      Task.countDocuments({ ...base, status: "done" }),
      Task.countDocuments({
        ...base,
        status: { $ne: "done" },
        dueDate: { $lt: new Date() },
      }),
    ]);

    res.json({ total, todo, inProgress, done, overdue });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const { status, priority, project, overdue } = req.query;

    const projects = await Project.find({
      $or: [{ createdBy: req.user._id }, { members: req.user._id }],
    }).select("_id");
    const ids = projects.map((p) => p._id);

    let query = { project: { $in: ids } };
    if (req.user.role === "member") query.assignee = req.user._id;
    if (project) query.project = project;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (overdue === "true") {
      query.dueDate = { $lt: new Date() };
      query.status = { $ne: "done" };
    }

    const tasks = await Task.find(query)
      .populate("assignee", "name email")
      .populate("project", "name")
      .populate("createdBy", "name")
      .sort("-createdAt");

    res.json(tasks);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

router.post(
  "/",
  auth,
  adminOnly,
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("project").notEmpty().withMessage("Project is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ message: errors.array()[0].msg });

    try {
      const {
        title,
        description,
        project,
        assignee,
        status,
        priority,
        dueDate,
      } = req.body;
      const task = await Task.create({
        title,
        description,
        project,
        assignee: assignee || null,
        status,
        priority,
        dueDate: dueDate || null,
        createdBy: req.user._id,
      });
      const populated = await Task.findById(task._id)
        .populate("assignee", "name email")
        .populate("project", "name")
        .populate("createdBy", "name");
      res.status(201).json(populated);
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  },
);

router.put("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const isAdmin = req.user.role === "admin";
    const isAssignee = task.assignee?.toString() === req.user._id.toString();
    if (!isAdmin && !isAssignee)
      return res.status(403).json({ message: "Access denied" });

    if (isAdmin) {
      const { title, description, assignee, status, priority, dueDate } =
        req.body;
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (assignee !== undefined) task.assignee = assignee || null;
      if (status) task.status = status;
      if (priority) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate || null;
    } else {
      if (req.body.status) task.status = req.body.status;
    }

    await task.save();
    const updated = await Task.findById(task._id)
      .populate("assignee", "name email")
      .populate("project", "name")
      .populate("createdBy", "name");
    res.json(updated);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", auth, adminOnly, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    await task.deleteOne();
    res.json({ message: "Task deleted" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
