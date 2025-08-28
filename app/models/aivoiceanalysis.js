import mongoose from "mongoose";

const aivoiceanalysisSchema = new mongoose.Schema({
  userid: {
    type: String,
    required: true,
  },
  analysis_id: {
    type: String,
    required: true,
  },
  aianalysis: {
    type: String,
    required: true,
  },
});



const Aivoiceanalysis = mongoose.models.aivoiceanalyses || mongoose.model("aivoiceanalyses", aivoiceanalysisSchema);
export default Aivoiceanalysis;