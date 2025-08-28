import mongoose from "mongoose";

const adminvoiceanalysisSchema = new mongoose.Schema({
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
    voice_analysis: {
        type: Array,
        required: true

    }
});


const Adminvoiceanalysis = mongoose.models.adminvoiceanalyses || mongoose.model("adminvoiceanalyses", adminvoiceanalysisSchema);
export default Adminvoiceanalysis;