tk.Player = tk.Tank.extend({
    id    : 'player',
    hp    : 200,
    grade : 100,
    ctor:function () {
        this._super({velocity : 3, view_radius : 240, fire_radius : 220}, s_tank1);
    },
    update : function () {
        if (!this.active) {
            return;
        }
        this._super();
    },
    getOrigin : function () {
        return this.getPosition();
    }
});

tk.Player.create = function (post) {
    var sprite = new tk.Player();
    sprite.setPosition(post);
    sprite.fsm.init(new tkState.Rest());
    return sprite;
};