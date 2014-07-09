var tkAI = {};
tkAI.collide = {
    STOP_LIMIT : 5,
    //检测触角，如果返回null表示至少有已返触角为伸出
    explore : function (a, b) {
        var min_length = a.tentacles.length;
        if (b.tentacles.length < min_length) {
            min_length = b.tentacles.length;
        }
        if (0 == min_length) {
            return null;
        }
        return tkUtil.collideCheck(a.tentacles[min_length - 1], a.getSize(), b.tentacles[min_length - 1], b.getSize()) ? min_length : 0;
    },
    //检测真身是否碰撞
    detection : function (a, b) {
        var postA = {
            vertices : a.vertices,
            radian   : a._rotationRadiansX
        };
        var postB = {
            vertices : b.vertices,
            radian   : b._rotationRadiansX
        };
        return tkUtil.collideCheck(postA, a.getSize(), postB, b.getSize());
    },
    //碰撞避免，在触角有接触时开始调用
    avoid : function (a, b, step) {
        var _state = a.getState();
        if ('dodge' == _state.name && b.id == _state.goal.id) {
            //正在让行
            return
        }
        //a让b
        //转换坐标系
        var _step_point    = a.tentacles[step - 1],
            _collide_point = b.tentacles[step - 1],
            _p             = _step_point.point,
            _r             = _step_point.radian,
            _h             = a.h,
            post           = a.localWorld(_collide_point.point, _collide_point.radian, _p, _r),
            _new_post      = post.post,
            _new_target;
        //TODO 此处的躲闪精度还可以再调整得精确一些。
        //TODO 注意障碍物
        //在右边，往左边躲
        if (_new_post.x > 0) {
            _r = _r - tkUtil.halfPI;
        }
        //在左边，往右边躲
        else {
            _r = _r + tkUtil.halfPI;
        }
        _offset     = tkUtil.getOffset(_r);
        _new_target = cc.p(_p.x + _h * _offset.x, _p.y + _h * _offset.y);
        if (this.STOP_LIMIT > step) {
            a.getFSM().changeState(new tkState.Dodge(_new_target, b));
        }
        else {
            a.getFSM().changeState(new tkState.Arrive(_new_target));
        }
        a.interrupt = 1;
    },
    //碰撞调解 a让b
    mediate : function (a, b) {
        var _state = a.getState();
        if ('dodge' == _state.name) {
            //正在让行
            if (5 < _state.counter) {
                //已经尝试过5次了，不管它
                //TODO 鸵鸟策略？
                console.log(a.id + ':不管了');
                _state.getNextTarget();
                return;
            }
            if (b.id == _state.goal.id && 0 != b.stoped) {
                //正在让行
                //b.stoped = 1;
                console.log(a.id + ':已经做了');
                return
            }
        }
        //a让b
        //转换坐标系
        var _p             = a.getPosition(),
            _r             = a._rotationRadiansX,
            _h             = a.h,
            post           = a.localWorld(b.getPosition(), b._rotationRadiansX, _p, _r),
            _new_post      = post.post,
            _new_target;
        //TODO 此处的躲闪精度还可以再调整得精确一些。
        //在右边，往左边躲
        if (_new_post.x > 0) {
            _r = _r - tkUtil.halfPI;
        }
        //在左边，往右边躲
        else {
            _r = _r + tkUtil.halfPI;
        }
        _offset     = tkUtil.getOffset(_r);
        _new_target = cc.p(_p.x + _h * _offset.x, _p.y + _h * _offset.y);
        if (cc.COCOS2D_DEBUG) {
            //console.log('开始预测步长' + min_length);
            if (!this.inTest2) {
                this.v_v = new tkTools.circle(10);
                a._parent.addChild(this.v_v, 999993, 'v_v' + 0);
                
                this.v_v_1 = new tkTools.circle(8);
                a._parent.addChild(this.v_v_1, 999993, 'v_v_1' + 0);
                
                this.v_v_2 = new tkTools.circle(6);
                a._parent.addChild(this.v_v_2, 999993, 'v_v_2' + 0);
                
                this.v_v_3 = new tkTools.circle(4);
                a._parent.addChild(this.v_v_3, 999993, 'v_v_3' + 0);
                
                this.v_v_4 = new tkTools.circle(3);
                a._parent.addChild(this.v_v_4, 999993, 'v_v_4' + 0);
                
                this.v_v_5 = new tkTools.circle(2);
                a._parent.addChild(this.v_v_5, 999993, 'v_v_5' + 0);
                
                this.v_v_6 = new tkTools.circle(1);
                a._parent.addChild(this.v_v_6, 999993, 'v_v_6' + 0);
                this.inTest2 = 1;
            }
            this.v_v.setPosition(_p);
            this.v_v_1.setPosition(_p);
            this.v_v_2.setPosition(_p);
            this.v_v_3.setPosition(_new_target);
            this.v_v_4.setPosition(_new_target);
            this.v_v_5.setPosition(_new_target);
            this.v_v_6.setPosition(_new_target);
            var director = cc.Director.getInstance();
            //director.pause();
        }
        if ('dodge' == _state.name) {
            _state.changeGoal(_new_target, b);
        }
        else {
            a.getFSM().changeState(new tkState.Dodge(_new_target, b));
            a.interrupt = 1;
        }
    },
    //判断炮弹是否击中tank
    shootCheck : function (a, b) {
        var postA = {
                vertices : a.vertices,
                radian   : a._rotationRadiansX
            };
        var postB = {
                vertices : b.vertices,
                radian   : b._rotationRadiansX
            };
        for (var i in a.bullets) {
            var _b = a.bullets[i];
            if (tkUtil.pointCollideCheck(_b.getPosition(), postB, b.getSize())) {
                b.hurt(_b);
                _b.destroy();
                break;
            }
        }
        for (var i in b.bullets) {
            var _b = b.bullets[i];
            if (tkUtil.pointCollideCheck(_b.getPosition(), postA, a.getSize())) {
                a.hurt(_b);
                _b.destroy();
                break;
            }
        }
        
    },
    //申请车位，在设置正式的target时调用。
    applyCarport : function (unit, post, dir) {
        var unit_post = unit.getPosition();
        for(var i = 0; i < tk.GW.robots.length; i++) {
            var _item = tk.GW.robots[i];
            if (!_item.isVisible() || _item.id == unit.id) {
                continue;
            }
            var _t = _item.getTarget();
            var _offsetX = post.x - _t.x;
            var _w = unit._contentSize.width;
            if (_offsetX > _w || _offsetX < -_w) {
                continue;
            }
            var _offsetY = post.y - _t.y;
            var _h = unit._contentSize.height;
            if (_offsetY > _h || _offsetY < -_h) {
                continue;
            }
/*            var unit_post = unit.getPosition();
            var offsetY = unit_post.y - post.y;
            var offsetX = unit_post.x - post.x;
            var length  = cc.pDistance(unit_post, post);
            var sin = offsetY/length;
            var cos = offsetX/length;*/
            //可能有车位冲突
            if (dir) {
                //向左寻找
                if (1 == dir) {
                    post.x = _t.x - _w * 1.2;
                }
                else {
                    post.x = _t.x + _w * 1.2;
                }
            }
            else {
                if (_t.x >= unit_post.x) {
                    dir = 1;
                    post.x = post.x - _w * 1.2;
                }
                else {
                    dir = 2;
                    post.x = post.x + _w * 1.2;
                }
            }
            return this.applyCarport(unit, post, dir);
        }
        //开启寻路
        
        return post;
    },
    avoidBlock : function (blocks, tank) {
        var _state = tank.getState();
        var _angle_increment;
        var local_post;
        var j = tank.blocked;
        var _block = blocks[j];
        var _dist = _block.s + tank.h * 2/3;
        var _len = tank.tentacles.length;
        if ('round' == _state.name) {
            //如果正在躲避此障碍物，则直接跳过。
            if (j == _state.block_id) {
                return;
            }
            else {
                //保持和前一个障碍物同样的躲避方向。
                _angle_increment = _state.dirt;
                local_post = tank.localWorld(_block.p, 0, tank.getPosition(), tank._rotationRadiansX);
            }
        }
        else {
            local_post = tank.localWorld(_block.p, 0, tank.getPosition(), tank._rotationRadiansX);
            if (0 < local_post.post.x) {
                //左转  -
                //90 + 15°
                _angle_increment = -0.5;
            }
            else {
                //右转 +
                //90 - 15°
                _angle_increment = 0.5;
            }
        }
        //找点
        var _angle     = tkUtil.getSafeRadian(_angle_increment + cc.pToAngle(local_post.post));
        var _offset    = tkUtil.getOffset(_angle);
        var new_post   = cc.pSub(local_post.post, {x : _dist * _offset.y, y : _dist * _offset.x});
        var _sin       = Math.sin(-tank._rotationRadiansX);
        var _cos       = Math.cos(-tank._rotationRadiansX);
        new_post = cc.p(new_post.x * _cos - new_post.y * _sin, new_post.x * _sin + new_post.y * _cos);
        new_post = cc.pAdd(new_post, tank.getPosition());
        if (this.STOP_LIMIT > _len) {
            tank.getFSM().changeState(new tkState.Round(new_post, j, _angle_increment, 1));
        }
        else {
            tank.getFSM().changeState(new tkState.Round(new_post, j, _angle_increment, 0));
        }
        tank.interrupt = 1;
        if (cc.COCOS2D_DEBUG) {
            //console.log('开始预测步长' + min_length);
            if (!this.inTest3) {
                this.v_v_v = new tkTools.solidCircle(6);
                tank._parent.addChild(this.v_v_v, 9999938, 'v_v_v' + 0);
                this.inTest3 = 1;
            }
            this.v_v_v.setPosition(new_post);
            var director = cc.Director.getInstance();
            //director.pause();
        }
    },
    //障碍物碰撞检测，防止撞墙
    checkBlock : function (blocks, tank) {
        for (var j = 0; j < blocks.length; j++) {
            var _block = blocks[j], _len = tank.tentacles.length, _p;
            if (0 < _len) {
                _p = tank.tentacles[_len - 1].point;
            }
            else {
                _p = tank.getPosition();
            }
            //从障碍物中心，到tank自身的长度。作为检测碰撞是否发生的标准
            var _dist2 = _block.s + tank.h/2;
            if (_dist2 * _dist2 > cc.pDistanceSQ(_p, _block.p)) {
                tank.blocked = j;
                return;
            }
        }
        return;
    }
};
