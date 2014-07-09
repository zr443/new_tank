tk.Tank = cc.Sprite.extend({
    //群组半径的平方
    //neighbor_radiusSQ : 10,
    //速度
    velocity : 2,
    //角速度，弧度
    turn_rate : 0.3,
    //最大角速度
    max_turn_rate : 0.3,
    //视角半径，最好与火力范围一致，因为在GW中要通过此范围来判断子弹是否击中
    view_radius    : 200,
    //原地转弯
    pivot_steering : 0,
    //等级
    grade : 1,
    //阵营,默认为中立
    faction : 0,
    //技能冷却时间
    cdt : 30,
    //火力范围
    fire_radius : 180,
    //生命值
    hp : 100,
    
    
    
    
    ////////以下属性不用设置
    target : null,
    //是否处于中断状态
    interrupt : 0,
    //是否处于停止状态
    stoped : 0,
    //碰撞组
    collide_group_id : null,
    collide_num : 0,
    collide:null,
    //有路径冲突的对象
    conflict:null,
    conflict_step:0,
    //是否正在躲避障碍物
    blocked : null,
    //冷却计数器
    cd_counter : 0,
    //血条
    hp_indicator : null,
    //触角节数
    tentacle_num : 16,
    //未来状态是否发生改变
    state_change_flag : 0,
    //转向锁定
    steering_lock : 0,
    ctor:function (opts, skin) {
        opts = opts || {};
        for (var i in opts) {
            if (this[i]) {
                this[i] = opts[i];
            }
        }
        this.velocitySQ    = this.velocity * this.velocity;
        this.view_radiusSQ = this.view_radius * this.view_radius;
        this.fire_radiusSQ = this.fire_radius * this.fire_radius;
        //目标点
        this._super();
        this.init(skin);
        this.scheduleUpdate();
        this.vertices = [cc.p(0, 0), cc.p(0, 0), cc.p(0, 0), cc.p(0, 0)];
        var _size = this.getContentSize();
        this.w       = _size.width - this.velocity;
        this.h       = _size.height - this.velocity;
        //触角
        this.tentacles       = [];
        //触角长度
        this.tentacle_legnth = this.tentacle_num * this.velocity;
        this.inactivity_bullets = [];
        this.bullets = {};
        this.full_hp = this.hp;
        this.fsm = new tk.FSM(this);
        this.active = true;
    },
    setTarget : function (post, origin, radian) {
        post = post || origin;
        this.target = cc.p(post.x, post.y);
        if (post.x == origin.x && post.y == origin.y) {
            return;
        }
        var _post   = origin;
        var distSQ = cc.pDistanceSQ(_post, post);
        var turn_rate = distSQ ? 2 * Math.sqrt(this.velocitySQ / distSQ) + 0.01 : 3;
        if (turn_rate >= this.max_turn_rate) {
            this.pivot_steering = 1;
            this.turn_rate = this.max_turn_rate;
        }
        else {
            this.pivot_steering = this.steering_lock ? 1 : 0;
            //计算朝向角度
            var _goal_toward = tkUtil.getRadian(cc.pToAngle(cc.pSub(post, _post)));
            var _radian      = Math.abs(_goal_toward - radian);
            //大夹角的目标点，直接小半径大转弯
            if (_radian > 1 && _radian < 5.2) {
                this.turn_rate = this.max_turn_rate;
            }
            else {
                this.turn_rate = turn_rate;
            }
        }
    },
    getTarget : function () {
        return this.target;
    },
    forward : function (_p, _r) {
        var _vertices = [],
            _offset   = tkUtil.getOffset(_r),
            h         = this.h,
            w         = this.w;
        if (!this.pivot_steering) {
            _p.x += this.velocity * _offset.x;
            _p.y += this.velocity * _offset.y;
        }
        //计算顶点
        _vertices[0] = cc.p(_p.x - (h * _offset.x - w * _offset.y)/2, _p.y - (h * _offset.y + w * _offset.x)/2);
        _vertices[1] = cc.p(_p.x - (h * _offset.x + w * _offset.y)/2, _p.y - (h * _offset.y - w * _offset.x)/2);
        _vertices[2] = cc.p(_p.x + (h * _offset.x - w * _offset.y)/2, _p.y + (h * _offset.y + w * _offset.x)/2);
        _vertices[3] = cc.p(_p.x + (h * _offset.x + w * _offset.y)/2, _p.y + (h * _offset.y - w * _offset.x)/2);
        return {
            point    : cc.p(_p.x, _p.y),
            vertices : _vertices
        };
    },
    left : function (_r) {
        return tkUtil.getSafeRadian(_r - this.turn_rate);
    },
    right : function (_r) {
        return tkUtil.getSafeRadian(_r + this.turn_rate);
    },
    /**
     * 根据上一个位置来计算下一个位置的点和方向
     * @param   node 位置对象，包括坐标轴的位置，和指向
     * @returns node 位置对象，
     */
    move : function (node) {
        var _target   = this.getTarget(),
            _post     = node.point,
            _vertices = node.vertices;
        //已经抵达目标地点
        if (_post.x == _target.x && _post.y == _target.y) {
            var _new_target = this.fsm.getNextTarget();
            //如果获取触角下一个位置时，状态已经发生变化，那么在此节点上打上标记，表示未来需要更换状态
            if (null === _new_target || (_new_target.x == _target.x && _new_target.y == _target.y)) {
                var new_node = {
                    point    : cc.p(_post.x, _post.y),
                    vertices : [],
                    radian   : node.radian
                };
                for (var i = 0; i < 4; i++) {
                    new_node.vertices[i] = cc.p(_vertices[i].x, _vertices[i].y);
                }
                if (this.state_change_flag) {
                    new_node.state_change_flag = 1;
                }
                this.state_change_flag = 0;
                return new_node;
            }
            this.setTarget(_new_target, _post, node.radian);
            _target = _new_target;
        }
        //如果仅差一步之遥，则直接跳到目标点
        if (this.velocitySQ >= cc.pDistanceSQ(_post, _target)) {
            var _offsetX = _target.x - _post.x;
            var _offsetY = _target.y - _post.y;
            var new_node = {
                point    : cc.p(_target.x, _target.y),
                vertices : [],
                radian   : node.radian
            };
            for (var i = 0; i < 4; i++) {
                new_node.vertices[i] = cc.p(_vertices[i].x + _offsetX, _vertices[i].y + _offsetY);
            }
            if (this.state_change_flag) {
                new_node.state_change_flag = 1;
            }
            this.state_change_flag = 0;
            return new_node;
        }
        //计算朝向角度
        var _goal_toward = tkUtil.getRadian(cc.pToAngle(cc.pSub(_target, _post)));
        var _r           = node.radian;
        var _radian      = _goal_toward - _r;
        if (Math.abs(_radian) < this.turn_rate) {
            _r = _goal_toward;
            this.pivot_steering = 0;
        }
        else {
            _radian = tkUtil.getSafeRadian(_radian);
            if (Math.PI <= _radian) {
                _r = this.left(_r);
            }
            else {
                _r = this.right(_r);
            }
        }
        var _p = this.forward(_post, node.radian);
        var new_node = {
            point    : _p.point,
            vertices : _p.vertices,
            radian   : _r
        };
        if (this.state_change_flag) {
            new_node.state_change_flag = 1;
        }
        this.state_change_flag = 0;
        return new_node;
    },
    action : function (post) {
        this.vertices = post.vertices;
        this.setPosition(post.point);
        this.setRotation(tkUtil.radianToAngle(post.radian));
        if (post.state_change_flag) {
            this.getFSM().changeState();
        }
    },
    //坐标系转换
    localWorld : function (post, toward, self_post, self_toward) {
        var _self_post = self_post,
            _new_post  = cc.p(post.x - _self_post.x, post.y - _self_post.y),
            _toward    = tkUtil.getSafeRadian(toward - self_toward),
            _sin       = Math.sin(self_toward),
            _cos       = Math.cos(self_toward);
        return {
            post   : cc.p(_new_post.x * _cos - _new_post.y * _sin, _new_post.x * _sin + _new_post.y * _cos),
            toward : tkUtil.radianToAngle(_toward)
        };
    },
    getFSM : function () {
        return this.fsm;
    },
    getState : function () {
        return this.fsm.currentState;
    },
    fire : function () {
        if (0 < this.cd_counter) {
            return;
        }
        var _bullet;
        if (0 < this.inactivity_bullets.length) {
            _bullet = this.inactivity_bullets.pop();
            _bullet.activate();
            _bullet.reset();
        }
        else {
            _bullet = tk.Bullet.create(this);
        }
        this.bullets[_bullet.id] = _bullet;
        this.cd_counter = this.cdt;
    },
    hurt : function (bullet) {
        this.hp -= bullet.dps;
        if (0 >= this.hp) {
            this.destroy();
            return false;
        }
        //if ('player' == this.id || 'player' == bullet.owner.id) {
        if (true) {
            //显示血条
            if (!this.hp_indicator) {
                this.hp_indicator = new tk.TankHP(this);
                this._parent.addChild(this.hp_indicator, 1000, 'hp');
            }
            this.hp_indicator.opacity = 3.0;
        }
    },
    destroy : function () {
        this.setVisible(false);
        this.active = false;
        this.fsm    = null;
    },
    update : function () {
        var ret = this.getState().update();
        if (0 < this.cd_counter) {
            this.cd_counter--;
        }
        this.conflict = null;
        this.collide  = null;
        this.conflict_step = 0;
        this.collide_group_id = null;
        this.collide_num = 0;
        this.blocked = null;
        if (false === ret) {
            return;
        }
        if (this.stoped) {
            this.popTentacle();
            this.stoped = 0;
            return;
        }
        //先添加触角
        var _len = this.tentacles.length,
            _post, //上一个节点位置
            _new_post;
        if (0 < _len) {
            _post = this.tentacles[_len - 1];
        }
        else {
            _post = {point : this.getPosition(), radian : this._rotationRadiansX, vertices : this.vertices};
        }
        _new_post = this.move(_post);
        if (false !== _new_post) {
            this.addTentacle(_new_post);
            if (_len < this.tentacle_num) {
                var tmp_post = this.move(_new_post);
                if (false !== tmp_post) {
                    this.addTentacle(tmp_post);
                }
            }
        }
        this.action(this.shiftTentacle());
        if (cc.COCOS2D_DEBUG) {
            //画视角半径
            if (!this.circle) {
                this.circle = new tkTools.circle(this.view_radius);
                this._parent.addChild(this.circle, 4, this.id + '_circle');
            }
            this.circle.setPosition(this.getPosition());
        }
    },
    addTentacle : function (post) {
        if (cc.COCOS2D_DEBUG) {
            var _shadowA, _shadowB;
            if (!this.shadow || 0 == this.shadow.length) {
                this.shadow = [];
                _shadowA = new tkTools.circle(5);
                this._parent.addChild(_shadowA, 3, this.id + '_shadowA_' + 0);
                _shadowB = new tkTools.circle(5);
                this._parent.addChild(_shadowB, 3, this.id + '_shadowB_' + 0);
            }
            else {
                if (!this.hid_shadow || 0 == this.hid_shadow.length) {
                    _shadowA = new tkTools.circle(5);
                    this._parent.addChild(_shadowA, 3, this.id + '_shadowA_' + this.shadow.length);
                    _shadowB = new tkTools.circle(5);
                    this._parent.addChild(_shadowB, 3, this.id + '_shadowB_' + 0);
                }
                else {
                    var _shadow = this.hid_shadow.pop();
                    _shadowA = _shadow[0];
                    _shadowB = _shadow[1];
                }
            }
            _shadowA.setPosition(post.vertices[2]);
            _shadowB.setPosition(post.vertices[3]);
            _shadowA.setVisible(true);
            _shadowA.active = true;
            _shadowB.setVisible(true);
            _shadowB.active = true;
            this.shadow.push([_shadowA, _shadowB]);
        }
        //判断新加的触角是被障碍物阻挡
        this.tentacles.push(post);
    },
    shiftTentacle : function () {
        if (cc.COCOS2D_DEBUG) {
            var _shadow = this.shadow.shift();
            if (!_shadow) {
                return;
            }
            var _shadowA = _shadow[0];
            var _shadowB = _shadow[1];
            _shadowA.setVisible(false);
            _shadowB.setVisible(false);
            _shadowA.active = false;
            _shadowB.active = false;
            if (!this.hid_shadow) {
                this.hid_shadow = [];
            }
            this.hid_shadow.push(_shadow);
        }
        return this.tentacles.shift();
    },
    popTentacle : function () {
        if (cc.COCOS2D_DEBUG) {
            var _shadow = this.shadow.pop();
            if (!_shadow) {
                return;
            }
            var _shadowA = _shadow[0];
            var _shadowB = _shadow[1];
            _shadowA.setVisible(false);
            _shadowB.setVisible(false);
            _shadowA.active = false;
            _shadowB.active = false;
            if (!this.hid_shadow) {
                this.hid_shadow = [];
            }
            this.hid_shadow.push(_shadow);
        }
        return this.tentacles.pop();
    },
    removeTentacle : function () {
        this.tentacles = [];
        if (cc.COCOS2D_DEBUG) {
            this.shadow = this.shadow || [];
            var _shadow = this.shadow.shift();
            while (_shadow) {
                var _shadowA = _shadow[0];
                var _shadowB = _shadow[1];
                _shadowA.setVisible(false);
                _shadowB.setVisible(false);
                _shadowA.active = false;
                _shadowB.active = false;
                if (!this.hid_shadow) {
                    this.hid_shadow = [];
                }
                this.hid_shadow.push(_shadow);
                _shadow = this.shadow.shift();
            }
        }
    },
    getSize : function () {
        return {
            w :this.w,
            h : this.h
        };
    }
});

tk.TankHP = cc.Sprite.extend({
    ctor: function (owner) {
        this._super();
        this.owner  = owner;
        var size    = this.owner.getContentSize();
        this.offsetX = size.width / 2;
        this.offsetY = size.height / 2 + 26;
        this.w = size.width;
        this.h = 10;
        this.full   = this.w - 2;
        this.remain = this.full;
        this.scheduleUpdate();
        this.opacity = 0;
    },
    update : function () {
        var _p = this.owner.getPosition();
        var _x = _p.x - this.offsetX;
        var _y = _p.y - this.offsetY;
        this.remain = Math.floor(this.full * this.owner.hp/this.owner.full_hp);
        this.setPosition(cc.p(_x, _y));
        if (0 < this.opacity) {
            this.opacity -= 0.1;
        }
    },
    draw:function () {
        if (0 < this.opacity) {
            cc.drawingUtil.setDrawColor4F(1, 0, 0, this.opacity);
            cc.drawingUtil.drawRect(cc.PointZero(), cc.p(this.w, this.h));
            cc.drawingUtil.drawSolidRect(cc.p(2, 2), cc.p(this.remain, this.h - 2), new cc.Color4F(1, 0, 0, this.opacity));
        }
    }
});