const ServerErrorHandler= (err,req,res,next)=> {
      console.error(err.stack)
      if (err.message==="Same Name File exits!") {
            res.send(err.message)
      }
      res.send('Something broke!')


}

module.exports={ServerErrorHandler}