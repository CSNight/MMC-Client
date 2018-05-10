define(function (require) {
    var uid, role;
    var init = function () {
        uid = getQueryString('uid');
        role = getQueryString('role');
        $('#userrole').html($('#userrole').html().replace('User', role));
        $('#userrole').attr('name', uid);
        $('#logout').click(logout_func);
        setHtmlFrame();
        get_user_tree();
    };
    var setHtmlFrame = function () {
        var html = '<div class="d-flex pt-2"><div class="pos-relative">';
        html += '<button class="button"><span class="mif-tree"></span> CreateTree</button> ';
        html += '<button class="button"><span class="mif-plus"></span> AddNode</button> ';
        html += '<button class="button"><span class="mif-cog"></span> ModifyNode</button> ';
        html += '<button class="button"><span class="mif-cross"></span> DeleteNode</button> ';
        html += '<button class="button"><span class="mif-upload"></span> UploadFile</button> ';
        html += '<button class="button"><span class="mif-spinner4"></span> Refresh</button> ';
        html += '</div></div>';
        html += '<div class=\'place-left mw-25 h-100 pt-2 user_tree\'></div>';
        html += '<div class=\'place-right mw-75 h-100 pt-2\'></div>';
        $('.navview-content').html(html);
        tool_status('all', true);
        $('.mif-spinner4').parent().click(get_user_tree);
        $('.mif-tree').parent().click(create_user_tree);
        $('.mif-plus').parent().click(function () {
            open_dialog('addnode');
        });
        $('.mif-cross').parent().click(del_tree_node);
    };
    var logout_func = function () {
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
    };
    var create_user_tree = function () {
        $('.user_tree').html('');
        var rest_tree = new RestQueryAjax(createtree_callback);
        var data = {
            "uid": uid
        };
        rest_tree.create_tree_REST(data);

        function createtree_callback(res) {
            if (res.response.status == 200) {
                tool_status('all', false);
                tool_status('mif-tree', true);
            } else if (res.response.status == 102) {
                tool_status('all', true);
                tool_status('mif-tree', false);
            } else if (res.response.status == 501) {
                logout_func();
            }
        }
    };
    var get_user_tree = function () {
        $('.user_tree').html('');
        var rest_tree = new RestQueryAjax(gettree_callback);
        var data = {
            "uid": uid
        };
        rest_tree.get_tree_REST(data);

        function gettree_callback(res) {
            if (res.response.status == 200) {
                tool_status('all', false);
                tool_status('mif-tree', true);
            } else if (res.response.status == 102) {
                tool_status('all', true);
                tool_status('mif-tree', false);
            } else if (res.response.status == 501) {
                logout_func();
            }
        }
    };
    var add_tree_node = function (pid, name, icon) {
        var rest_node = new RestQueryAjax(addnode_callback);
        var data = {
            "uid": uid,
            "pid": pid,
            "name": name,
            "icon": icon == "" ? 'mif-folder' : icon
        };
        rest_node.add_node_REST(data);

        function addnode_callback(res) {
            if (res.response.status == 200) {

            }
        }
    };
    var del_tree_node = function (sid) {
        var rest_node = new RestQueryAjax(delnode_callback);
        var data = {
            "uid": uid,
            "sid": sid
        };
        rest_node.del_node_REST(data);

        function delnode_callback(res) {
            if (res.response.status == 200) {

            }
        }
    };

    function open_dialog(dia_type) {
        var html_content = "";
        var title = "";
        if (dia_type == "addnode") {
            html_content = "<div><input data-prepend='<a>Node Name:</a>' data-role=\"input\" data-clear-button=\"true\" type=\"text\">";
            html_content += "<input data-prepend='<a>Icon:</a>' data-role=\"input\" data-clear-button=\"true\" type=\"c\">";
            html_content += "</div>";
            title = "Add New Node";
        }
        Metro.dialog.create({
            title: title,
            content: html_content,
            width: 300,
            actions: [
                {
                    caption: "<span class='mif-checkmark'></span> OK",
                    cls: "js-dialog-close alert",
                    onclick: function () {
                        alert("You clicked Agree action");
                    }
                },
                {
                    caption: "<span class='mif-cross'></span> Cancel",
                    cls: "js-dialog-close",
                    onclick: function () {
                        alert("You clicked Disagree action");
                    }
                }
            ],
            onClose: function (e) {

            },
            onOpen: function (e) {

            }
        });
    }

    function buildIconPanel() {
        var rest_icon = new RestQueryAjax(icons_callback);
        rest_icon.get_icon_REST(data);

        function icons_callback(res) {
            if (res.response.status == 200) {

            }
        }
    }

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

    function tool_status(able, status) {
        if (able == 'all') {
            $('.mif-spinner4').parent().attr("disabled", status);
            $('.mif-tree').parent().attr("disabled", status);
            $('.mif-cog').parent().attr("disabled", status);
            $('.mif-upload').parent().attr("disabled", status);
            $('.mif-cross').parent().attr("disabled", status);
            $('.mif-plus').parent().attr("disabled", status);
        } else {
            $('.' + able).parent().attr("disabled", status);
        }
    }

    return {
        id: uid,
        init: init,
        get_tree: get_user_tree,
        logout: logout_func,
        setFrame: setHtmlFrame
    }
});


