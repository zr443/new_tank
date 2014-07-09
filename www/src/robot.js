tk.Robot = tk.Tank.extend({
    id  : '',
    //智商
    intelligence : 80,
    ctor:function (state, img) {
        this._super({}, img);
        this.fsm.init(state);
        //视角范围内的敌军
        this.enemies         = {};
        //最近的一个敌人
        this.nearest_enemy   = null;
    },
    setId : function (id) {
        this.id = id;
    },
    update : function () {
        this._super();
        //清空周围的情况
        //视角范围内的敌军
        this.enemies         = {};
        //最近的一个敌人
        this.nearest_enemy   = null;
    },
    getOrigin : function () {
        if (!this.tentacles) {
            return this.getPosition();
        }
        var _len = this.tentacles.length;
        if (0 < _len) {
            var _post = this.tentacles[_len - 1];
            return _post.point;
        }
        else {
            return this.getPosition();
        }
    },
    setBirthPlace : function (p) {
        this.birthplace = p;
    },
    getBirthPlace : function () {
        return this.birthplace;
    },
    hurt : function (bullet) {
        this._super(bullet);
        var _fsm = this.fsm;
        //逃跑状态，什么都不管
        if ('escape' == _fsm.currentState.name) {
            return;
        }
        //是否逃跑
        if (45 > this.hp && 70 < this.intelligence) {
            //跑到出生点
            this.fsm.changeState(new tkState.Escape(this.getBirthPlace()));
            return false;
        }
        //是否反击
        if ('attack' != this.fsm.currentState.name && 50 < this.intelligence) {
            //this.target = bullet.owner.getPosition();
            this.fsm.changeState(new tkState.Attack(bullet.owner));
        }
    },
    addEnemy : function (tank, dist) {
        var _id = tank.id;
        if (!this.enemies[_id]) {
            if (!this.nearest_enemy || dist < this.nearest_enemy.dist) {
                this.nearest_enemy = {
                    id   : _id,
                    dist : dist
                };
            }
            this.enemies[_id] = tank;
        }
    },
    //回收子弹和血条等等
    destroy : function () {
        this._super();
        for (var i = 0; i < this.inactivity_bullets.length; i++) {
            this.inactivity_bullets[i].removeFromParent();
        }
        for (var j in this.bullets) {
            this.bullets[j].removeFromParent();
        }
        if (this.hp_indicator) {
            this.hp_indicator.removeFromParent();
        }
        if (cc.COCOS2D_DEBUG) {
            for (var i = 0; i < this.shadow.length; i++) {
                this.shadow[i][0].removeFromParent();
                this.shadow[i][1].removeFromParent();
            }
        }
    }
});

tk.Robot.create = function (state, img, post) {
    var sprite = new tk.Robot(state, img);
    sprite.setPosition(post);
    sprite.setBirthPlace(post);
    return sprite;
};
