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

const faceImageDb= new sqlite3.Database('./user-face.db', (err) => {
      if (err) {
          console.error('Error opening database faceImageDb:', err.message);
      } else {
          console.log('Connected faceImageDb to SQLite database.');
      }
  });
  
  const settingDb= new sqlite3.Database('./user-face.db', (err) => {
      if (err) {
          console.error('Error opening database faceImageDb:', err.message);
      } else {
          console.log('Connected faceImageDb to SQLite database.');
      }
  });
  



module.exports={db,AtcLicenseExam,faceImageDb,settingDb};

