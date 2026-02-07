/**
 * 平滑移动雷达标签的工具函数
 * @param {RadarLabel} radarLabel - 要移动的雷达标签实例
 * @param {Object} targetPosition - 目标位置 {x, y}
 * @param {number} duration - 移动总持续时间(毫秒)，默认2000ms
 * @param {number} interval - 移动间隔(毫秒)，默认500ms
 * @returns {Object} 包含停止移动方法的对象
 */
function moveRadarLabel(radarLabel, targetPosition, duration = 2000, interval = 500) {
    const startX = radarLabel.x;
    const startY = radarLabel.y;
    const distanceX = targetPosition.x - startX;
    const distanceY = targetPosition.y - startY;
    
    const steps = duration / interval;
    const stepX = distanceX / steps;
    const stepY = distanceY / steps;
    
    let currentStep = 0;
    let animationId = null;
    
    function moveStep() {
        currentStep++;
        
        // 计算新位置
        const newX = startX + (stepX * currentStep);
        const newY = startY + (stepY * currentStep);
        
        // 设置新位置
        radarLabel.setPosition(newX, newY);
        
        // 检查是否到达目标位置
        if (currentStep < steps) {
            animationId = setTimeout(moveStep, interval);
        } else {
            // 确保最终位置精确
            radarLabel.setPosition(targetPosition.x, targetPosition.y);
        }
    }
    
    // 开始移动
    animationId = setTimeout(moveStep, interval);
    
    // 返回一个可以停止移动的对象
    return {
        stop: () => {
            if (animationId) {
                clearTimeout(animationId);
                animationId = null;
            }
        }
    };
}


export default moveRadarLabel;