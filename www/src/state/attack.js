/**
 * 攻击状态
 * 需要一个活动目标
 */
tkState.Attack = tkState.base.extend({
    is_resting : 1,
    goal : null,
    name  : 'attack',
    ctor:function (goal) {
        this.goal = goal;
    },
    update : function () {
        if (false === this.goal.active) {
            delete this.goal;
            var fsm = this.owner.getFSM();
            console.log(this.owner.intelligence, this.owner.interrupt);
            if (90 < this.owner.intelligence) {
                console.log('Guard');
                fsm.changeState(new tkState.Guard());
                return false;
            }
            if (1 == this.owner.interrupt) {
                var _t = fsm.revertToPreviousState();
                this.owner.setTarget(_t, this.owner.getPosition(), this.owner._rotationRadiansX);
                return false;
            }
            fsm.changeState(new tkState.Rest());
            return false;
        }
        var p1 = this.goal.getPosition();
        var p2 = this.owner.getPosition();
        if (cc.pDistanceSQ(p1, p2) > this.owner.fire_radiusSQ) {
            var fsm = this.owner.getFSM();
            fsm.changeState(new tkState.Chase(this.goal));
        }
        else {
            //move函数将不再生效
            this.owner.target = p2;
            //计算朝向
            var _goal_toward = tkUtil.getRadian(cc.pToAngle(cc.pSub(p1, p2)));
            var _r           = this.owner._rotationRadiansX;
            var _radian      = _goal_toward - _r;
            if (Math.abs(_radian) < this.owner.turn_rate) {
                this.owner.setRotation(tkUtil.radianToAngle(_goal_toward));
                var _p = this.owner.forward(p2, _goal_toward);
                this.owner.vertices = _p.vertices;
                this.owner.fire();
            }
            else {
                //实现move里的部分方法
                this.owner.pivot_steering = 1;
                _radian = tkUtil.getSafeRadian(_radian);
                if (Math.PI <= _radian) {
                    _r = this.owner.left(_r);
                }
                else {
                    _r = this.owner.right(_r);
                }
                var _p = this.owner.forward(p2, this.owner._rotationRadiansX);
                this.owner.action({
                    point    : _p.point,
                    vertices : _p.vertices,
                    radian   : _r
                });
            }
            return false;
        }
    },
    getNextTarget : function () {
        return null;
    }
});

/**
 * 追踪状态
 * 需要一个活动目标
 */
tkState.Chase = tkState.base.extend({
    goal : 0,
    name  : 'chase',
    ctor:function (goal) {
        this.goal = goal;
    },
    update : function () {
        if (false === this.goal.active) {
            delete this.goal;
            var fsm = this.owner.getFSM();
            if (1 == this.owner.interrupt) {
                var _t = fsm.revertToPreviousState();
                this.owner.setTarget(_t, this.owner.getPosition(), this.owner._rotationRadiansX);
                return false;
            }
            fsm.changeState(new tkState.Rest());
            return false;
        }
        var p1 = this.goal.getPosition();
        var p2 = this.owner.getPosition();
        if (cc.pDistanceSQ(p1, p2) > this.owner.view_radiusSQ + 1000 * this.owner.intelligence) {
            var fsm = this.owner.getFSM();
            if (1 == this.owner.interrupt) {
                var _t = fsm.revertToPreviousState();
                this.owner.setTarget(_t, this.owner.getPosition(), this.owner._rotationRadiansX);
                return false;
            }
            fsm.changeState(new tkState.Rest());
            return false;
        }
        else if (cc.pDistanceSQ(p1, p2) < this.owner.fire_radiusSQ - 2000) {
            var fsm = this.owner.getFSM();
            fsm.changeState(new tkState.Attack(this.goal));
        }
        else {
            this.owner.setTarget(p1, p2, this.owner._rotationRadiansX);
        }
    },
    getNextTarget : function () {
        return null;
    }
});

/**
 * 警戒状态
 */
tkState.Guard = tkState.base.extend({
    name  : 'guard',
    is_resting : 1,
    ctor:function () {
        this._super();
    },
    update : function () {
        var _tank = this.owner;
        var post  = _tank.getPosition();
        //如果发现敌军，干它，完了再反转
        if (_tank.nearest_enemy) {
            //先切换到Arrive状态，以便反转时能再跑回来
            _tank.target = post;
            _tank.getFSM().changeState(new tkState.Arrive(post));
            _tank.getFSM().changeState(new tkState.Chase(_tank.enemies[_tank.nearest_enemy.id]));
            _tank.interrupt = 1;
        }
    },
    getNextTarget : function () {
        return null;
    }
});

/**
 * 逃跑状态
 */
tkState.Escape = tkState.base.extend({
    name  : 'escape',
    ctor:function () {
        if (1 > arguments.length) {
            return false;
        }
        this._super();
        for(var i = 0; i < arguments.length; i++) {
            this.schedule.push(arguments[i]);
        }
    },
    getNextTarget : function () {
        if (0 == this.schedule.length) {
            if (1 == this.owner.interrupt) {
                return this.owner.getFSM().revertToPreviousState();
            }
            else {
                var fsm = this.owner.getFSM();
                fsm.prestoreState(new tkState.Rest());
                return fsm.getNextTarget();
            }
        }
        var target = this.schedule.shift();
        this.index++;
        if (this.index == this.schedule.length) {
            this.index = 0;
        }
        return target;
    }
});