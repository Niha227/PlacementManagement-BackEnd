import express from 'express'
import { Student } from '../models/studentModel.js';
import { Result } from '../models/resultModel.js';
import { Score } from '../models/score.js';
import { Interview } from '../models/interviewModel.js';
 const StudentRouter = express.Router()


StudentRouter.post('/createstudent/', async(request, response) => {     //createStudent
    
    try {
        const {
          name,
          batch,
          email,
          age,
          gender,
          college,
          status,
          dsaScore,
          webDevScore,
          reactScore,
        } = request.body;
    
        let user = await Student.findOne({ email });   //returns the 1st occurance 
    
        if (!user) {
          let student = await Student.create({
            name,
            batch,
            email,
            age: Number(age),
            gender,
            college,
            status,
            interview: [],
            result: [],
          });
    
          let score = await Score.create({
            student: student._id,
            dsaScore: Number(dsaScore),
            webDevScore: Number(webDevScore),
            reactScore: Number(reactScore),
          });
    
          student.course_score = score._id;
    
          await student.save();
    
           response.json( "Student created!");
        } else {
          response.json( "Student already exists!" );
        }
      } catch (err) {
       console.log("Error in creating student!", err);
         response.json( "Internal server error" );
      }
    }
)

 StudentRouter.get('/students/:id/', async(request,response) => {
    try{
        let student = await Student.findById(request.params.id).populate('course_score');
        let course = await Score.findOne({_id: student.course_score})

        if(student){
            return response.jsonp({
                title: "Edit Student",
                student: student,
                course: course
            });
        }else{
            response.json('error', 'Student Not Found!')    
            
        }

    }catch(err){

    } 
})
 
// displays all student detail who applied for specific company 
StudentRouter.get('/allstudent/:id/', async(request, response) => {
    try{

        let interviewId = request.params.id;
        let interview = await Interview.findOne({_id: interviewId}).populate("student");
        let result = await Result.find({interview: interviewId}).populate('student').populate('interview');

        return response.json({
            title: "List Of Students",
            Interview_company: interview.companyName,
            Interview_profile: interview.profile,
            Date: interview.date,
            students: interview.student,
            id: interview._id,
            result: result
        });

    }catch(err){
        console.log('Error in Listing Students', err);
    }
})

StudentRouter.get('/students/',async(request,response) => {
    try{
       
        let student = await Student.find({}).sort('-createdAt').populate("course_score").populate("interview").populate("result");
   
        return response.json({
            title: " Students details",
            student: student
        });

       
    }catch(err){
        console.log("Error in displaying List of all added students! ",err)
    }
})

StudentRouter.get('/all/', async(request,response) => {    //get student 
                 
    try{

        let student = await Student.find({}).populate("course_score").populate('interview');
        let result = await Result.find({}).populate('student').populate('interview');

        return response.json({
            student, 
            result
        });

    }catch(err){
        console.log('Error in showing all student details', err);
    }

}        

)

StudentRouter.get("/:id/", async(request, response) => {   //show by id
    try {
        let student = await Student.findOne({_id: request.params.id})
                                   .populate("course_score")
                                   .populate("interview");

        if (student) {
            return response.json({
                
                student: student
           });
        } else {
            return response.status(404).json({
                error: 'Student Not Found'
            });
        }
    } catch (err) {
        console.error('Internal Server Error While Showing Student Details', err);
        return response.status(500).json({
            error: 'Internal Server Error'
        });
    }
})



StudentRouter.patch("/updatestudentdetails/:id/", async(request, response) => {  //update a particular student by id
    

        try{

            // find the particular student id that populates with score
    
            let student = await Student.findOne({_id: request.params.id}).populate('course_score');
            let score = await Score.findOne({_id: student.course_score.id});
    
            if(student){

                let updatedStudent = await Student.findByIdAndUpdate(request.params.id, request.body, {new:true}).populate('course_score');
    
                let updateScore = await Score.findByIdAndUpdate({_id: score.id}, {dsaScore: request.body.dsaScore, webDevScore: request.body.webDevScore, reactScore: request.body.reactScore}, {new: true});
    
                await updateScore.save();
                await updatedStudent.save();
            
                
                return response.json(`Student Updated Successfully!! ${student._id}`);
        
            }else{
    
               
                console.log(`Cannot find student with the given id ${student._id}`);
                return response.json("error', 'Student Not Found!")
            }
    
        }catch(err){
            console.log(err);
            return;
        }
    
    }

)

StudentRouter.delete('/deletestudent/:id', async(request,response) => {
    try {
        // Find the student by ID
        let student = await Student.findOne({_id: request.params.id});
        
        // If student is not found, return an error response
        if (!student) {
            return response.json("Student not Found !!");
        }

        // Find the result and interview related to the student
        let result = await Result.findById(student.result);
        let interview = await Interview.findById(student.interview);

        // If interview exists, update it by removing references to the student and result
        if (interview) {
            interview.student.pull(student._id);
            interview.result.pull(result ? result._id : null);
            await interview.save();
        }

        // If result exists, delete it
        if (result) {
            await result.deleteOne();
        }

        // Find the course score related to the student and delete it
        if (student.course_score) {
            let course = await Score.findOne({_id: student.course_score._id});
            if (course) {
                await Score.findByIdAndDelete(course._id);
            }
        }

        // Delete the student
        await Student.findByIdAndDelete(student._id);

        // Return success response
        response.json('Student Successfully Deleted!');
    } catch (err) {
        console.log(err);
        response.status(500).json({ error: 'An error occurred' });
    }
});



export default StudentRouter
