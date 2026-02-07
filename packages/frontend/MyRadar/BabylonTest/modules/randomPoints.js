function randomPoints(counts) {
    counts = counts || 10;
    const randomPoints = [];
    for (let index = 0; index < counts; index++) {
        randomPoints.push({
            x: Math.random() * 1000,
            y: Math.random() * 1000,
        });
    }

    return randomPoints;
}

export { randomPoints };
