function validateForm() {
    var user = $("#username").val();
    var pwd = $("#pwd").val();
    var code = $("#code").val();
}

$(document).ready(function(){

});

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