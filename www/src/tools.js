var tkTools = {};
tkTools.rect = cc.Sprite.extend({
    ctor:function () {
        this._super();
        this.init(s_tank2);
        this.setOpacity(50);
    }
});
tkTools.f22 = cc.Sprite.extend({
    ctor:function () {
        this._super();
        this.init(s_f22);
    }
});

tkTools.circle = cc.Sprite.extend({
    r   : 0,
    ctor: function (r) {
        this._super();
        this.r = r;
    },
    draw:function () {
        cc.drawingUtil.setDrawColor4B(255,0,0,255);
        //第四个参数，目测是平滑度
        cc.drawingUtil.drawCircle(cc.PointZero(), this.r, 0, 100, false);
    }
});

tkTools.rect = cc.Sprite.extend({
    ctor: function (size) {
        this._super();
        this.size  = size;
    },
    draw:function () {
        cc.drawingUtil.setDrawColor4B(0,0,0,255);
        cc.drawingUtil.drawSolidRect(cc.PointZero(), cc.p(this.size.w, this.size.h), new cc.Color4F(0, 0, 0, 1));
    }
});

tkTools.greenCircle = cc.Sprite.extend({
    r   : 0,
    ctor: function (r) {
        this._super();
        this.r = r;
    },
    draw:function () {
        cc.drawingUtil.setDrawColor4B(0,255,0,100);
        //第四个参数，目测是平滑度
        cc.drawingUtil.drawCircle(cc.PointZero(), this.r, 0, 100, false);
    }
});

tkTools.solidCircle = cc.Sprite.extend({
    r   : 0,
    ctor: function (r) {
        this._super();
        this.r = r;
    },
    draw:function () {
        cc.drawingUtil.setDrawColor4B(0,0,0,100);
        //第四个参数，目测是平滑度
        cc.drawingUtil.drawSolidCircle(cc.PointZero(), this.r, 0, 100, false);
    }
});

tkTools.solidCircle2 = cc.Sprite.extend({
    r   : 0,
    ctor: function (r) {
        this._super();
        this.r = r;
    },
    draw:function () {
        cc.drawingUtil.setDrawColor4B(255,0,0,100);
        //第四个参数，目测是平滑度
        cc.drawingUtil.drawSolidCircle(cc.PointZero(), this.r, 0, 100, false);
    }
});

tkTools.redSolidCircle = cc.Sprite.extend({
    r   : 0,
    ctor: function (r) {
        this._super();
        this.r = r;
    },
    draw:function () {
        cc.drawingUtil.setDrawColor4B(255,0,0,100);
        //第四个参数，目测是平滑度
        cc.drawingUtil.drawSolidCircle(cc.PointZero(), this.r, 0, 100, false);
    }
});