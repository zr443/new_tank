var tkEffects = {
};
tkEffects.click = cc.Sprite.extend({
    _degree : 0,
    _alpha  : 255,
    _scale  : 0.7,
    active  : true,
    ctor:function () {
        this._super();
        this.init("click");
        this.destroy();
    },
    reset:function (pos) {
        this.setVisible(true);
        this.active = true;
        this.setPosition(pos);
        this.setScale(0.2);
        this.setRotation(0);
        this.runAction(cc.RotateTo.create(0.4, 120));
        this.runAction(cc.ScaleBy.create(0.4, 2));
        this.runAction(cc.Sequence.create(cc.FadeOut.create(0.4), cc.CallFunc.create(this.destroy, this)));
    },
    destroy:function () {
        this.setVisible(false);
        this.active = false;
    }
});