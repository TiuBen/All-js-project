import React from "react";

function ProductBookCard() {
    return (
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <a href="https://abc.xyz/assets/20/ef/844a05b84b6f9dbf2c3592e7d9c7/2023q2-alphabet-earnings-release.pdf" target="_blank">

            <div class="relative">
                {/* <!-- Video Thumbnail Image --> */}
                <img src="https://via.placeholder.com/400x225" alt="Video Thumbnail" class="w-full h-auto" />
                {/* <!-- Play Button --> */}
                <div class="absolute inset-0 flex items-center justify-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-12 w-12 text-white opacity-75"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12l-4 4V8l4 4z" />
                    </svg>
                    产品目录的封面
                </div>
            </div>
            <div class="p-4">
                {/* <!-- Video Title --> */}
                <h2 class="text-lg font-semibold text-gray-800 hover:text-blue-500">Bilibili Video Title</h2>
                {/* <!-- Video Information --> */}
                <p class="text-sm text-gray-500">Views: 10M • Date: July 18, 2023</p>
            </div>
            </a>

        </div>
    );
}

export  {ProductBookCard};
