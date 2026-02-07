function throttle(func, delay) {
    let isThrottled = false;

    return function (...args) {
        if (!isThrottled) {
            func.apply(this, args);
            isThrottled = true;

            setTimeout(() => {
                isThrottled = false;
            }, delay);
        }
    };
}

function throttleAsync(func, delay) {
    let isThrottled = false;
    let queuedArgs = null;

    return async function (...args) {
        if (!isThrottled) {
            isThrottled = true;

            try {
                await func.apply(this, args);
            } catch (error) {
                // Handle any errors from the async function
            }

            setTimeout(() => {
                isThrottled = false;
                if (queuedArgs) {
                    const nextArgs = queuedArgs;
                    queuedArgs = null;
                    this(...nextArgs);
                }
            }, delay);
        } else {
            queuedArgs = args;
        }
    };
}

module.exports = {throttle,throttleAsync};
