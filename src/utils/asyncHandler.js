export { asyncHandler }

const asyncHandler = (fn) => async (req, res, next) => { 
    try {
        await fn(req, res, next);
    } catch (error) {
        res.status(error.code || 500).json({
            success: false,
            message: error.message
        });
      
    }
}
/*
const asyncHandler = (fn) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
        Next(error);
    });
}
*/