import sys
from datetime import timedelta
import os
from flask import Flask, jsonify, render_template, request
import json
import re
from PIL import Image, ImageDraw, ImageFile
import math

# sys.path.append('../')
# from PaddleDetection_24.deploy.python import infer

#创建Flask对象app并初始化
app = Flask(__name__)

wordname_18 = [
    'plane', 'baseball-diamond', 'bridge', 'ground-track-field',
    'small-vehicle', 'large-vehicle', 'ship', 'tennis-court',
    'basketball-court', 'storage-tank', 'soccer-ball-field', 'roundabout',
    'harbor', 'swimming-pool', 'helicopter','container-crane','airport', 'helipad'
]
custom_label = ["other", "plane", "boat", "oil tank", "hangar", "harbor","helicopter","surface track"]
model_label={'ppyoloer':wordname_18, 'ori_reppoints':wordname_18, 'cutler_clip':custom_label}
#通过python装饰器的方法定义路由地址
@app.route("/")
#定义方法 用jinjia2引擎来渲染页面，并返回一个index.html页面
def root():
    return render_template("index.html")


@app.route("/search",methods=["GET", "POST"])
def submit():
    tar_classname = request.form.get("class")
    confi=request.form.get("confidence")
    sel_model=request.form.get("model")

    print('start search!')
    # run="python /home/liux/PaddleDetection-develop/deploy/python/infer.py\
    #     --model_dir=/home/liux/PaddleDetection-develop/inference_model/s2anet_alignconv_2x_dota/\
    #     --image_dir=/data1/liux/CALVT-2022/split/1024_200_png/\
    #     --device=GPU\
    #     --output_dir /home/liux/flask_server/tmp\
    #     --save_images=False\
    #     --save_results"
    # try:
    #     os.system(run)
    # except:
    #     return {'message':"fail!",'bboxs':None}
    bboxs=[]
    areas=[]
    print(sel_model)
    result_file=f'results/{sel_model}/bbox.json'
    # with open('results/ppyoloer/bbox.json', encoding='utf-8') as a:
    with open(result_file, encoding='utf-8') as a:
    # 读取文件
        results = json.load(a)
        print(len(results))
        for result in results:
            if model_label[sel_model][result['category_id']]==tar_classname and result['score']>float(confi):
                bbox=result['bbox']
                # area=[]
                sp=re.findall(r"(\d+)_(\d+).png",os.path.basename(result['file_name']))
                if sel_model=='cutler_clip':
                    sp=[int(sp[0][0])/4,int(sp[0][1])/4]
                else: sp=[int(sp[0][0])*8192/4,int(sp[0][1])*8192/4]
                for i in range(8):
                    bbox[i]=bbox[i]/4+sp[(i+1)%2]
                bboxs.append(bbox)
                for i in range(0,8,2):
                    area=[]
                    area.append(math.floor(bbox[i]/512)*512)
                    area.append(math.floor(bbox[i+1]/512)*512)
                    area.append(area[0]+512)
                    area.append(area[1])
                    area.append(area[0]+512)
                    area.append(area[1]+512)
                    area.append(area[0])
                    area.append(area[1]+512)
                    if area not in areas:
                        areas.append(area)
                
    print(bboxs)       
    return {'message':"success!",'bboxs':bboxs,'areas':areas}
    
if __name__=='__main__':
    app.jinja_env.auto_reload = True
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.config['SEND_FILE_MAX_AGE_DEFAULT']=timedelta(seconds=1)
    app.run(port=5000,debug=True)

