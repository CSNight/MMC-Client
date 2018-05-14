define(function (require) {
    var uid, role, current_tree_id, _Tree;
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
        html += '</div></div><div class=\'place-left mw-25 h-100 pt-2 user_tree\'></div>';
        html += '<div class=\'place-right mw-75 h-100 pt-2\'></div>';
        $('.navview-content').html(html);
        tool_status('all', true);
        $('.mif-spinner4').parent().click(get_user_tree);
        $('.mif-tree').parent().click(create_user_tree);
        $('.mif-plus').parent().click(function () {
            open_dialog('add_node');
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
            if (res.response.status === 200 || res.response.status === 501) {
                window.location.href = "login.html"
            }
        }
    };
    var create_user_tree = function () {
        $('.user_tree').html('<ul data-role="treeview" id="_tree"></ul>');
        var rest_tree = new RestQueryAjax(createtree_callback);
        var data = {
            "uid": uid
        };
        rest_tree.create_tree_REST(data);

        function createtree_callback(res) {
            if (res.response.status === 200) {
                _Tree = $('#_tree').data('treeview');
                _Tree.addTo(null, {
                    caption: 'User Root',
                    icon: '<span class=\'mif-tree\'></span>',
                    html: "<a id='" + res.response.element.id + "'></a>"
                });
                _Tree.onNodeClick = node_click;
                tool_status('all', false);
                tool_status('mif-tree', true);
            } else if (res.response.status === 300) {
                tool_status('all', false);
                tool_status('mif-tree', true);
            } else if (res.response.status === 501) {
                logout_func();
            }
        }
    };
    var get_user_tree = function () {
        $('.user_tree').html('<ul data-role="treeview" data-select-node=\'true\' id="_tree"></ul>');
        var rest_tree = new RestQueryAjax(gettree_callback);
        var data = {
            "uid": uid
        };
        rest_tree.get_tree_REST(data);

        function gettree_callback(res) {
            if (res.response.status === 200) {
                _Tree = $('#_tree').data('treeview');
                _Tree.onNodeClick = node_click;
                add_node(res.response.element);
                tool_status('all', false);
                tool_status('mif-tree', true);
            } else if (res.response.status === 102) {
                tool_status('all', true);
                tool_status('mif-tree', false);
            } else if (res.response.status === 501) {
                logout_func();
            }
        }
    };

    var add_node = function (node) {
        var pid = node.pid;
        var id = node.id;
        var name = node.name;
        var new_node = null;
        if (pid != "") {
            var p_node = $('a[id="pid"]').parent();
            new_node = _Tree.addTo(p_node, {
                caption: name,
                html: "<a id='" + id + "'></a>",
                icon: '<span class="' + node.icon + '"></span>'
            });
        } else {
            new_node = _Tree.addTo(null, {
                caption: name === "root" ? "User Root" : name,
                html: "<a id='" + id + "'></a>",
                icon: '<span class="' + node.icon + '"></span>'
            });
        }
        $(new_node).data("files", node.data);
        for (var i = 0; i < node.childes.length; i++) {
            add_node(node.childes[i]);
        }
    };
    var node_click = function (e) {
        current_tree_id = $('#_tree').find('.current').find('a').attr('id');
        var files = $('#_tree').find('.current').data('files');
    };
    var add_tree_node = function (pid, name, icon) {
        var rest_node = new RestQueryAjax(addnode_callback);
        var data = {
            "uid": uid,
            "pid": pid,
            "name": name,
            "icon": icon
        };
        rest_node.add_node_REST(data);

        function addnode_callback(res) {
            if (res.response.status === 200) {

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
            if (res.response.status === 200) {

            }
        }
    };

    function open_dialog(dia_type) {
        var html_content = "";
        var title = "";
        var ok_status = false;
        if (dia_type === "add_node") {
            html_content = "<div><input id='node_name' data-prepend='<a>Node Name:</a>' data-role=\"input\" type=\"text\"><hr class=\"thin mt-1 mb-1\">";
            html_content += "<input id='node_icon' data-prepend='<a>Node Icon:</a>' data-role=\"input\" type=\"text\"><hr class=\"thin mt-1 mb-1\">";
            html_content += "<div style='height: 100px;overflow-x:hidden'>";
            html_content += "<ul data-role='listview' id='icons' data-select-node='true' data-view='list'>";
            html_content += "</ul></div></div>";
            title = "Add New Node";
        }
        Metro.dialog.create({
            title: title,
            content: html_content,
            width: 500,
            actions: [
                {
                    caption: "<span class='mif-checkmark'></span> OK",
                    cls: "alert",
                    onclick: function () {
                        var name = $('#node_name').val();
                        if (!name) {
                            alert('Please define the node name!');
                        } else if (!current_tree_id || current_tree_id === "") {
                            alert('Please select the parent node to insert!');
                        } else {
                            Metro.dialog.close($('.dialog'));
                            ok_status = true;
                        }
                    }
                },
                {
                    caption: "<span class='mif-cross'></span> Cancel",
                    cls: "js-dialog-close"
                }
            ],
            onClose: function (e) {
                if (ok_status) {
                    var name = $('#node_name').val();
                    var icon = $('#node_icon').val() ? 'mif-' + $('#node_icon').val() : 'mif-folder';
                    add_tree_node(current_tree_id, name, icon);
                }
            },
            onOpen: function (e) {
                buildIconPanel();
            }
        });
    }

    function buildIconPanel() {
        var rest_icon = new RestQueryAjax(icons_callback);
        rest_icon.get_icon_REST({});
        var lv = $('#icons');

        function icons_callback(res) {
            if (res.response.status === 200) {
                icons_list = res.response.element;
                for (var key in icons_list) {
                    var cat_node = lv.data('listview').addGroup({
                        caption: key
                    });
                    for (var i = 0; i < icons_list[key].length; i++) {
                        var icon = icons_list[key][i];
                        for (var x in icon) {
                            lv.data('listview').add(cat_node, {
                                caption: x,
                                icon: "<span class='" + icon[x] + " mif-lg'>"
                            })
                        }
                    }
                    lv.data('listview').toggleNode(cat_node);
                }
                lv.data('listview').options.onNodeClick = function icon_node_click(e, le) {
                    $('#node_icon').val(e[0].innerText);
                }
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
        if (able === 'all') {
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


