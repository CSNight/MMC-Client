function validateForm() {
    var user = $("#username").val();
    var pwd = $("#pwd").val();
    var code = $("#code").val();
    var rest_login = new RestQueryAjax(login_callback);
    var data = {
        username: user,
        pwd: pwd,
        code: code
    };
    rest_login.login_REST(data);
}

$(document).ready(function () {
    getCheckImg();
    if (getCookie('user') && getCookie('pwd')) {
        $("#username").val(getCookie('user'));
        $("#pwd").val(getCookie('pwd'));
        $('#remember').prop('checked', true);
    }
    $('#remember').click(function () {
        if ($('#remember').prop('checked')) {
            setCookie('user', $("#username").val(), 1); //保存帐号到cookie，有效期1天
            setCookie('pwd', $("#pwd").val(), 1); //保存密码到cookie，有效期1天
        } else {
            delCookie('user');
            delCookie('pswd');
        }
    });
    $(document).keydown(function (event) {
        var e = event || window.event || arguments.callee.caller.arguments[0];
        if (e && e.keyCode == 13) {
            $('#submit').click()
        }
    });
});


//设置cookie
function setCookie(name, value, day) {
    var date = new Date();
    date.setDate(date.getDate() + day);
    document.cookie = name + '=' + value + ';expires=' + date;
}

//获取cookie
function getCookie(name) {
    var reg = RegExp(name + '=([^;]+)');
    var arr = document.cookie.match(reg);
    if (arr) {
        return arr[1];
    } else {
        return '';
    }
}

//删除cookie
function delCookie(name) {
    setCookie(name, null, -1);
}

function login_callback(res) {

}

function getCheckImg() {
    $("#code_img").attr('src', UrlConfig.getBaseURI() + 'user/verify?w=100&h=36');
    $("#code_img").click(
        function () {
            var time_now = new Date().getTime();
            $("#code_img").attr(
                'src',
                UrlConfig.getBaseURI() + 'user/verify?w=100&h=36&d=' + time_now);
        });
}

function customCube(element) {
    var sides = ['top', 'left', 'right'];

    function toggle(cell, func, timeout) {
        var side = cell.data("side");
        var id = cell.data("id");
        var array = Array(window["a_" + side]);
        setTimeout(function () {
            if (func === 'on') {
                cell.addClass("light");
                array.push(id);
            } else {
                cell.removeClass("light");
                array.splice(array.indexOf(id), 1);
            }
        }, timeout);
    }

    var t = 1;
    $.each(sides, function () {
        for (var i = 1; i <= 8; i++) {
            var array = Array(window["a_" + this]);
            var id, timeout = Metro.utils.random(100, 500), cell;
            do {
                id = Metro.utils.random(1, 64);
            } while (array.indexOf(id) > -1);

            cell = $(element).find("." + this + "-side .cell-id-" + id);

            toggle(cell, 'on', 100 * t);
            toggle(cell, 'off', 200 * t);
            t++;
        }
    });

    setTimeout(function () {
        customCube(element);
    }, 2000);
}