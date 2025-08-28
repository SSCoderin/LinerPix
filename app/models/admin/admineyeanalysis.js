import mongoose from "mongoose";

const admineyeanalysisSchema = new mongoose.Schema({
    studentid: {
        type: String,
        required: true
    },
    studentname: {
        type: String,
        required: true
    },
    content_title: {
        type: String,
        required: true
    },
    task_id: {
        type: String,
        required: true
    },
    student_email: {
        type: String,
        required: true
    },
    content_id: {
      type: String,
      required: true  
    },
    duration: {
        type: Array,
        required: true
    },
    eye_analysis: {
        type: Array,
        required: true

    }
});


const Admineyeanalysis = mongoose.models.admineyeanalyses || mongoose.model("admineyeanalyses", admineyeanalysisSchema);
export default Admineyeanalysis;