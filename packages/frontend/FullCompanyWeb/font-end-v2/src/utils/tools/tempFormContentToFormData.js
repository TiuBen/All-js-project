
function tempFormContentToFormData(temp) {
    console.log("tempFormContentToFormData");
    console.log(temp);

    const formData = new FormData();

    if (temp) {
        for (const [key, value] of Object.entries(temp)) {
            if (value === File) {
                console.log("单个文件");
                formData.append(key, value);
            } else if (value === FileList) {
                console.log("多个文件");
            } else {
                console.log("简单的值");
                if (Array.isArray(value)) {
                    value.forEach((v) => {
                        formData.append(key, v);
                    });
                } else {
                    formData.append(key, value);
                }
            }
        }
    } else {
      console.log("tempFormContentToFormData  有问题");
    }

    return formData;
}

export { tempFormContentToFormData };
