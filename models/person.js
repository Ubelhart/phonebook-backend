const mongoose = require("mongoose");
const { Schema, model } = mongoose;

mongoose.set("strictQuery", false);

const url = process.env.MONGODB_URI;

console.log("connecting to", url);

mongoose
    .connect(url)
    .then(() => {
        console.log("connected to MongoDB");
    })
    .catch((error) => {
        console.log("error connectining to MongoDB:", error.message);
    });

const personSchema = new Schema({
    name: String,
    number: String
});

personSchema.set("toJSON", {
    transform: (document, returnObject) => {
        returnObject.id = returnObject._id.toString();
        delete returnObject._id;
        delete returnObject.__v;
    }
});

module.exports = model("Person", personSchema);
