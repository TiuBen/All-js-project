const express = require("express");
const router = express.Router();

module.exports = (io) => {
    console.log("io");
    router.post("/form", (req, res) => {
        // Process form data
        const formData = req.body;
        console.log(req.body);

        // Emit a message to all connected clients
        io.emit("formDataUpdated", formData);

        res.status(200).send("Form submitted successfully");
    });

    return router;
};
