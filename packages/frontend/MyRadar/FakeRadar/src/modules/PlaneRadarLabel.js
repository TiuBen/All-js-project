import Konva from "Konva";
import { PlaneRadarFakeData } from "./PlaneRadarFakeData";

class PlaneRadarLabel extends Konva.Group {
    constructor(name, x, y) {
        super(); // Call the constructor of Konva.Group

        // Create Konva.Text objects for name, x, and y
        this.nameText = new Konva.Text({
            text: name,
            fontSize: 16,
            fontFamily: "Calibri",
            fill: "black",
            x: x,
            y: y,
        });

        this.xText = new Konva.Text({
            text: `X: ${x}`,
            fontSize: 14,
            fontFamily: "Calibri",
            fill: "black",
            x: x,
            y: y+16,
        });

        this.yText = new Konva.Text({
            text: `Y: ${y}`,
            fontSize: 14,
            fontFamily: "Calibri",
            fill: "black",
            x: x,
            y: y+32,
        });

        // Add the Konva.Text objects to the Konva.Group
        this.add(this.nameText);
        this.add(this.xText);
        this.add(this.yText);

        // Optionally, you can set additional properties or methods as needed
    }

    // Optionally, add methods specific to PlaneRadarLabel here
}

function testPlaneLabelUpdate() {
    const planeRadarFakeData = new PlaneRadarFakeData((name = "Plane 1"));

    const Plane1 = new PlaneRadarFakeData(planeRadarFakeData);
    Plane1.startUpdating();
}

export { PlaneRadarLabel, testPlaneLabelUpdate };
