import express, { response } from 'express'
import { Interview } from '../models/interviewModel.js';
import { Student } from '../models/studentModel.js';
import { Result } from '../models/resultModel.js';
import { mongoose } from 'mongoose';
const InterviewRouter = express.Router()

InterviewRouter.post('/createinterview/', async(request,response)=> {
       //find the interview with the same company name
    try {
        let company = await Interview.findOne({
          companyName: request.body.companyName,
        });
          // If no such interview exists, create a new one
        if (!company) {
          let interview = await Interview.create({
            companyName: request.body.companyName,
            profile: request.body.profile,
            date: request.body.date,
          });
    
          if (request.xhr) {
            return response.json({
              data: {
                interview: interview,
              },
              message: "Interview Slot Created!",
            });
          }
    
          response.json("Interview Added Successfully");
          
        } else {
          response.json("interview is already added");
       
        }
      } catch (err) {
        response.json("Error in Creating Interview!", err);
       
      }
    
})


InterviewRouter.post('/addstudentinterview/:id/', async(request, response) => {  //pass a particular student id 
    

    try {
      let interviewId = request.params.id;
      let stuID = request.body.student;
      //console.log(interviewId, stuID)
  
      let schInterview = await Interview.findOne({ _id: interviewId });
      let stu = await Student.findOne({ _id: stuID });
     // console.log(schInterview,stu)
      if (!schInterview || !stu) {
        return response.status(404).json({ message: "Interview or Student not found" });
      }
  
      let result = await Result.create({
        interview: schInterview._id,
        student: stu._id,
      });
  
      if (schInterview) {
        stu.interview.push(schInterview._id);
        stu.result.push(result._id);
        await stu.save();
  
        schInterview.result.push(result._id);
        schInterview.student.push(stu._id);
        await schInterview.save();
  
        if (request.xhr) {
          return response.status(200).json({
            data: {
              schInterview: schInterview,
            },
            message: "Interview Slot Created!",
          });
        }
      }
  
       response.json("added");
    } catch (err) {
      console.log(err);
    }
  }
)

InterviewRouter.get('/listofinterview/', async(request,response) => {

    try {
      let interviews = await Interview.find({}).sort("-createdAt");
      let student = await Student.find({});
  
      return response.json({
        title: "List Of Interviews",
        interview: interviews,
        student: student,
      });
    } catch (err) {
      console.log("Error in listing Interview!!", err);
    }
  }
  
)

// InterviewRouter.get('/scheduleInterview/', async(request,response) => {
 
//     try {
//       let InterviewId = request.params.id;
//       let interview = await Interview.find({ _id: InterviewId });
//       let student = await Student.find({});
  
//       if (interview) {
//         return response.json({
//           title: "Schedule Interview",
//           interview,
//           student: student,
//         });
//       }
//     } catch (err) {
//       return response.json("Error in Scheduling Interview!!", err);
      
//     }
//   }
// )

// to delete the particular interview using specific id
InterviewRouter.get('/deleteinterview/:id/', async(request, response) => {
  try {
    let interview = await Interview.findById(request.params.id)
      .populate("student")
      .populate("result")
    // console.log("interview", interview);

    if (!interview) {
      return response.json({
        status: "error",
        message: "Interview Slot Not found!!",
      });
    }

    for (let i = 0; i < interview.student.length; i++) {
      let student = [];
      student[i] = await Student.findById(interview.student[i]);
      // console.log("student", student[i]);

      if (student[i]) {
        // update student and delete interview slot
        student[i].interview.pull(interview._id);
        await student[i].save();
      }

      let result;
      result = await Result.findById(interview.result[i]);
      // console.log("result", result);

      if (result) {
        student[i].result.pull(result._id);
        await student[i].save();
        await result.deleteOne();
      }
    }

    await interview.deleteOne();
    response.json("Interview Slot Deleted Successfully!");
   
    
  } catch (err) {
    console.log(err);
  }
})

// Performs operation to delete student from the interview slot
InterviewRouter.patch("/updateresult/:studentID/:interviewID", async (request, response) => {
  try {
    const { studentID, interviewID } = request.params;
    const { result } = request.body; 

    console.log("Student ID:", studentID);
    console.log("Interview ID:", interviewID);
    console.log("Request Body:", request.body);

    if (!result) {
      return response.status(400).json({ error: "Result status is required" });
    }

    // Ensure IDs are valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(studentID) || !mongoose.Types.ObjectId.isValid(interviewID)) {
      return response.status(400).json({ error: "Invalid ID format" });
    }

    // Find the student
    let Stud = await Student.findById(studentID);
    if (!Stud) {
      console.log("Student not found with ID:", studentID);
      return response.status(404).json({ error: "Student not found" });
    }

    // Find the result or create a new one
    let r = await Result.findOne({
      student: studentID,
      interview: interviewID,
    });

    console.log("Found Result:", r);

    if (!r) {
      try {
        await Result.create({
          result: result,
          student: studentID,
          interview: interviewID,
        });
        response.json("Result Created Successfully!");
      } catch (err) {
        console.log("Error in creating Result:", err);
        response.status(500).json({ error: "Error in creating Result", details: err.message });
      }
    } else {
      if (r.result !== result) {
        r.result = result;
        console.log("Updated Result (before save):", r);
        try {
          await r.save();
          console.log("Result updated successfully!");
          response.json("Result Updated Successfully!");
        } catch (err) {
          console.log("Error saving updated Result:", err);
          response.status(500).json({ error: "Error saving updated Result", details: err.message });
        }
      } else {
        console.log("No changes detected; skipping save.");
        response.json("Result is already up-to-date.");
      }
    }
  } catch (err) {
    console.log("Error in saving data:", err);
    response.status(500).json({ error: "Error in saving data", details: err.message });
  }
});

// performs operation  to delete the interview slot
    
InterviewRouter.delete('/delete/:id/', async (request, response) => {
  try {
    let interview = await Interview.findById(request.params.id)
      .populate("student")
      .populate("result");

    if (!interview) {
      return response.json(
       "Interview Slot Not Found!!"
      );
    }

    for (let i = 0; i < interview.student.length; i++) {
      let student = await Student.findById(interview.student[i]);
      
      if (student) {
        // Use filter method to remove the interview ID from the student's interview array
        student.interview = student.interview.filter(id => !id.equals(interview._id));
        await student.save();
      }

      if (interview.result[i]) {
        // Remove the result ID from the student's result array
        student.result = student.result.filter(id => !id.equals(interview.result[i]));
        await student.save();

        // Delete the result document from the Result collection
        await Result.findByIdAndDelete(interview.result[i]);
      }
    }

    // Delete the interview document from the Interview collection
    await Interview.findByIdAndDelete(interview._id);

    response.json({ status: "success", message: "Interview Slot Deleted Successfully!" });

  } catch (err) {
    console.log(err);
    response.status(500).json({ status: "error", message: "Server Error", details: err.message });
  }
});

// deletes the particular student associated with result from interview and student

InterviewRouter.delete('/deletestudent/:id/', async (request, response) => {
  try {
    // Find the interview slot by ID
    let interview = await Interview.findById(request.params.id);

    if (!interview) {
      return response.status(404).json({ status: "error", message: "Interview Slot not Found!!" });
    }

    // Iterate over each student in the interview
    for (let studentId of interview.student) {
      // Find the associated student
      let student = await Student.findById(studentId);

      if (student) {
        // Remove the interview ID from the student's interview array
        student.interview = student.interview.filter(id => !id.equals(interview._id));

        // Iterate over each result in the interview
        for (let resultId of interview.result) {
          // Remove the result ID from the student's result array
          student.result = student.result.filter(id => !id.equals(resultId));
        }

        // Save the updated student document
        await student.save();
      } else {
        console.log(`Student with ID ${studentId} not found in the database.`);
      }
    }

    // Nullify the student and result fields in the interview
    interview.student = [];
    interview.result = [];
    await interview.save();

    // Delete each result associated with the interview
    for (let resultId of interview.result) {
      await Result.findByIdAndDelete(resultId);
    }

    // Send success response
    response.json({ status: "success", message: "Student and associated results successfully deleted!" });

  } catch (err) {
    console.error("Error during DELETE /deletestudent/:id/:", err);
    return response.status(500).json({ status: "error", message: "Server Error", details: err.message });
  }
})
export default InterviewRouter