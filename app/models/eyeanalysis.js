import mongoose from "mongoose";



const eyeanalysisSchema = new mongoose.Schema({
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
    duration: {
        type: Array,
        required: true
    },
    eye_analysis: {
        type: Array,
        required: true
    }
});


const Eyeanalysis = mongoose.models.eyeanalyses || mongoose.model("eyeanalyses", eyeanalysisSchema);
export default Eyeanalysis; 