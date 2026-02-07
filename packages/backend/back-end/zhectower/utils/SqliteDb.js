const sqlite3= require("sqlite3").verbose();


const db=new sqlite3.Database('./test.db',(err=>{
      if (err) {
            console.error(err.message);
      }
      console.log("lian jie ok");
}
))

const AtcLicenseExam=new sqlite3.Database('./gzyzz2024.db',(err=>{
      if (err) {
            console.error(err);
      }
      console.log("AtcLicenseExam lian jie ok");
}
))


module.exports={db,AtcLicenseExam};

