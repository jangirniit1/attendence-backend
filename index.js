import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";

const app = express();
const port = 3000;

app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.urlencoded({ extended: true }));

const username = process.env.MONGO_USERNAME;
const password = encodeURIComponent(process.env.MONGO_PASSWORD);

// const dbConnection = await mongoose
//   .connect(
//     // "mongodb+srv://" +
//     //   username +
//     //   ":" +
//     //   password +
//     //   "@cluster0.y0r6j1d.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/attendence"
//     " mongodb://127.0.0.1:27017/student"
//   )
//   if (dbConnection)
//     app.listen(port, () => console.log("Server Started on port " + port));


mongoose.connect(
  "mongodb+srv://" +
  username +
  ":" +
  password +
  "@cluster0.y0r6j1d.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/attendence"

)
  .then(() => {
      console.log("MongoDB connected");
      app.listen(port, () => {
          console.log(`Server running on port ${port}`);
      });
  })
  .catch((error) => console.error("MongoDB connection error:", error));



  
  let d = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  
  const attendanceSchema = new mongoose.Schema({
    date: {
      type: Date,
      default: d,
    },
    attendance: {
      type: Object,
      required: true,
    },
  });
  const facultySchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    id: {
      type: Number,
      default: Date.now(),
    },
  });
  
  const studentSchema = new mongoose.Schema({
    id: {
      type: Number,
      default: Date.now(),
    },
    name: {
      type: String,
      required: true,
    },
    faculty: {
      type: String,
      required: true,
    },
    aadhaar: {
      type: String,
      required: true,
    }
  });
  
  const attendanceModel = mongoose.model("record", attendanceSchema, "record");
  const facultyModel = mongoose.model("faculty", facultySchema, "faculty");
  const studentModel = mongoose.model("student", studentSchema, "student");
  
  app.post("/saveAttendance", (req, res) => {
    const dataToSave = new attendanceModel(req.body);
    dataToSave
      .save()
      .then((response) => res.send(response))
      .catch((error) => {
        console.log(error);
        res.send(false);
      });
  });
  
  app.get("/getFaculty", async (req, res) => {
    const facultyList = await facultyModel.find({}).select("-__v");
    if (facultyList) res.json(facultyList);
    else res.json(false);
  });
  
  app.post("/saveFaculty", async (req, res) => {
    const dataToSave = new facultyModel(req.body);
    dataToSave
      .save()
      .then((response) => res.json(response))
      .catch((error) => {
        console.log(error);
        res.send(false);
      });
  });
  
  // app.get("/getStudent", async (req, res) => {
  //   const studentList = await studentModel.find({}).select("-__v");
  //   if (studentList) res.json(studentList);
  //   else res.json(false);
  // });


  app.get('/getStudent', async (req, res) => {
    const { faculty } = req.query;
    try {
      const students = await studentModel.find({ faculty });
      res.status(200).json(students);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching students' });
    }
  });
  
  app.post("/saveStudent", async (req, res) => {
    const dataToSave = new studentModel(req.body);
    dataToSave
      .save()
      .then((response) => res.json(response))
      .catch((error) => {
        console.log(error);
        res.send(false);
      });
  });
  
  app.delete("/deleteStudent/:id", async (req, res) => {
    const idToDelete = req.params.id;
    const deletedStudent = await studentModel.findOneAndDelete({
      id: idToDelete
    });
    if (deletedStudent) res.json("Student Deleted");
    else res.json(false);
  });
  

  app.delete("/deleteFaculty/:id", async (req, res) => {
    const idToDelete = req.params.id;
    try {
      const deletedFaculty = await facultyModel.findOneAndDelete({ _id: idToDelete });
      if (deletedFaculty) {
        res.json("Faculty Deleted");
      } else {
        res.json(false);
      }
    } catch (error) {
      console.error("Error", error);
      res.json(false);
    }
  });