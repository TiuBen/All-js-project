const SERVER_URL = "http:127.0.0.1:3100";

function _useFetchPostFormData(formData) {
    console.log("_useFetchPostFormData");
    fetch("http:localhost:3100/fuck", {
        method: "POST",
        // headers: {
        //     'Content-Type': 'application/json',
        //   },
        // body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
    })
        .then((res) => {
            return res.json();
        })
        .then((data) => {
            console.log(data);
        });
}



module.exports={_useFetchPostFormData}