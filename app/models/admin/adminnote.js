import mongoose from "mongoose";



const adminnoteSchema = new mongoose.Schema({
    userid: {
        type: String,
        required: true
    },
    note: {
        type: String,
        required: true
    }
});

const Adminnote = mongoose.models.adminnotes || mongoose.model("adminnotes", adminnoteSchema);
export default Adminnote;