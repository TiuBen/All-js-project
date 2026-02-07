export function createViewport() {
    return {
        canvasWidth: 0,
        canvasHeight: 0,

        centerX: 0,
        centerY: 0,

        width: 0, // 世界单位
        height: 0,

        minX: 0,
        maxX: 0,
        minY: 0,
        maxY: 0,

        update(canvasWidth, canvasHeight, worldScale) {
            this.canvasWidth = canvasWidth;
            this.canvasHeight = canvasHeight;

            // 世界单位 = 像素 / 世界比例
            this.width = canvasWidth / worldScale;
            this.height = canvasHeight / worldScale;

            this.minX = this.centerX - this.width / 2;
            this.maxX = this.centerX + this.width / 2;
            this.minY = this.centerY - this.height / 2;
            this.maxY = this.centerY + this.height / 2;
        },

        worldToScreen(x, y) {
            return {
                x: (x - this.centerX) * (this.canvasWidth / this.width) + this.canvasWidth / 2,
                y: (this.centerY - y) * (this.canvasHeight / this.height) + this.canvasHeight / 2,
            };
        },
    };
}
