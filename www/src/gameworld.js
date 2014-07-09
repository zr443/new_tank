/**
 * gameworld
 * 上帝，掌管mainloop(游戏规则)，地图，负责sprite的出生与回收
 * 通过A/B阵营的score来决定调整兵力投入
 * 层级次序：
 * 1 地图
 * 2 Block
 * 200 click特效
 * 980 bullet
 * 990 玩家
 * 991 robot
 * 
 */
tk.GW = {
    width         : 0,
    height        : 0,
    player        : null,
    map           : null,
    layer         : null,
    unit_count    : 0,
    robots        : [],
    collide_group : [null],
    factionA      : {},
    a_score       : 0,
    factionB      : {},
    b_score       : 0,
    setLayer : function (layer) {
        this.layer = layer;
    },
    getLayer : function () {
        return this.layer;
    },
    setMap : function (map) {
        this.map = map;
    },
    getMap : function () {
        return this.map;
    },
    begin : function () {
    },
    addPlayer : function () {
        if (!this.player) {
            var post = this.getBirthPoint();
            var player = tk.Player.create(post);
            player.faction = 1;
            this.layer.addChild(player, 990, 'player');
            this.factionA.player = player;
            player.getFSM().init(new tkState.Arrive(cc.p(post.x + 10, post.y + 100)));
            this.player = player;
            this.unit_count++;
            this.a_score += player.grade;
        }
        return this.player;
    },
    addRobotA : function () {
        var _post = this.getBirthPoint('A');
        var state = new tkState.Patrol(cc.p(900, 500), _post);
        var _robot = tk.Robot.create(state, s_tank1, _post);
        var _id = 'tank_factionA_' + this.unit_count;
        _robot.setId(_id);
        _robot.faction = 1;
        this.factionA[_id] = _robot;
        this.robots.push(_robot);
        this.unit_count++;
        this.layer.addChild(_robot, 991, _id);
    },
    addRobotB : function () {
        var _post = this.getBirthPoint('B');
        //var state = new tkState.Patrol(this.getBirthPoint('A'), _post);
        var state = new tkState.Arrive(cc.p(100, 600), cc.p(100, 600));
        var _robot = tk.b1.create(state, _post);
        var _id = 'tank_factionB_' + this.unit_count;
        _robot.setId(_id);
        _robot.faction = 2;
        this.factionB[_id] = _robot;
        this.robots.push(_robot);
        this.unit_count++;
        this.layer.addChild(_robot, 991, _id);
    },
    //很笨的B
    addRobotC : function () {
        var _post = this.getBirthPoint('B');
        //var state = new tkState.Patrol(this.getBirthPoint('A'), _post);
        var state = new tkState.Arrive(cc.p(500, 300));
        var _robot = tk.b1.create(state, _post);
        var _id = 'tank_factionB_' + this.unit_count;
        _robot.setId(_id);
        _robot.faction = 2;
        this.factionB[_id] = _robot;
        this.robots.push(_robot);
        this.unit_count++;
        this.layer.addChild(_robot, 991, _id);
    },
    //比较笨的B
    addRobotD : function () {
        var _post = this.getBirthPoint('B');
        var state = new tkState.Arrive(cc.p(500, 300));
        var _robot = tk.b2.create(state, _post);
        var _id = 'tank_factionB_' + this.unit_count;
        _robot.setId(_id);
        _robot.faction = 2;
        this.factionB[_id] = _robot;
        this.robots.push(_robot);
        this.unit_count++;
        this.layer.addChild(_robot, 991, _id);
    },
    //正常的B
    addRobotE : function () {
        var _post = this.getBirthPoint('B');
        var state = new tkState.Patrol(cc.p(200, 500), cc.p(500, 300), cc.p(800, 500));
        var _robot = tk.b3.create(state, _post);
        var _id = 'tank_factionB_' + this.unit_count;
        _robot.setId(_id);
        _robot.faction = 2;
        this.factionB[_id] = _robot;
        this.robots.push(_robot);
        this.unit_count++;
        this.layer.addChild(_robot, 991, _id);
    },
    //正常的F
    addRobotF : function () {
        var _post = cc.p(900, 640);
        var state = new tkState.Arrive(cc.p(_post.x - 10, this.map.height - 40));
        var _robot = tk.b4.create(state, _post);
        var _id = 'tank_factionB_' + this.unit_count;
        _robot.setId(_id);
        _robot.faction = 2;
        this.factionB[_id] = _robot;
        this.robots.push(_robot);
        this.unit_count++;
        this.layer.addChild(_robot, 991, _id);
    },
    addBullet : function (bullet) {
        var _id = 'bullet_' + this.unit_count;
        bullet.setId(_id);
        this.unit_count++;
        this.layer.addChild(bullet, 980, _id);
    },
    setSize : function (width, height) {
        this.width  = width;
        this.height = height;
    },
    //出生点
    getBirthPoint : function (faction) {
        if ('A' == faction) {
            if (!this.birthplaceA || 0 == this.birthplaceA.length) {
                this.birthplaceA = [1, 2, 3, 4, 5, 6, 7, 8];
            }
            var i = Math.floor(Math.random() * this.birthplaceA.length);
            this.birthplaceA.splice(i, 1);
            return cc.p(50 * i, -40);
        }
        else if ('B' == faction) {
            if (!this.birthplaceB || 0 == this.birthplaceB.length) {
                this.birthplaceB = [1, 2, 3, 4, 5, 6, 7, 8];
            }
            var i = Math.floor(Math.random() * this.birthplaceB.length);
            this.birthplaceB.splice(i, 1);
            return cc.p(this.width - 50 * i, this.map.height + 40);
        }
        else {
            return cc.p(200, -40);
        }
    },
    //给robot指定ai程度和等级，分配特性
    aiAllot : function () {
        
    },
    //检查比分，调度资源
    adjust : function () {
        
    },
    //回收挂了的tank
    //从阵营数组，以及robots数组中剔除，
    //删除子弹，以及血条
    clean  : function (bin) {
        for (var i = 0; i < bin.length; i++) {
            var _tank = this.robots[bin[i]];
            if (1 == _tank.faction) {
                delete this.factionA[_tank.id];
            }
            else {
                delete this.factionB[_tank.id];
            }
            _tank.removeFromParent();
            this.robots.splice(bin[i], 1);
        }
    },
    update : function () {
        var _bin = [], _conflict_list = [];
        //TODO 检测位置，待商量  检查player障碍物碰撞
        if (this.player && this.player.active) {
            this.player.stoped = 0;
            tkAI.collide.checkBlock(this.map.blocks, this.player);
        }
        else {
            this.player = null;
        }
        for (var i = 0; i < this.robots.length; i++) {
            var _a = this.robots[i];
            if (!_a.active) {
                //等待回收
                _bin.push(i);
                continue;
            }
            
            var conflict = false;
            var step     = 0;
            var _a_post  = _a.getPosition();
            for (var j = i + 1; j < this.robots.length; j++) {
                //碰撞检测和避免
                var _b = this.robots[j];
                if (!_b.isVisible()) {
                    continue;
                }
                var _b_post = _b.getPosition();
                //TODO 此处还可优化，否则进入碰撞检测的条件太早了。
                /*var _offsetX = _a_post.x - _b_post.x;
                if (_offsetX > _a.view_radius || _offsetX < -_a.view_radius) {
                    continue;
                }
                var _offsetY = _a_post.y - _b_post.y;
                if (_offsetY > _a.view_radius || _offsetY < -_a.view_radius) {
                    continue;
                }*/
                var _tentacle_legnth = _a.view_radius + _b.view_radius;
                var _distSQ          = cc.pDistanceSQ(_a_post, _b_post);
                var _tentacle_legnthSQ = _tentacle_legnth * _tentacle_legnth;
                if (_tentacle_legnthSQ <= _distSQ) {
                    //如果距离比两个人的触角相加还远，不存在碰撞
                    continue;
                }
                //检测子弹
                //TODO 此处应该用fire_radius来判断
                if (_a.faction != _b.faction) {
                    //不是同一阵营
                    tkAI.collide.shootCheck(_a, _b);
                    if (_distSQ <= _a.view_radiusSQ) {
                        _a.addEnemy(_b, _distSQ);
                    }
                    if (_distSQ <= _b.view_radiusSQ) {
                        _b.addEnemy(_a, _distSQ);
                    }
                }
                //b在a的视野内，开始用触角进行碰撞预测
                //如果未来会碰撞，把b加入冲突目标
                var _step = tkAI.collide.explore(_a, _b);
                if (null === _step) {
                    //开始检测真实碰撞
                    if (tkAI.collide.detection(_a, _b)) {
                        _a.collide = _b;
                        _b.collide = _a;
                        this.groupCollide(_a, _b);
                    }
                }
                else if (0 < _step && (!_a.conflict || _step < _a.conflict_step)) {
                    _a.conflict_step     = _step;
                    _a.conflict = _b;
                }
            }
            
            
            //开始检测玩家
            if (this.player) {
                var _tentacle_legnth = _a.view_radius + this.player.view_radius;
                var _tentacle_legnthSQ = _tentacle_legnth * _tentacle_legnth;
                if (_tentacle_legnthSQ > cc.pDistanceSQ(_a_post, this.player.getPosition())) {
                    _step = this.player.active && tkAI.collide.explore(_a, this.player);
                    if (null === _step) {
                        //开始检测真实碰撞
                        if (tkAI.collide.detection(_a, this.player)) {
                            _a.collide = this.player;
                            this.player.collide = _a;
                            this.groupCollide(_a, this.player);
                        }
                    }
                    else if (0 < _step && (!_a.conflict || _step < _a.conflict_step)) {
                        _a.conflict_step     = _step;
                        _a.conflict = this.player;
                    }
                    //检测玩家子弹
                    if (this.player.active && _a.faction != this.player.faction) {
                        //不是同一阵营
                        tkAI.collide.shootCheck(_a, this.player);
                        var _dis = cc.pDistanceSQ(_a.getPosition(), this.player.getPosition());
                        if (_dis <= _a.view_radiusSQ) {
                            _a.addEnemy(this.player, _dis);
                        }
                    }
                }
            }
            //检测障碍物碰撞。
            tkAI.collide.checkBlock(this.map.blocks, _a);
            //检测玩家结束
            if (!_a.collide && null !== _a.blocked) {
                tkAI.collide.avoidBlock(this.map.blocks, _a);
            }
            else if (_a.conflict) {
                _conflict_list.push(_a);
            }
            if (cc.COCOS2D_DEBUG) {
                /*
                if (conflict) {
                    //console.log(_a.id + '触角碰到了' + conflict.id);
                    //console.log(step);
                }
                if (collide) {
                    //console.log(_a.id + ':哎呀，撞到[' + collide.id + ']了');
                    //var director = cc.Director.getInstance();
                    //director.pause();
                }
                */
            }
        }
        //解决路径冲突
        for (var i = 0; i < _conflict_list.length; i++) {
            var _a = _conflict_list[i];
            if (!_a.conflict) {
                continue;
            }
            var _b = _a.conflict;
            //a有碰撞
            //理论上应该是b让a
            if (_a.collide_group_id) {
                //_b也有碰撞，不处理
                if (_b.collide_group_id) {
                    continue;
                }
                if (_b.conflict) {
                    //b也有冲突，且比a紧急
                    if (_b.conflict_step <= _a.conflict_step) {
                        continue;
                    }
                    _b.conflict = null;
                    _b.conflict_step = 0;
                }
                //b让a
                tkAI.collide.avoid(_b, _a, _a.conflict_step);
            }
            else {
                if (_b.collide_group_id) {
                    //a让b
                    tkAI.collide.avoid(_a, _b, _a.conflict_step);
                }
                else if (_b.conflict && _b.conflict_step <= _a.conflict_step) {
                    //a让b
                    tkAI.collide.avoid(_a, _b, _a.conflict_step);
                }
                else if (1 == _a.getState().is_resting || _a.grade > _b.grade) {
                    tkAI.collide.avoid(_b, _a, _a.conflict_step);
                }
                else {
                    tkAI.collide.avoid(_a, _b, _a.conflict_step);
                }
            }
        }
        
        for (var i = 0; i < this.collide_group.length; i++) {
            if (!this.collide_group[i]) {
                continue;
            }
            var _len = this.collide_group[i].length;
            //普通的2车碰撞
            if (2 == _len) {
                var _a = this.collide_group[i][0], _b = _a.collide;
                if (1 == _a.getState().is_resting || _a.grade > _b.grade) {
                    tkAI.collide.mediate(_b, _a);
                }
                else {
                    tkAI.collide.mediate(_a, _b);
                }
                continue;
            }
            var _min_collide = null;
            for (var j = 0; j < this.collide_group[i].length; j++) {
                var _a = this.collide_group[i][j];
                if (!_a.collide) {
                    _a.stoped;
                    continue;
                }
                if (1 == _a.collide_num) {
                    tkAI.collide.mediate(_a, _a.collide);
                    //_a.collide.collide = null;
                }
                else {
                    _a.stoped;
                }
                if (!_min_collide || _min_collide.collide_num > _a.collide_num) {
                    _min_collide = _a;
                }
            }
            if (1 < _min_collide.collide_num) {
                tkAI.collide.mediate(_min_collide, _min_collide.collide);
            }
        }
        if (this.player && !this.player.collide && null !== this.player.blocked) {
            tkAI.collide.avoidBlock(this.map.blocks, this.player);
        }
        this.clean(_bin);
        this.collide_group = [null];
        this.adjust();
    },
    /**
     * 将碰撞对象分组
     * @param a_
     * @param b_
     * @param group
     */
    groupCollide : function (_a, _b) {
        var _collide_group = this.collide_group;
        if (_a.collide_group_id) {
            if (_b.collide_group_id) {
                if (_b.collide_group_id != _a.collide_group_id) {
                    //合并两个collide_group
                    var _b_id = _b.collide_group_id;
                    for (var _len = 0; _len < _collide_group[_b_id].length; _len++) {
                        var _t = _collide_group[_b_id][_len];
                        _t.collide_group_id = _a.collide_group_id;
                        _collide_group[_a.collide_group_id].push(_t);
                    }
                    _collide_group[_b_id] = null;
                }
            }
            else {
                _b.collide_group_id = _a.collide_group_id;
                _collide_group[_a.collide_group_id].push(_b);
            }
        }
        else {
            if (_b.collide_group_id) {
                _a.collide_group_id = _b.collide_group_id;
                _collide_group[_b.collide_group_id].push(_a);
            }
            else {
                var _len = _collide_group.length;
                _a.collide_group_id = _len;
                _b.collide_group_id = _len;
                _collide_group[_len] = [_a, _b];
            }
        }
        _a.collide_num++;
        _b.collide_num++;
    }
};
