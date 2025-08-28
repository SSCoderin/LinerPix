import mongoose from "mongoose";

const admintaskSchema = new mongoose.Schema({
  userid: {
    type: String,
    required: true,
  },
  TaskTitle: {
    type: String,
    required: true,
  },Mode: {
    type: String,
    required: true,
  },
  contentTitles: {
    type: Array,
    required: true,
  },
  content_ids: {
    type: Array,
    required: true,
  },
});

const Admintask =
  mongoose.models.admintasks || mongoose.model("admintasks", admintaskSchema);
export default Admintask;
