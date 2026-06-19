import React from "react";

function StaffProfileCard() {
    return (
        <div>
        
                    <div class="w-full rounded-xl p-3 shadow-2xl shadow-blue-200 bg-white">
                        <div class="grid grid-cols-1 gap-1 grid-cols-12">
                            <div class="grid-cols-1 col-span-3">
                                <div class="mx-auto flex h-[90px] w-[90px] items-center justify-center rounded-full bg-blue-100 p-4">
                                    <svg
                                        id="logo-39"
                                        width="50"
                                        height="40"
                                        viewBox="0 0 50 40"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M25.0001 0L50 15.0098V24.9863L25.0001 40L0 24.9863V15.0099L25.0001 0Z"
                                            fill="#A5B4FC"
                                            class="ccompli2"
                                        ></path>
                                        <path
                                            fill-rule="evenodd"
                                            clip-rule="evenodd"
                                            d="M0 15.0098L25 0L50 15.0098V24.9863L25 40L0 24.9863V15.0098ZM25 33.631L44.6967 21.8022V18.1951L44.6957 18.1945L25 30.0197L5.30426 18.1945L5.3033 18.1951V21.8022L25 33.631ZM25 24.5046L40.1018 15.4376L36.4229 13.2298L25 20.0881L13.5771 13.2298L9.89822 15.4376L25 24.5046ZM25 14.573L31.829 10.4729L25 6.37467L18.171 10.4729L25 14.573Z"
                                            fill="#4F46E5"
                                            class="ccustom"
                                        ></path>
                                        <path
                                            d="M25.0001 0L0 15.0099V24.9863L25 40L25.0001 0Z"
                                            fill="#A5B4FC"
                                            class="ccompli2"
                                            fill-opacity="0.3"
                                        ></path>
                                    </svg>
                                </div>
                            </div>

                            <div class="col-span-9">
                                <div class="text-center lg:text-left">
                                    <h2 class="text-2xl font-bold text-zinc-700">XYZ User</h2>
                                    <p class="mt-2 font-semibold text-zinc-700">@xyzuser</p>
                                    <p class="mt-4 text-zinc-500">I am a Front End Developer and UI/UX Designer</p>
                                </div>

                                <div class="mt-6 grid grid-cols-3 gap-6 text-center lg:text-left">
                                    <div>
                                        <p class="font-bold text-zinc-700">345</p>
                                        <p class="text-sm font-semibold text-zinc-700">Posts</p>
                                    </div>

                                    <div>
                                        <p class="font-bold text-zinc-700">200k</p>
                                        <p class="text-sm font-semibold text-zinc-700">Followers</p>
                                    </div>

                                    <div>
                                        <p class="font-bold text-zinc-700">38</p>
                                        <p class="text-sm font-semibold text-zinc-700">Following</p>
                                    </div>
                                </div>

                                <div class="mt-6 grid grid-cols-2 gap-4">
                                    <button class="w-full rounded-xl border-2 border-blue-500 bg-white px-3 py-2 font-semibold text-blue-500 hover:bg-blue-500 hover:text-white">
                                        Follow
                                    </button>

                                    <button class="w-full rounded-xl border-2 border-blue-500 bg-white px-3 py-2 font-semibold text-blue-500 hover:bg-blue-500 hover:text-white">
                                        View Profile
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
      
        </div>
    );
}

export { StaffProfileCard};
