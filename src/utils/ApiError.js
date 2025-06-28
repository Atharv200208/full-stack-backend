class ApiError extends Error {
    constructor(
        statusCode,
        message= "Something went wrong",
        error=[],
        stack = "",
    )
    {
        super(message)
        this.statusCode = statusCode
        this.data = null //It declares that your class/object has a data property, even though it doesn't hold any meaningful value yet.
        this.message = message
        this.success = false;
        this.error = error
        
        if (stack){
            this.stack = stack
        }
        else{
            this.captureStackTrace(this, this.constructor)//It tells the engine to capture the current stack trace for a given Error object, optionally excluding certain function calls from appearing in that trace.
        }
    }
}