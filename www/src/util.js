var tkUtil = {
    fullRadian : 2 * Math.PI,
    halfPI     : 0.5 * Math.PI,
    fullhalfPI : 2.5 * Math.PI,
    PAConst    : 0.017453292519943295, //(Math.PI / 180);
    APConst    : 57.2958279, //(180 / Math.PI);
    //将弧度值转换为2π以内的安全值
    getSafeRadian : function (r) {
        if (0 <= r && r <= this.fullRadian) {
            return this.round2p(r);
        }
        if (0 > r) {
            return this.getSafeAngle(this.fullRadian + r);
        }
        else if (this.fullRadian < r) {
            return this.getSafeAngle(r - this.fullRadian);
        }
    },
    getRadian : function (r) {
        r = this.fullhalfPI - r; 
        return this.getSafeRadian(r);
    },
    radianToAngle : function (r) {
        return r * this.APConst;
    },
    angleToradian : function (a) {
        return r * this.PAConst;
    },
    //四舍五入留2位
    round2p : function (num) {
        return Math.round(num * 100)/100;
    },
    //将角度值转换为360度以内的安全值
    getSafeAngle : function (a) {
        if (0 <= a && a <= 360) {
            return a;
        }
        if (0 > a) {
            return this.getSafeAngle(a + 360);
        }
        else if (360 < a) {
            return this.getSafeAngle(a - 360);
        }
    },

    //计算三角函数
    getOffset : function (angle) {
        var xxxx, yyyy;
        yyyy = Math.cos(angle);
        xxxx = Math.sin(angle);
        return {x : xxxx, y : yyyy};
    },
    //矩形碰撞检测
    collideCheck : function (postA, sizeA, postB, sizeB) {
        var a_x = [];
        var a_y = [];
        var b_x = [];
        var b_y = [];
        var rectA = postA.vertices;
        var rectB = postB.vertices;
        var b_offset = this.getOffset(-postB.radian);
        for (var i = 0; i < 4; i ++) {
            a_x.push((rectA[i].x - rectB[1].x)*b_offset.y + (rectA[i].y - rectB[1].y)*b_offset.x);
            a_y.push((rectB[1].x - rectA[i].x)*b_offset.x + (rectA[i].y - rectB[1].y)*b_offset.y);
        }
        if ((0 > a_x[0] && 0 > a_x[1] && 0 > a_x[2] && 0 > a_x[3]) || (sizeB.w < a_x[0] && sizeB.w < a_x[1] && sizeB.w < a_x[2] && sizeB.w < a_x[3])) {
            return false;
        }
        if ((0 > a_y[0] && 0 > a_y[1] && 0 > a_y[2] && 0 > a_y[3]) || (sizeB.h < a_y[0] && sizeB.h < a_y[1] && sizeB.h < a_y[2] && sizeB.h < a_y[3])) {
            return false;
        }
        var a_offset = this.getOffset(-postA.radian);
        for (var i = 0; i < 4; i ++) {
            b_x.push((rectB[i].x - rectA[1].x)*a_offset.y + (rectB[i].y - rectA[1].y)*a_offset.x);
            b_y.push((rectA[1].x - rectB[i].x)*a_offset.x + (rectB[i].y - rectA[1].y)*a_offset.y);
        }
        if ((0 > b_x[0] && 0 > b_x[1] && 0 > b_x[2] && 0 > b_x[3]) || (sizeA.w < b_x[0] && sizeA.w < b_x[1] && sizeA.w < b_x[2] && sizeA.w < b_x[3])) {
            return false;
        }
        if ((0 > b_y[0] && 0 > b_y[1] && 0 > b_y[2] && 0 > b_y[3]) || (sizeA.h < b_y[0] && sizeA.h < b_y[1] && sizeA.h < b_y[2] && sizeA.h < b_y[3])) {
            return false;
        }
        return true;
    },
    //点碰撞检测
    pointCollideCheck : function (point, postB, sizeB) {
        var _x , _y;
        var rectB = postB.vertices;
        var b_offset = this.getOffset(-postB.radian);
        _x = (point.x - rectB[1].x)*b_offset.y + (point.y - rectB[1].y)*b_offset.x;
        _y = (rectB[1].x - point.x)*b_offset.x + (point.y - rectB[1].y)*b_offset.y;
        if (0 > _x || sizeB.w < _x) {
            return false;
        }
        if (0 > _y || sizeB.h < _y) {
            return false;
        }
        return true;
    }
};

