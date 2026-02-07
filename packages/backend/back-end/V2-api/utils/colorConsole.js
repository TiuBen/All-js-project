const resetColor = "\x1b[0m";
const redColor = "\x1b[31m";
const greenColor = "\x1b[32m";
const yellowColor = "\x1b[33m";
const blueColor = "\x1b[34m";

const redLog = (...args) => {
    const message = args.join(" ");
    console.log(redColor+message+resetColor);
};
const greenLog = (...args) => {
    const message = args.join(" ");
    console.log(greenColor+message+resetColor);
};
const yellowLog = (...args) => {
    const message = args.join(" ");
    console.log(yellowColor+message+resetColor);
};
const blueLog = (...args) => {
    const message = args.join(" ");
    console.log(blueColor+message+resetColor);
};

// Save the original console.log function in a separate variable
const originalLog = console.log;

// Replace console.log with the customLog function
console.red = (...args) => redLog( ...args);
console.green = (...args) => greenLog( ...args);
console.yellow = (...args) => yellowLog( ...args);
console.blue = (...args) => blueLog( ...args);
console.log=(...args) => originalLog( ...args);

// Test the extended console.log
// console.red("Hello, world!");
module.exports=console;
