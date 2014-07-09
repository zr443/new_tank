tkAI.aStar = {
    open       : {},
    open_chain : {},
    min_open   : null,
    closed     : {},
    searching : function (origin, goal) {
        if (!this.map) {
            this.map = tk.GW.getMap();
        }
        var _map   = this.map,
            _next  = {},
            _start = _map.getMapId(origin);
        this.end   = _map.getMapId(goal);
        /**
         * 如果end是障碍物，直接返回
         */
        if (_map.checkIsBarrier(this.end)) {
            if (cc.COCOS2D_DEBUG) {
                console.log('no no');
            }
            return false;
        }
        _next.item  = this.getUnit(_start.x, _start.y);
        while (_next) {
            //寻路成功
            if (this.explore(_next.item)) {
                return this._getPath(_next.item);
            }
            //从open表里取最小的一个
            _next = this._popOpenTable();
        }
        return false;
    },
    explore : function (tile) {
        this.closed[tile.x + '_' + tile.y] = tile;
        if (0 == tile.h) {
            return true;
            //抵达终点
        }
        //从八个方向开始延伸
        //前后左右
        var x, y, unit, weight, dir = 0;
        for(var i = 0; i < 8; i++) {
            if (0 < i && 4 > i) {
                x = tile.x + 1;
                dir = 1;
            }
            else if (4 < i && 8 > i) {
                x = tile.x - 1;
                dir = 2;
            }
            else {
                x = tile.x;
            }
            if (2 > i || i == 8) {
                y = tile.y + 1;
                dir = dir | 4;
            }
            else if (2 < i && 6 > i) {
                y = tile.y - 1;
                dir = dir | 8;
            }
            else {
                y = tile.y;
            }
            if (1 == i%2) {
                weight = 14;
            }
            else {
                weight = 10;
            }
            id = x + '_' + y;
            if (!this.closed[id] && !this.map.checkIsBarrier(cc.p(x, y))) {
                unit = this.getUnit(x, y, tile, weight, dir);
                unit.id = id;
                if (this.open[id]) {
                    //如果已经在open表里了。
                    if (this.open[id].f > unit.f) {
                        this.open[id].item = unit;
                        this.open[id].f    = unit.f;
                        continue;
                    }
                }
                this.open[id] = this._pushOpenTable(unit);
            }
        }
        return false;
    },
    
    getUnit : function (x, y, parent, increment, dir) {
        var _end = this.end,
            _h   = (Math.abs(_end.x - x) + Math.abs(_end.y - y)) * 10;
        var _g = parent ? parent.g + increment : 0,
            _f = _g + _h;
        return {
            x      : x,
            y      : y,
            f      : _f,
            h      : _h,
            g      : _g,
            dir    : dir,
            parent : parent || null
        };
    },
    _pushOpenTable : function (item) {
        var _unit = {
                item : item,
                f    : item.f,
                prev : null,
                next : null
            };
        if (!this.open_chain) {
            this.open_chain = _unit;
        }
        else {
            var u = this.open_chain;
            //如果游标节点小于新来的，则持续往后搜索
            while (true) {
                if (u.f < _unit.f) {
                    if (!u.next) {
                        u.next = _unit;
                        _unit.prev = u;
                        return _unit;
                    }
                    u = u.next;
                }
                else {
                    if (u.prev) {
                        _unit.prev = u.prev;
                        u.prev.next = _unit;
                    }
                    else {
                        this.open_chain = _unit;
                    }
                    _unit.next = u;
                    u.prev = _unit;
                    return _unit;
                }
            }
        }
    },
    _popOpenTable : function () {
        if (!this.open_chain) {
            return null;
        }
        var unit = this.open_chain;
        unit.next.prev = null;
        this.open_chain = unit.next;
        unit.next = null;
        delete this.open[unit.item.id];
        return unit;
    },
    _getPath : function (_item) {
        var t = [], dir = null;
        while (_item) {
            if (dir !== _item.dir) {
                t.push(this.map.getPost(cc.p(_item.x, _item.y)));
            }
            dir = _item.dir;
            _item = _item.parent;
        }
        return t;
    }
};
