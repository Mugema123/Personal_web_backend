import mongoose from "mongoose";

const Schema = mongoose.Schema;

const projectsSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    projectImage: {
      type: String,
      required: true,
    },

    githubLink: {
      type: String,
      required: true,
    },

    demoLink: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("projects", projectsSchema);
