//智商比很低，不会警戒，不会还手，不会逃跑，血牛
tk.b1 = tk.Robot.extend({
    hp : 120,
    intelligence : 35,
    ctor:function (state) {
        this._super(state, s_tank6);
    },
});

tk.b1.create = function (state, post) {
    var sprite = new tk.b1(state);
    sprite.setPosition(post);
    sprite.setBirthPlace(post);
    return sprite;
};

//智商比较低，会警戒，不会还手，不会逃跑
tk.b2 = tk.Robot.extend({
    hp : 120,
    intelligence : 45,
    ctor:function (state) {
        this._super(state, s_tank6);
    },
});

tk.b2.create = function (state, post) {
    var sprite = new tk.b2(state);
    sprite.setPosition(post);
    sprite.setBirthPlace(post);
    return sprite;
};

//智商比较低，会警戒，不会还手，不会逃跑
tk.b3 = tk.Robot.extend({
    hp : 220,
    intelligence : 75,
    ctor:function (state) {
        this._super(state, s_tank2);
    },
});

tk.b3.create = function (state, post) {
    var sprite = new tk.b3(state);
    sprite.setPosition(post);
    sprite.setBirthPlace(post);
    return sprite;
};

//最厉害的黑坦克
tk.b4 = tk.Robot.extend({
    hp : 3200,
    velocity : 3,
    intelligence : 100,
    view_radius : 500,
    fire_radius : 200,
    ctor:function (state) {
        this._super(state, s_tank4);
    },
});

tk.b4.create = function (state, post) {
    var sprite = new tk.b4(state);
    sprite.setPosition(post);
    sprite.setBirthPlace(post);
    return sprite;
};