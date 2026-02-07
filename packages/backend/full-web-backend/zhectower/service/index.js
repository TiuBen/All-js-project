const BaseService = require("./BaseService");

const UserService  = require('./UserService');

// class _UserService extends BaseService {
//     constructor() {
//         super("user");
//     }
//     update(id, data) {
//         return new Promise((resolve, reject) => {
//             // Convert array values to JSON strings
//             const processedData = Object.keys(data).reduce((acc, key) => {
//                 if (Array.isArray(data[key])) {
//                     acc[key] = JSON.stringify(data[key]); // Convert array to JSON string
//                 } else {
//                     acc[key] = data[key]; // Keep non-array values as-is
//                 }
//                 return acc;
//             }, {});

//             const updates = Object.keys(processedData)
//                 .map((key) => {
//                     // Escape reserved keywords (e.g., `group`)
//                     if (key === "group") {
//                         return `\`${key}\` = ?`;
//                     }
//                     return `${key} = ?`;
//                 })
//                 .join(", ");

//             const values = [...Object.values(processedData), id];

//             // console.log("Generated SQL:", `UPDATE ${this.tableName} SET ${updates} WHERE id = ?`);
//             // console.log("Values:", values);

//             // Execute the SQL query
//             this.db.run(
//                 `UPDATE ${this.tableName} SET ${updates} WHERE id = ?`,
//                 values,
//                 function (err) {
//                     if (err) {
//                         console.error("Error updating user:", err);
//                         reject(err);
//                     } else {
//                         console.log("User updated successfully");
//                         resolve({ id, ...data });
//                     }
//                 }
//             );
//         });
//     }


// }
// const UserService= new _UserService();

class _PositionService extends BaseService {
    constructor() {
        super("position");
    }
}
const PositionService= new _PositionService();

class _DutyService extends BaseService {
    constructor() {
        super("duty");
    }
}
const DutyService= new _DutyService();


module.exports = { UserService, PositionService,DutyService };