var uid, role;
$(function () {
    uid = getQueryString('uid');
    role = getQueryString('role');
    $('#userrole').html($('#userrole').html().replace('User', role));
    $('#userrole').attr('name', uid);
});

// 获取路径传参
function getQueryString(name) {
    try {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) {
            return decodeURI(r[2]);
        }
        return null;
    } catch (err) {
        return null;
    }
}

function logout() {
    var rest_logout = new RestQueryAjax(logout_callback);
    var data = {
        uid: uid
    };
    rest_logout.logout_REST(data);

    function logout_callback(res) {
        if (res.response.status == 200 || res.response.status == 501) {
            window.location.href = "login.html"
        }
    }
}

function get_user_tree(id) {
    $('.user_tree').html('');
    var rest_tree = new RestQueryAjax(gettree_callback);
    var data = {
        uid: uid
    };
    rest_tree.get_tree_REST(data);

    function gettree_callback(res) {
        if (res.response.status == 200) {
            $('.mif-tree').parent().attr("disabled", true);
        } else if (res.response.status == 102) {
            $('.mif-tree').parent().attr("disabled", false);
        } else if (res.response.status == 501) {
            logout();
        }
    }
}

