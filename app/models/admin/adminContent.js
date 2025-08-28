import mongoose from "mongoose";

const adminContentSchema = new mongoose.Schema({
  userid: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,

    required: true,
  },
  style: {
    type: String,

    required: true,
  },
  content_description: {
    type: Array,
    required: true,
  },
  ImageData: {
    type: Array,
    required: true,
  },
});

const AdminContent =
  mongoose.models.admincontents ||
  mongoose.model("admincontents", adminContentSchema);
export default AdminContent;
