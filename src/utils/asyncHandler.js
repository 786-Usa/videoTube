// const asyncHandler = (requestHandler) => {
//     return async (req, res, next) => {
//       try {
//         await requestHandler(req, res, next);
//       } catch (error) { 
//         next(error);
//       }
//     };
//   };



const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
      Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
  }
}


  export { asyncHandler };



















// const asyncHandler = async (func)=> (req,res)=>{
    
//     try{

//     }
// catch(error){
//     res.error(error.code || 500, error.message || "Internal Server Error".json{
//         success: false,
//         message: error.message
//     });
// }

// }