import { PlaneRadarFakeData } from "./modules/PlaneRadarFakeData";
import { PlaneRadarLabel, testPlaneLabelUpdate } from "./modules/PlaneRadarLabel";
import Konva from "Konva";

(() => {
    console.log("dddddd");
    console.log("dddddd2");
})();

function initRadarDisplay() {
    const container = document.createElement("div");
    container.id = "container";
    document.body.appendChild(container);

    const stage = new Konva.Stage({
        container: "container",
        width: 800,
        height: 600,
    });
    const radarLayer = new Konva.Layer();

    //
    const radarLabel = new PlaneRadarLabel("Flight XYZ", 50, 50);

    try {
        radarLayer.add(radarLabel);
        //
        stage.add(radarLayer);
    } catch (error) {
        console.log(error);
    }

    // TEST
    var layer = new Konva.Layer();
    var circle = new Konva.Circle({
        x: stage.width() / 2,
        y: stage.height() / 2,
        radius: 70,
        fill: "red",
        stroke: "black",
        strokeWidth: 4,
    });
    layer.add(circle);
    stage.add(layer);
}

initRadarDisplay();

// testPlaneLabelUpdate()
