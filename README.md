# 代码说明

## Requirements:
安装python, flask

## 进入flask_server目录下，运行:

    python app.py

## 前后端交互
主要代码是app.py文件，通过读取用户选择的检测类别，检测模型，置信度信息，读取预先生成的检测结果文件，将bbox返回给前端显示。