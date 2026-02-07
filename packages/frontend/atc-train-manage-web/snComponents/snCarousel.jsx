import React, { useState } from "react";
import PropTypes from "prop-types";
import "./snCarousel.css";
const ContentSlider = ({ children, showDots = true, showArrows = true }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    const updateIndex = (newIndex) => {
        if (newIndex < 0) {
            newIndex = React.Children.count(children) - 1;
        } else if (newIndex >= React.Children.count(children)) {
            newIndex = 0;
        }
        setActiveIndex(newIndex);
    };

    return (
        <div className="content-slider">
            {showArrows && (
                <div className="slider-arrows">
                    <button className="slider-arrow slider-arrow-left" onClick={() => updateIndex(activeIndex - 1)}>
                        &lt;
                    </button>
                </div>
            )}
            <div className="slider-inner" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
                {React.Children.map(children, (child) => {
                    return React.cloneElement(child, { width: "100%" });
                })}
            </div>

            {showArrows && (
                <div className="slider-arrows">
                    <button className="slider-arrow slider-arrow-right" onClick={() => updateIndex(activeIndex + 1)}>
                        &gt;
                    </button>
                </div>
            )}

            {showDots && (
                <div className="slider-dots">
                    {React.Children.map(children, (child, index) => {
                        return (
                            <button
                                className={`slider-dot ${index === activeIndex ? "active" : ""}`}
                                onClick={() => updateIndex(index)}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
};

ContentSlider.propTypes = {
    children: PropTypes.node.isRequired,
    showDots: PropTypes.bool,
    showArrows: PropTypes.bool,
};

export default ContentSlider;
