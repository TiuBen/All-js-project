// * 说明
// * 传入form表单里面的ref 和 原始数据 
// * 得到 formdata 

function refToFormData(refArray, lastContent) {
      const formData = new FormData();
      // * 如果没有值 放弃
      // * 不改的千万不能添加
  
      refArray.forEach((ref, index) => {
          // console.log(index + ":" + ref.current.name + ":" + ref.current.type);
          if (ref.current?.name !== "" && ref.current?.name !== undefined) {
              if (ref.current.type === "file") {
                  for (const file of ref.current.files) {
                      console.log("add file");
                      formData.append(ref.current.name, file, file.name);
                  }
              } else {
                  if (ref.current.value) {
                      formData.append(ref.current.name, ref.current.value);
                  }else{
                  console.log(ref+"这个没有值");
                  }
              }
          }else{
            console.log("这个ref 有问题:"+ref);

          }
      });
      console.log("parseFormRefsToFormData");
      formData.forEach((value, key) => {
          console.log(`Key: ${key}, Value: ${value}`);
      });
  
      if (lastContent) {
          if (lastContent?.uuid) {
              formData.append("uuid", lastContent.uuid);
          }
      }
  
      return formData;
  }
  


export  {refToFormData}