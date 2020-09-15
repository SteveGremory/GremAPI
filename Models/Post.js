import mongoose from 'mongoose'

const postSchema = mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    text: String,
    image: String,
    timestamp: String
})

export default mongoose.model('Post', postSchema)