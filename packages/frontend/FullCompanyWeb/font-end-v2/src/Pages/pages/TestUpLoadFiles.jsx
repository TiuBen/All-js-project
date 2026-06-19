import React, { useRef } from "react";

function TestUpLoadFiles() {
    const ref = useRef();
    return (
        <div>
            11
            <embed src="http://192.168.0.68:3100/api/v2/file/1" type="application/pdf"></embed>
            22
            <embed src="http://192.168.0.68:3100/2.pdf" type="application/pdf"></embed>
            33
            <iframe src="http://192.168.0.68:3100/3.pdf" type="application/pdf" title="test_iframe">
                {" "}
            </iframe>
            444
            <object data="http://192.168.0.68:3100/1.pdf" type="application/pdf">
                TestUpLoadFiles
            </object>
            <form method="post" enctype="multipart/form-data">
                <div>
                    <label htmlFor="upload-image">上传图片(可以多选)</label>
                    <input id="upload-image" name="upload-image" type="file" accept="image/*" multiple ref={ref} />
                </div>
                <div>
                    <button
                        className="border border-spacing-0 border-cyan-600"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // console.log( ref.current.files);
                            var formData = new FormData();
                            formData.append("ff",{"dddd":"ddddd","AAA":"收拾收拾"});
                            const count = ref.current.files.length;
                            for (let index = 0; index < count; index++) {
                                console.log(ref.current.files[index]);
                                formData.append(`files`, ref.current.files[index],encodeURI( ref.current.files[index].name));
                            }

                            try {
                                fetch("http://192.168.0.68:3100/api/v2/file", { method: "POST",headers:{}, body: formData })
                                    .then((res) => res.json())
                                    .then((data) => console.log(data));
                            } catch (error) {
                                console.error("Error:", error);
                            }
                        }}
                    >
                        Submit
                    </button>
                </div>
                <div>
                    <button
                        className="border border-spacing-0 border-cyan-600"
                        onClick={() => {
                            console.log("ddddd");
                        }}
                    >
                        Test
                    </button>
                </div>
            </form>
            <img alt="预览图片"></img>
            <label htmlFor="up">上传PDF</label>
            <img alt="预览图片"></img>
        </div>
    );
}

export default TestUpLoadFiles;
