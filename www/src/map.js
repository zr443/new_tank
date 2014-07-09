tk.Map = cc.Sprite.extend({
    max_x : 10,
    max_y : 6,
    tile_width : 100,
    tile_height : 100,
    ctor:function () {
        this._super();
        this.init('bg');
        this.width  = this.max_x * this.tile_width;
        this.height = this.max_y * this.tile_height;
        this.blocks = [];
    },
    onEnter : function () {
        //TODO 先关闭障碍物
        if (cc.COCOS2D_DEBUG) {
            for (var i = 0; i < this.blocks.length; i ++) {
                var block = new tkTools.solidCircle2(this.blocks[i].s);
                this._parent.addChild(block, 3, 'block_' + i);
                block.setPosition(this.blocks[i].p);
            }
        }
    },
    getMapId : function (post) {
        return cc.p(Math.floor(post.x/this.tile_width), Math.floor(post.y/this.tile_height));
    },
    //检测地图上的tile是否有障碍物
    checkIsBarrier : function (tile) {
        var _p = this.getPost(tile);
        for (var i = 0; i < this.blocks.length; i++) {
            var _b = this.blocks[i];
            if (_b.s * _b.s >= cc.pDistanceSQ(_p, _b.p)) {
                return true;
            }
        }
        return false;
    },
    getPost : function (coord) {
        return cc.p((coord.x + 0.5) * this.tile_width, (coord.y + 0.5) * this.tile_height);
    }
});
tk.Map.create = function () {
    var sprite = new tk.Map(),
        zero   = cc.PointZero();
    sprite.setAnchorPoint(zero);
    sprite.setPosition(zero);
    tk.GW.setMap(sprite);
    return sprite;
};