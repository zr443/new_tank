var tkState = {};
tkState.base = cc.Class.extend({
    //是否是静止状态
    is_resting : 0,
    //当前的schedule游标
    index : 0,
    ctor:function (owner) {
        this.schedule = [];
    },
    attachOwner : function (owner) {
        this.owner = owner;
    },
    update : function () {
        return true;
    }
});

/**
 * 巡逻状态
 * 至少需要两个点
 */
tkState.Patrol = tkState.base.extend({
    name  : 'patrol',
    ctor:function () {
        if (2 > arguments.length) {
            return false;
        }
        this._super();
        for(var i = 0; i < arguments.length; i++) {
            this.schedule.push(arguments[i]);
        }
    },
    update : function () {
        var _tank = this.owner;
        //如果发现敌军，干它，完了再反转
        if (_tank.nearest_enemy) {
            _tank.getFSM().changeState(new tkState.Chase(_tank.enemies[_tank.nearest_enemy.id]));
            _tank.interrupt = 1;
        }
    },
    getNextTarget : function () {
        var target = this.schedule[this.index];
        this.index++;
        if (this.index == this.schedule.length) {
            this.index = 0;
        }
        return target;
    }
});


/**
 * 前往状态
 * 至少需要一个点
 */
tkState.Arrive = tkState.base.extend({
    name  : 'arrive',
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
                if (40 <= this.owner.intelligence) {
                    fsm.prestoreState(new tkState.Guard());
                }
                else {
                    fsm.prestoreState(new tkState.Rest());
                }
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

/**
 * 休息状态
 */
tkState.Rest = tkState.base.extend({
    name       : 'rest',
    is_resting : 1,
    ctor:function () {
        this._super();
        //this.schedule[0] = owner.getPosition();
    },
    getNextTarget : function () {
        return null;
    }
});


/**
 * 闪避状态，需要一个点，与单点arrive的区别时，先原地转向对准目标点后，再前进
 */
tkState.Dodge = tkState.base.extend({
    //这里如果is_resting=1的话，可能在前阶段会让真正在休息中的tank为其让路
    is_resting : 0,
    counter    : 1,
    name       : 'dodge',
    goal       : null,
    ctor:function (target, goal) {
        this._super(target);
        this.schedule.push(target);
        this.goal = goal;
    },
    getNextTarget : function () {
        if (0 == this.schedule.length) {
            if (1 == this.owner.interrupt) {
                return this.owner.getFSM().revertToPreviousState();
            }
            else {
                var fsm = this.owner.getFSM();
                fsm.prestoreState(new tkState.Guard());
                return fsm.getNextTarget();
            }
        }
        var target = this.schedule.shift();
        this.index++;
        if (this.index == this.schedule.length) {
            this.index = 0;
        }
        return target;
    },
    changeGoal : function (target, goal) {
        this.schedule = [target];
        this.goal = goal;
        this.owner.steering_lock = 1;
        this.owner.removeTentacle();
        this.owner.setTarget(this.getNextTarget(), this.owner.getPosition(), this.owner._rotationRadiansX);
        this.counter++;
    },
    attachOwner : function (owner) {
        this._super(owner);
        this.owner.steering_lock = 1;
    },
    update : function () {
        if (0 == this.owner.pivot_steering) {
            this.is_resting = 0;
            this.owner.steering_lock = 0;
        }
        this.goal.stoped = 1;
    }
});

/**
 * 绕行状态，需要一个点，和绕行的障碍物的id，以及绕行的方向
 */
tkState.Round = tkState.base.extend({
    name  : 'round',
    ctor:function (target, _block_id, _dirt, _steering_lock) {
        this._super();
        this.schedule.push(target);
        this.block_id = _block_id;
        this.dirt = _dirt;
        this.steering_lock = _steering_lock;
    },
    getNextTarget : function () {
        if (0 == this.schedule.length) {
            if (1 == this.owner.interrupt) {
                return this.owner.getFSM().revertToPreviousState();
            }
            else {
                var fsm = this.owner.getFSM();
                fsm.prestoreState(new tkState.Guard());
                return fsm.getNextTarget();
            }
        }
        var target = this.schedule.shift();
        this.index++;
        if (this.index == this.schedule.length) {
            this.index = 0;
        }
        return target;
    },
    attachOwner : function (owner) {
        this._super(owner);
        this.owner.steering_lock = this.steering_lock;
    },
    update : function () {
        if (0 == this.owner.pivot_steering) {
            this.owner.steering_lock = 0;
            this.steering_lock       = 0;
        }
    }
});