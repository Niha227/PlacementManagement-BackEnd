// import express from 'express'
// import { Result } from '../models/resultModel.js';
// const ResultRouter = express.Router()
// ResultRouter.post('/create/', async(request, response) => {
//     try {
//         const { result, student, interview } = request.body;
    
//         let newResult = new Result({
//           result,
//           student,
//           interview
//         });

//         await newResult.save()
//         return response.status(201).json(
//          'Result created!')
//       } catch (err) {
//         console.error('Error creating result:', err);
//         return response.status(500).json({ message: 'Internal server error' });
//       }
//     }
// )
// export default ResultRouter