import mongoose from "mongoose";

mongoose.connect(process.env.MONGO_URL,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

const connectSchema = new mongoose.Schema({
    recipientAccountId: {
        type: String,
        required: true,
      },
    emailId:{
        type: String,
        require: true
    },
    accountHolderName:{
        type: String,
        require: true
    }
})

module.exports = mongoose.models.connect ||mongoose.model('connect', connectSchema);
