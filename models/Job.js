const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },

    company: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    responsibilities: {
      type: [String],
      default: [],
    },

    requirements: {
      type: [String],
      default: [],
    },

    experience: {
      type: String,
      required: true,
    },
    recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
},
  },
  {
    timestamps: true,
  },
);

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;
