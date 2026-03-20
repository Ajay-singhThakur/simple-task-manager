const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    status: { type: String, enum: ["pending", "completed"], default: "pending" }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false
  }
);

TaskSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = String(ret._id);
    delete ret._id;
    return ret;
  }
});

module.exports = mongoose.model("Task", TaskSchema);

