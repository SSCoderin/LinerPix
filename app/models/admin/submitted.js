import mongoose from "mongoose";

const submittedSchema = new mongoose.Schema({
    userid: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    task_id: {
        type: String,
        required: true,
    }
});

const Submitted = mongoose.models.submitteds || mongoose.model("submitteds", submittedSchema);
export default Submitted;