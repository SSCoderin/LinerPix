import mongoose from "mongoose";


const genimageSchema = new mongoose.Schema({

    userid: {
        type: String,
        required: true
    },
    contentid: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    content_description: {
        type: Array,
        required: true
    },
    gen_image: {
        // type: Array,
        type: [String],
        required: true
    }
});


const Genimage = mongoose.models.genimages || mongoose.model("genimages", genimageSchema);
export default Genimage;