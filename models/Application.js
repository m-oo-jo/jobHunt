const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    experience: {
      type: String,
      required: true,
      trim: true,
    },

    portfolio: {
      type: String,
      trim: true,
    },

    message: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const Application = mongoose.model("Application", applicationSchema);

module.exports = Application;
