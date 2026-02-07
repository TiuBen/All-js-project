const fs = require('fs');
const path = require('path');

function PostSaveFile(req, res) {
    console.log("PostSaveFile");
    // console.log(req);
    const { username, image } = req.body;
    // console.log( username);
    // console.log(image);
    if (!image || !username) {
        return res.status(400).json({ message: "Username and image are required." });
    }

    // Remove the base64 prefix if it exists
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Define the file path
    const filePath = path.join(__dirname,"..", "public","日常照片",`${username}.png`);
    console.log(filePath);

    // Save the image
    fs.writeFile(filePath, buffer, (err) => {
        if (err) {
            return res.status(500).json({ message: "Failed to save the image.", error: err });
        }
        res.status(200).json({ message: "Image saved successfully.", filePath });
    });
}
// Create uploads directory if it doesn't exist
const dir = path.join(__dirname,"..", "/public/日常照片");
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

module.exports = {
    PostSaveFile,
};
