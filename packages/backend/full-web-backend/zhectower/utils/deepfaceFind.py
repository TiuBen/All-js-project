# import sys
# import base64
# import numpy as np
# import cv2
# from deepface import DeepFace
# from PIL import Image
# import json

# # **确保 Python 正确读取 stdin**
# base64_string = sys.stdin.read().strip()
# if not base64_string:
#     print(json.dumps({"error": "没有收到图片"}))
#     sys.exit(1)

# # **检查 Base64 数据**
# print(f"收到 Base64 图片，长度: {len(base64_string)}", file=sys.stderr)


# # 解析 Base64
# def decode_base64_image(base64_string):
#     try:
#         base64_data = base64_string.split(",")[-1]  # 去掉 "data:image/jpeg;base64,"
#         image_data = base64.b64decode(base64_data)

#         # 用 PIL 读取数据，并转换为 OpenCV 格式
#         image = Image.open(image_data)
#         image_cv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)  # 转换为 OpenCV 格式（BGR）
#         return image_cv
#     except Exception as e:
#         print(json.dumps({"error": "Base64 解码失败: " + str(e)}))
#         sys.exit(1)


# try:
#     image = decode_base64_image(base64_string)

#     # 指定人脸数据库
#     db_path = "D:/GitHub/full-web-backend/zhectower/public"

#     # 进行人脸检索
#     results = DeepFace.find(img_path=image, db_path=db_path, model_name="VGG-Face")

#     # 返回 JSON 结果
#     match = results[0].to_dict("records") if len(results) > 0 else []
#     print(json.dumps({"match": match}))

# except Exception as e:
#     print(json.dumps({"error": str(e)}))


import sys
import base64
import json
import os
from deepface import DeepFace

def main():
    # 从标准输入读取 base64 图像数据
    base64_image = sys.stdin.read()

    # 解码 base64 图像数据
    image_data = base64.b64decode(base64_image)

    # 保存为临时文件
    temp_image_path = 'temp_image.jpeg'
    with open(temp_image_path, 'wb') as f:
        f.write(image_data)

    try:
        # 使用 DeepFace 进行人脸识别
        result = DeepFace.find(img_path=temp_image_path, db_path="D:/GitHub/full-web-backend/zhectower/public", model_name='VGG-Face')

        # 删除临时文件
        os.remove(temp_image_path)

        # 输出结果
        print(json.dumps(result))
    except Exception as e:
        # 删除临时文件
        os.remove(temp_image_path)
        print(json.dumps({'error': str(e)}))

if __name__ == '__main__':
    main()