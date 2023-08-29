/* 来源：https://www.cnblogs.com/codexlx/p/16446086.html */
!function () {
    function getAttr(node, attrName, nullVal) {
        return node.getAttribute(attrName) || nullVal
    }

    function getTags(n) {
        return document.getElementsByTagName(n)
    }

    function canvasConfig() {
        var allScriptTag = getTags("script"); // 取当前所有的<script>标签
        var scriptTagLength = allScriptTag.length; // <script>标签的数量
        var lastScriptTag = allScriptTag[scriptTagLength - 1]; // 最后一个<script>标签的索引（由于页面默认带了一个<script>标签，所以自己写的script标签是排在第二）
        return {
            scriptTagLength,
            zIndex: getAttr(lastScriptTag, "zIndex", -1), // canvas在页面上的z轴索引
            opacity: getAttr(lastScriptTag, "opacity", .5), // 线段的透明度
            lineColor: getAttr(lastScriptTag, "color", "237,72,69"), // 线段的颜色
            count: getAttr(lastScriptTag, "count", 99) // 最大蜘蛛网数量
        }
    }

    function setCanvasWidthAndHeight() {
        width = canvas.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        height = canvas.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    }

    function draw() {
        ctx.clearRect(0, 0, width, height); // 老规矩，画之前清空画布
        var withMouseItem, t, sx, sy, length;
        itemArr.forEach(function (item, index) {
            // 绘制点
            {
                // x,y坐标点开始偏移（正或负）
                item.x += item.xa;
                item.y += item.ya;
                // 如果某个点超出屏幕高度或者宽度的话，将这个偏移量取其反值(乘以 -1)。这样某个点就会做个镜面反射，在窗口内弹来弹去。
                item.xa *= item.x > width || item.x < 0 ? -1 : 1;
                item.ya *= item.y > height || item.y < 0 ? -1 : 1;
                // 绘制这个点（-0.5是为了让点的直径是0.5像素）
                ctx.fillRect(item.x - .5, item.y - .5, 1, 1);
            }

            for (var j = index + 1; j < withMouseArr.length; j++) {
                withMouseItem = withMouseArr[j];
                if (withMouseItem.x !== null && withMouseItem.y !== null) {
                    sx = item.x - withMouseItem.x;
                    sy = item.y - withMouseItem.y;
                    length = Math.sqrt(sx * sx + sy * sy); // 求出两个点之间的直线距离（勾股定理）
                    if (length < withMouseItem.max) {
                        if (withMouseItem === mouse && length >= withMouseItem.max / 2) {
                            // 由于mouse对象是按地址传递，所以这里通过判断mouse对象是否是withMouseArr里面的mouse对象判断。
                            item.x -= .03 * sx, item.y -= .03 * sy
                            /* 如果当前点和鼠标这个点之间的距离大于鼠标的max一半，（即当已经连上的处于mouse的max之内的点，如果超出max/2，将那个点的x,y值降低，使其保持在鼠标周围） */
                        }
                        t = (withMouseItem.max - length) / withMouseItem.max;
                        ctx.beginPath();
                        ctx.lineWidth = t / 2; // 距离越远，线段越细
                        ctx.strokeStyle = "rgba(" + d.lineColor + "," + (t + .2) + ")"; // 线段透明度随距离远变淡
                        ctx.moveTo(item.x, item.y);
                        ctx.lineTo(withMouseItem.x, withMouseItem.y);
                        ctx.stroke(); // 将这两个点连起来
                    }
                }
            }
        });

        requestAnimationFrame(draw);
    }

    var width;
    var height;
    var d = canvasConfig();
    var requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (n) {
            window.setTimeout(n, 1e3 / 45)
        };
    var mouse = { x: null, y: null, max: 300 }; // 鼠标的坐标对象。20000是鼠标最大可吸附距离

    /*canvas相关设置*/
    {
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext('2d');

        canvas.id = "c_n" + d.scriptTagLength;
        canvas.style.cssText = "position:fixed;top:0;left:0;z-index:" + d.zIndex + ";opacity:" + d.opacity;
        getTags("body")[0].appendChild(canvas);
        setCanvasWidthAndHeight();
    }

    /* 窗口resize事件、鼠标移动、移出事件 */
    {
        /* 窗口大小改变时重置canvas元素的宽高 */
        window.onresize = setCanvasWidthAndHeight;
        /* 鼠标移动时修改mouse对象里的x，y为当前鼠标位置的x,y轴位置 */
        window.onmousemove = function (canvasNode) {
            mouse.x = canvasNode.clientX;
            mouse.y = canvasNode.clientY;
        };
        /* 鼠标移出屏幕时清空此值 */
        window.onmouseout = function () {
            mouse.x = null;
            mouse.y = null;
        };
    }

    var itemArr = []; // 所有的点数组

    for (var f = 0; f < d.count; f++) {
        // 取随机x,y轴位置
        var x = Math.random() * width;
        var y = Math.random() * height;
        // 取[-1,1]之间的随机x,y轴偏移量
        var xa = 2 * Math.random() - 1;
        var ya = 2 * Math.random() - 1;
        itemArr.push({
            x, // x/y轴位置
            y,
            xa,
            ya, // -1 到 1 之间的随机值
            max: 150  // 最大线段长度
        })
    };
    var withMouseArr = itemArr.concat([mouse]);

    setTimeout(function () {
        draw()
    }, 100);
}();
