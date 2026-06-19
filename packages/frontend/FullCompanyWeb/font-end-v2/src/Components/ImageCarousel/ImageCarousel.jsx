import React, { useState } from "react";

const ImageCarousel = ({ images }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handleNext = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const handlePrev = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    };

    return (
        <div className=" grid grid-cols-[2rem,auto,2rem]  max-w-lg mx-auto shadow-lg rounded-lg overflow-hidden border border-black ">
            <button
                onClick={handlePrev}
                className="text-white w-[2rem] z-50 bg-black text-3xl md:text-4xl focus:outline-none hover:text-gray-300"
            >
                &lt;
            </button>
            <div className="flex justify-center items-center">
                <img
                    src={images[currentImageIndex]}
                    alt={`Image ${currentImageIndex + 1}`}
                    className="z-10 w-fit h-fit object-scale-down"
                />
            </div>

            <button
                onClick={handleNext}
                className="text-white w-[2rem]  right-0 top-5 z-50 bg-black text-3xl md:text-4xl focus:outline-none hover:text-gray-300"
            >
                &gt;
            </button>
        </div>
    );
};


export { ImageCarousel };
