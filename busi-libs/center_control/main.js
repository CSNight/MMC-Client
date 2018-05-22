define(function (require) {
    var user_tree = require('busi-libs/center_control/center_user');
    var col_manage = require('busi-libs/center_control/col_manage');
    col_manage.init();
    user_tree.init();

});