/**
 * 游戏运行的主窗口，主要负责地图的显示，事件监听和玩家状态指派。
 * 是游戏中所有sprite的parent
 */
tk.MainLayer = cc.Layer.extend({
    ctor:function () {
        this._super();
        //初始化
        //获取缩放比例
        var _view = cc.EGLView.getInstance();
        this.x_scale = _view.getScaleX();
        this.y_scale = _view.getScaleY();
        //添加地图
        this.addChild(tk.Map.create(), 1, 'map');
        var _winSize = cc.Director.getInstance().getWinSize();
        
        tk.GW.setLayer(this);
        tk.GW.setSize(_winSize.width, _winSize.height);
        tk.GW.begin();
        this.player = tk.GW.addPlayer();
        this.click_effect = new tkEffects.click();
        this.addChild(this.click_effect, 200, 'click');
        //事件监听
        if('mouse' in sys.capabilities) {
            this.setMouseEnabled(true);
        }
        else {
            cc.log("MOUSE Not supported");
        }
        if( 'keyboard' in sys.capabilities ) {
            this.setKeyboardEnabled(true);
        }
        else {
            cc.log("KEYBOARD Not supported");
        }
        this.isDrag = 0;
        this.scheduleUpdate();
    },
    onKeyUp:function(key) {
        //'w'继续,'s'暂停
        if (87 == key) {
            var director = cc.Director.getInstance();
            director.resume();
        }
        else if (83 == key) {
            var director = cc.Director.getInstance();
            director.pause();
        }
        //key 'A'
        else if (65 == key) {
            tk.GW.addRobotA();
        }
        //key 'B'
        else if (66 == key) {
            tk.GW.addRobotC();
        }
        //key 'C'
        else if (67 == key) {
            tk.GW.addRobotD();
        }
        //key 'D'
        else if (68 == key) {
            tk.GW.addRobotE();
        }
        //key 'E'
        else if (69 == key) {
            tk.GW.addRobotF();
        }
    },
    onMouseUp:function(event) {
        if (!this.isDrag && this.player && this.player.active) {
            var pos = event.getLocation();
            //offset为背景的位置偏移
            var offset = this.getPosition();
            var point = cc.p(pos.x/this.x_scale - offset.x, pos.y/this.y_scale - offset.y);
            //玩家永远在A阵营
            for (var i in tk.GW.factionB) {
                var b = tk.GW.factionB[i];
                var postB = {
                        vertices : b.vertices,
                        radian   : b._rotationRadiansX
                    };
                if (tkUtil.pointCollideCheck(point, postB, b.getSize())) {
                    this.player.getFSM().changeState(new tkState.Chase(b));
                    this.isDrag = 0;
                    return false;
                }
            }
            var blocks = tk.GW.getMap().blocks;
            for (var i = 0; i < blocks.length; i ++) {
                if (cc.pDistanceSQ(point, blocks[i].p) < blocks[i].s * blocks[i].s) {
                    return false;
                }
            }
            //var _path_list = tkAI.aStar.searching(this.player.getPosition(), point);
            //console.log(_path_list);
            this.player.getFSM().changeState(new tkState.Arrive(point));
            this.click_effect.reset(point);
        }
        this.isDrag = 0;
    },
    onTouchesMoved:function (touches, event) {
        var touch = touches[0];
        var delta = touch.getDelta();
        if (-2 < delta.x && 2 > delta.x && -2 < delta.y && 2 > delta.y) {
            return;
        }
        var diff = cc.pAdd(delta, this.getPosition());
        this.mapMove(diff);
    },
    onMouseDragged:function (event) {
        var delta = event.getDelta();
        if (-2 < delta.x && 2 > delta.x && -2 < delta.y && 2 > delta.y) {
            return;
        }
        this.isDrag = 1;
        var diff = cc.pAdd(delta, this.getPosition());
        this.mapMove(diff);
    },
    mapMove : function (diff) {
        if (cc.COCOS2D_DEBUG) {
            return this.setPosition(diff);
        }
        if (0 < diff.x) {
            diff.x = 0;
        }
        else if (0 > this.map_width + diff.x) {
            diff.x = -this.map_width;
        }
        if (0 < diff.y) {
            diff.y = 0;
        }
        else if (0 > this.map_height + diff.y) {
            diff.y = -this.map_height;
        }
        this.setPosition(diff);
    },
    /**
     * ctor 构造函数，在创建类的时候自动调用
     * init 初始化函数，在创建类之后手工调用，或在ctor函数里调用
     * onenter 在对象进入场景时调用，随着进入场景的次数，可能会有多次
     * draw 每一帧调用一次
     * If you update state variables inside the draw selector, the pause/resume won’t work as expected.
     * update 应该也是每帧一次的
     * If you draw something inside a scheduled selector, it can’t be transformed
     * update的顺序为，先更新sprite的update，再更新game的update
     * 
     */
    update : function () {
        tk.GW.update();
        //this.checkIsCollide();
    }
});

tk.gameScene = cc.Scene.extend({
    ctor:function () {
        this._super();
        var layer = new tk.MainLayer();
        this.addChild(layer);
    }
});

