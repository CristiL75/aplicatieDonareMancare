const mongoose = require("mongoose");

mongoose
  .connect("mongodb://127.0.0.1:27017/monitoring_app")
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

const AutentificareSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  userType: {
    type: String,
    enum: ['beneficiar', 'donator'], 
    default: 'beneficiar' 
} 
});

const AutentificareCollection = mongoose.model("AutentificareCollection", AutentificareSchema);

module.exports = {
  AutentificareCollection,
  
};