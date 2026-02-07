import json
import sys
from deepface import DeepFace
import base64
# def get_json_data(arg1,arg2):
#     print(arg1,arg2)
#     data = {
#         "message": "Hello from Python!",
#         "status": "success",
#         "data": {
#             "id": 1,
#             "name": "Sample Item",
#             "value": 42
#         }
#     }
#     return json.dumps(data)  # 转换为 JSON 字符串

# if __name__ == "__main__":
#     print(get_json_data('d','pppp'))  # 打印 JSON 数据







# img1, img2 = sys.argv[1], sys.argv[2]

# try:
#     result = DeepFace.verify(img1, img2)
#     print("相似度：" + str(1 - result["distance"]))
# except Exception as e:
#     print(f"Error: {str(e)}")
#     sys.exit(1)



# def main():
#     try:
#         # Get Base64 images from arguments
#         # img1_base64 = sys.argv[1]
#         # img2_base64 = sys.argv[2]

#         # print(img1_base64,img2_base64)

#         # Perform verification
#         result = DeepFace.verify("D:/GitHub/full-web-backend/zhectower/utils/img1.jpeg", "D:/GitHub/full-web-backend/zhectower/utils/img1.jpeg", model_name="OpenFace")

#         # Print JSON result
#         print(json.dumps(result))


#     except Exception as e:
#         print(json.dumps({"error": str(e)}))
#         sys.exit(1)

# if __name__ == "__main__":
#     main()

def is_valid_base64(b64_string):
    """
    检测输入的字符串是否是有效的 Base64 编码
    """
    try:
        # 尝试解码 Base64 字符串
        base64.b64decode(b64_string, validate=True)
        return True
    except Exception:
        return False


def main():
    try:
        # 从标准输入读取 JSON 数据
        input_data = sys.stdin.read()
        data = json.loads(input_data)

        # 获取 base64 编码的图片
        img1_base64 = data["img1_base64"]
        img2_base64 = data["img2_base64"]

        #  # 检查 Base64 数据是否存在
        # if not img1_base64 or not img2_base64:
        #     raise ValueError("Missing 'img1_base64' or 'img2_base64' in input data")

        # # 检测 Base64 数据是否有效
        # if not is_valid_base64(img1_base64):
        #     raise ValueError("Invalid Base64 data in 'img1_base64'")
        # if not is_valid_base64(img2_base64):
        #     raise ValueError("Invalid Base64 data in 'img2_base64'")




        # Perform verification
        result = DeepFace.verify(img1_base64, img2_base64, model_name="OpenFace")

        # 打印 JSON 结果
        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()