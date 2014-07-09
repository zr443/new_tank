tk.FSM = cc.Class.extend({
    currentState   : null,
    //未来的状态，当生成触角时，不可避免的要通过未来状态来获取路径的。
    futureState    : null,
    previousState  : null,
    previousTarget : null,
    globalState    : null,
    owner          : null,
    ctor:function (owner) {
        this.owner = owner;
        this.path_queue = [];
    },
    init : function (state) {
        this.currentState = state;
        this.futureState  = state;
        state.attachOwner(this.owner);
        this.owner.setTarget(this.getNextTarget(), this.owner.getPosition(), this.owner._rotationRadiansX);
    },
    //立即更变状态，都需要收起触角，只有从预先状态变更才不用收起触角
    changeState : function(new_state) {
        var _update = 0;
        if (new_state) {
            _update = 1;
        }
        else {
            new_state = this.futureState;
        }
        new_state = new_state || this.futureState;
        if (1 !== this.owner.interrupt) {
            var _t = this.owner.getTarget();
            this.previousState = this.currentState;
            this.previousTarget = cc.p(_t.x, _t.y);
        }
        this.currentState = new_state;
        this.futureState  = new_state;
        new_state.attachOwner(this.owner);
        if (_update) {
            this.owner.removeTentacle();
            this.owner.setTarget(this.getNextTarget(), this.owner.getPosition(), this.owner._rotationRadiansX);
        }
    },
    prestoreState : function (new_state) {
        this.owner.state_change_flag = 1;
        this.futureState = new_state;
    },
    revertToPreviousState : function () {
        var _new_state = this.previousState;
        this.previousState = this.currentState;
        this.currentState = _new_state;
        this.futureState  = _new_state;
        //翻转的时候去掉中断状态
        if (1 == this.owner.interrupt) {
            this.owner.interrupt = 0;
        }
        return this.previousTarget;
    },
    getNextTarget : function () {
        if (0 < this.path_queue.length) {
            return this.path_queue.pop();
        }
        var _post = this.futureState.getNextTarget();
        if (null === _post) {
            return _post;
        }
        var _t = tkAI.collide.applyCarport(this.owner, _post);
        //TODO 先屏蔽掉寻路
        return _t;
        //开始寻路
        var _finder = new tkAI.aStar();
        var _path   = _finder.searching(this.owner.getOrigin(), _t);
        if (false === _path) {
            if (cc.COCOS2D_DEBUG) {
                console.log('走不到');
            }
            return null;
        }
        this.path_queue = _path;
        if (cc.COCOS2D_DEBUG) {
            if (this.owner._parent) {
                for(var i = 0; i < this.path_queue.length; i++) {
                    var pp = new tkTools.circle(4);
                    this.owner._parent.addChild(pp, 999993, 'v_i' + i);
                    pp.setPosition(this.path_queue[i]);
                }
            }
        }
        return this.path_queue.pop();
    }
});