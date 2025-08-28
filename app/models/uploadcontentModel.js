import mongoose from "mongoose";


const uploadcontentSchema = new mongoose.Schema({
    userid: {
        type: String,
        required: true
    },
    username: {
      type: String,
      required: true  
    },
    type: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    topictype: {
        type: String,
        required: true
    },
    style: {
      type: String,
      required: true  
    },
    content: {
        type: String,
        required: true
    },
    first_image: {
        type: String,
        required: true
    }
});


const Uploadcontent = mongoose.models.uploadcontents || mongoose.model("uploadcontents", uploadcontentSchema);
export default Uploadcontent;