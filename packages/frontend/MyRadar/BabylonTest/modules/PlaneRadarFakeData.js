class PlaneRadarFakeData {
    constructor() {
        this.planeRadarData = {
            id: 1,
            name: "Plane 1",
            latitude: 37.7749,
            longitude: -122.4194,
            x: 0,
            y: 0,
            altitude: 10000,
            speed: 500,
            heading: 90,
        };

        this.startUpdating();
    }

    startUpdating() {
        // Store the interval ID so it can be cleared later if needed
        this.intervalId = setInterval(() => {
            this.update(); // Call the update function every second
        }, 1000); // Interval set to 1000 milliseconds (1 second)
    }

    update() {
        // Example of how the data might change over time (for demonstration purposes)
        // Randomly adjust latitude and longitude slightly
        this.planeRadarData.latitude += this.getRandomOffset();
        this.planeRadarData.longitude += this.getRandomOffset();

        // Example: Increase altitude and speed gradually
        this.planeRadarData.altitude += 100;
        this.planeRadarData.speed += 10;

        // Example: Change heading randomly within a range
        this.planeRadarData.heading = Math.random() * 360;

        // In a real scenario, you would update other properties similarly based on your application logic

        // Log the updated data for demonstration
        console.log("Updated plane data:", this.planeRadarData);
    }

    // Helper function to get a random offset for latitude and longitude
    getRandomOffset() {
        // Generate a small random number between -0.001 and 0.001 (for latitude/longitude)
        return (Math.random() - 0.5) * 0.002;
    }

    stopUpdating() {
        // Clear the interval when you want to stop updating the data
        clearInterval(this.intervalId);
    }
}

export default PlaneRadarFakeData;