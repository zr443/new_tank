tk.Bullet = cc.Sprite.extend({
    //每秒伤害值
    dps : 16,
    //速度
    velocity : 20,
    id  : '',
    ctor:function (owner) {
        this._super();
        this.owner = owner;
        this.faction = owner.faction;
        this.init(s_bullet);
        this.scheduleUpdate();
    },
    setId : function (id) {
        this.id = id;
    },
    update : function () {
        var _offset = tkUtil.getOffset(this._rotationRadiansX),
            _p      = this.getPosition();
        if (cc.pDistanceSQ(_p, this.owner.getPosition()) > this.owner.fire_radiusSQ) {
            this.destroy();
            return;
        }
        _p.x += this.velocity * _offset.x;
        _p.y += this.velocity * _offset.y;
        this.setPosition(_p);
    },
    reset : function () {
        this.setPosition(this.owner.getPosition());
        this._rotationRadiansX = this.owner._rotationRadiansX;
        this._rotationX = this.owner._rotationX;
    },
    activate : function () {
        this.setVisible(true);
        this.active = true;
    },
    destroy : function () {
        delete this.owner.bullets[this.id];
        this.owner.inactivity_bullets.push(this);
        this.setVisible(false);
        this.active = false;
    }
});

tk.Bullet.create = function (owner) {
    var sprite = new tk.Bullet(owner);
    sprite.reset();
    tk.GW.addBullet(sprite);
    return sprite;
};