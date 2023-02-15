let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");
let img=new Image();
img.src="../../static/pictures/10240.png";
let scale       = 1;
let scaleFactor = 0.008;
let imgx=10240/2.0;
let imgy=10240/2.0;
let mousex;
let mousey;
let mousex_cur;
let mousey_cur;
let if_down=false;
//注意！！bboxs始终为box在图片上的坐标
let bboxs=[];
let areas=[]
let select_class="plane";
let select_model="ppyoloer"
let confidence=0.5

wordname_18 = [
    'plane', 'baseball-diamond', 'bridge', 'ground-track-field',
    'small-vehicle', 'large-vehicle', 'ship', 'tennis-court',
    'basketball-court', 'storage-tank', 'soccer-ball-field', 'roundabout',
    'harbor', 'swimming-pool', 'helicopter','container-crane','airport', 'helipad'
]
custom_label = ["other", "plane", "boat", "oil tank", "hangar", "harbor","helicopter","surface track"]

body.onload = function(){
    ctx.drawImage(img,0,0,img.width,img.height,0,0,1080,1080);
}

//画bbox
//bboxs是box以canvas原点的坐标系，但是还需要缩放
function draw_bbox() {
    // ctx.font  = "20px sans-serif"
    // ctx.fillStyle = '#e22018'
    // ctx.fillText("添加文字", 125, 137);
    ctx.lineWidth = "1";// 线条的粗细
    ctx.strokeStyle = "red"; // 线条的颜色
    //深拷贝,坐标系转换
    var tmp=JSON.parse(JSON.stringify(bboxs));
    console.log(tmp)
    for(i=0;i<bboxs.length;i++){
        for(j=0;j<8;j+=2){
            tmp[i][j]=bboxs[i][j]+img.width*scale/2-imgx;
            tmp[i][j+1]=bboxs[i][j+1]+img.height*scale/2-imgy;
        }
        ctx.beginPath();
        var can2img=img.width/canvas.width*scale;
        ctx.moveTo(tmp[i][0]/can2img, tmp[i][1]/can2img);
        for(j=2;j<8;j+=2){
            ctx.lineTo(tmp[i][j]/can2img, tmp[i][j+1]/can2img);
        }
        ctx.closePath();
        ctx.stroke();// 最后，画线条，作用是描边————这句才是真正的画线！
    }

    ctx.strokeStyle = "blue"; // 线条的颜色
    var tmp=JSON.parse(JSON.stringify(areas));
    console.log(tmp)
    for(i=0;i<areas.length;i++){
        for(j=0;j<8;j+=2){
            tmp[i][j]=areas[i][j]+img.width*scale/2-imgx;
            tmp[i][j+1]=areas[i][j+1]+img.height*scale/2-imgy;
        }
        ctx.beginPath();
        var can2img=img.width/canvas.width*scale;
        ctx.moveTo(tmp[i][0]/can2img, tmp[i][1]/can2img);
        for(j=2;j<8;j+=2){
            ctx.lineTo(tmp[i][j]/can2img, tmp[i][j+1]/can2img);
        }
        ctx.closePath();
        ctx.stroke();// 最后，画线条，作用是描边————这句才是真正的画线！
    }
};


Search.onclick = function() {
    confidence = document.getElementById("confidence").value;
    $.ajax({
        url: "search", 
        type: "POST",  /*采用POST方法提交*/
        data: { "class": select_class, "model": select_model, "confidence":confidence},  /*提交的数据（json格式），从输入框中获取*/
        /*result为后端函数返回的json*/
        success: function (result) {
            if (result.message == "success!") {
                bboxs=JSON.parse(JSON.stringify(result.bboxs));
                areas=JSON.parse(JSON.stringify(result.areas));
                
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img,imgx-img.width*scale/2.0,imgy-img.height*scale/2.0,img.width*scale,img.height*scale,0,0,1080,1080);
                draw_bbox();
            }
            else {
                alert("404 not found!")
            }
        }
    });
}

select_classes.onchange=function(){
    var objS = document.getElementById("select_classes");
    select_class = objS.options[objS.selectedIndex].value;
}
select_models.onchange=function(){
    var objS = document.getElementById("select_models");
    select_model = objS.options[objS.selectedIndex].value;
    var obj = document.getElementById("select_classes");
    obj.options.length=0;
    if(select_model=="cutler_clip"){
        for(i=0;i<custom_label.length;i++){
            obj.add(new Option(custom_label[i],custom_label[i]));
        }
    }
    else{
        for(i=0;i<wordname_18.length;i++){
            obj.add(new Option(wordname_18[i],wordname_18[i]));
        }
    }
}

//鼠标滚轮事件
myCanvas.onwheel = function(e){
    e.preventDefault();
    // calculate scale direction 6 new scale value
    let direction = e.deltaY > 0 ? 1 : -1;
    scale += scaleFactor * direction;
    if(scale<0.02||scale>2)
    scale -= scaleFactor * direction;
    //优化手感
    scaleFactor=0.007*scale+0.001

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img,imgx-img.width*scale/2.0,imgy-img.height*scale/2.0,img.width*scale,img.height*scale,0,0,1080,1080);
    draw_bbox();
}

//鼠标拖移事件
myCanvas.onmousedown = function(e){
    getMousePos(myCanvas,e);
    mousex=mousex_cur;
    mousey=mousey_cur;
    if_down=true;
    console.log("鼠标点击")
}
myCanvas.onmouseup = function(e){
    if_down=false;
    console.log("鼠标抬起")
}
myCanvas.onmousemove = function(e){
    if(if_down){
        getMousePos(myCanvas,e);
        var deltax=(mousex_cur-mousex)*img.width/canvas.width*scale;
        var deltay=(mousey_cur-mousey)*img.width/canvas.width*scale;
        console.log(imgx,imgx)
        imgx=imgx-deltax;
        imgy=imgy-deltay;
        console.log(imgx,imgx)
        mousex=mousex_cur;
        mousey=mousey_cur;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img,imgx-img.width*scale/2.0,imgy-img.height*scale/2.0,img.width*scale,img.height*scale,0,0,1080,1080);
        draw_bbox();
        console.log("鼠标移动")
    }
    
}

function getMousePos(canvas, event) {
    //1
    var rect = canvas.getBoundingClientRect();
    //2
    mousex_cur = event.clientX - rect.left * (canvas.width / rect.width);
    mousey_cur = event.clientY - rect.top * (canvas.height / rect.height);
}