import mongoose from "mongoose";

const Schema = mongoose.Schema

const contactSchema = new Schema ({
    image: {
        type: String, 
        required: true
    },

    description: {
        type: String, 
        required: true
    },

    yearsOfExperience: {
        type: Number, 
        required: true,
        default: 0
    },

    completedProjects: {
        type: Number, 
        required: true,
        default: 0
    },

    companiesWork: {
        type: Number, 
        required: true,
        default: 0
    },

    cv: {
        type: String, 
        required: true
    },

}, {
    timestamps: true
})

export default mongoose.model("About", contactSchema);