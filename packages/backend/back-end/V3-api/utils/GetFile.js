// **  这个文件完成一个功能
// **  把 例如  76a9b9a1f8f8.jpg 的 解析为 /shenning/image/2023-05-20/照片1.png
// **  把 /shenning/image/2023-05-20/照片1.png hash 成为 76a9b9a1f8f8.jpg  

const crypto = require('crypto');





// // Function to generate a random hashed file name
// function generateRandomHashedFileName(fileExtension) {
//   const hash = crypto.createHash('sha256'); // You can use a different hashing algorithm if needed
//   const randomString = Math.random().toString();
//   hash.update(randomString);
//   const hashedFileName = hash.digest('hex').slice(0, 12) + '.' + fileExtension; // Slice to get the first 12 characters of the hash
//   return hashedFileName;
// }

// // Usage example:
// const originalFileName = 'example.jpg';
// const fileExtension = originalFileName.split('.').pop(); // Get the file extension from the original file name


// const base64FileName = generateRandomHashedFileName(fileExtension);
// console.log(base64FileName); // Example output: 76a9b9a1f8f8.jpg