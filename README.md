## wvv
#0.02版本，简要想法如下：
```
Graphics包含绘制的常用函数
Shape, Image, Text是三种基本的Element，Stage里面直接是Element，Group起到给Stage布局的作用
这些基本的Element，如果没设置width和height，width和height就由内容自动判断，否则按照设置的为准。宽和高在绘制之后不容改变，否则会出现异常。
Element中没有x, y，只有matrix数组，position记录它的位置(用四个点来表示)；
ElemClip只显示Element原始状态的一部分，ElemClip本身也Element，可以有自己的matrix, position等。

Image Text Graphics是三种基本的Drawable, Element可以用来呈现drawable, 记录其position，alpha等。DrawableClip:只显示Drawable原始状态的一部分，DrawableClip 本身也是Drawable，可以有自己的scale或者rotate。

Drawable:
  draw
  scale
  rotate
  getSize()： scale==1 && rotate ==0: fit size
  
DrawableClip：
  init(drawable, x, y, width, height);
  draw
  scale
  rotate
  getSize()
  
Element
  rotate(angle, px, py)
  translate(tx, ty)
  draw
  getSize()
```

#构建
需要安装browserify:
npm install -g browserify

构建命令：
browserify main.js > bin/bundle.js
用浏览器打开t2.html即可预览demo。



#版本回顾：
0.0.1版本 4月16日
  基础框架
0.0.2版本 4月18日
  添加动画机制，增加tween.js类
0.0.3版本 4月20日
  添加ImageDrawable
