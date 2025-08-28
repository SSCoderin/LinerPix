import mongoose from "mongoose";


const voiceanalysisSchema = new mongoose.Schema({
    userid: {
        type: String,
        required: true
    },
contentid: {
        type: String,
        required: true
},
    title: {
        type: String,
        required: true
    },  
    content_description: {
        type: Array,
        required: true
    },
    voice_analysis: {
        type: Array,
        required: true
    }
});



const Voiceanalysis = mongoose.models.voiceanalyses || mongoose.model("voiceanalyses", voiceanalysisSchema);
export default Voiceanalysis;