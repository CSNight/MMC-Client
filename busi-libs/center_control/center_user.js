define(function (require) {
    var uid, role, current_tree_id = "", _Tree;

    var File_table = require('busi-libs/center_control/file_manage');

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
        html += '<button class="button drop-shadow success"><span class="mif-tree"></span> CreateTree</button> ';
        html += '<button class="button drop-shadow info"><span class="mif-plus"></span> AddNode</button> ';
        html += '<button class="button drop-shadow warning"><span class="mif-cog"></span> ModifyNode</button> ';
        html += '<button class="button drop-shadow alert"><span class="mif-cross"></span> DeleteNode</button> ';
        html += '<button class="button drop-shadow yellow"><span class="mif-upload"></span> UploadFile</button> ';
        html += '<button class="button drop-shadow light"><span class="mif-spinner4"></span> Refresh</button> ';
        html += '</div></div><div class=\'place-left w-25 mt-5 border-left-right bd-cyan border-size-2 h-vh-100 user_tree\'></div>';
        html += '<div class=\'place-left ml-20 w-65 h-100 mt-5\'>';
        html += '<table id="file_list" style="width:100%;text-align: center;font-size:13px"></table></div>';
        $('.navview-content').html(html);
        tool_status('all', true);
        $('.mif-spinner4').parent().click(function (event) {
            var tid = $('#_tree').find('.current').find('a').attr('id');
            File_table.clear();
            get_user_tree(function () {
                if (tid !== undefined && $('.mif-spinner4').attr('name') === "true") {
                    $('#' + tid).parent().find('.caption').click();
                }
                $('.mif-spinner4').attr('name', 'false');
            });
        });
        $('#home').click(function () {
            File_table.clear();
            get_user_tree();
        });
        $('.mif-tree').parent().click(create_user_tree);
        $('.mif-plus').parent().click(function () {
            open_dialog('add_node');
        });
        $('.mif-cross').parent().click(function () {
            if (current_tree_id !== "") {
                open_dialog('del_node');
            } else {
                Metro.toast.create("Please select a node to delete!", null, 5000, "bg-red fg-white");
            }
        });
        $('.mif-cog').parent().click(function () {
            if (current_tree_id !== "") {
                open_dialog('modify_node');
            } else {
                Metro.toast.create("Please select a node to modify!", null, 5000, "bg-red fg-white");
            }
        });
        $('.mif-upload').parent().click(function () {
            if (current_tree_id !== "") {
                File_table.Upload(current_tree_id);
            } else {
                Metro.toast.create("Please select a node to save files!", null, 5000, "bg-red fg-white");
            }
        });
        File_table.init();
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
                _Tree.options.onNodeClick = node_click;
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

    var get_user_tree = function (callback) {
        $('.user_tree').html('<ul data-role="treeview" data-select-node=\'true\' id="_tree"></ul>');
        var rest_tree = new RestQueryAjax(gettree_callback);
        var data = {
            "uid": uid
        };
        rest_tree.get_tree_REST(data);

        function gettree_callback(res) {
            if (res.response.status === 200) {
                current_tree_id = "";
                _Tree = $('#_tree').data('treeview');
                _Tree.options.onNodeClick = node_click;
                add_node(res.response.element);
                tool_status('all', false);
                tool_status('mif-tree', true);
            } else if (res.response.status === 102) {
                tool_status('all', true);
                tool_status('mif-tree', false);
            } else if (res.response.status === 501) {
                logout_func();
            }
            $('.item-separator').click();
            if (callback !== undefined) {
                callback();
            }
        }
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
                add_node(res.response.element);
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
                var delcount = res.response.element.delete_count;
                Metro.toast.create("Total delete " + delcount[0] + " nodes and " + delcount[1] + " files", null, 5000, "bg-green fg-white");
                get_user_tree();
                current_tree_id = "";
            }
        }
    };

    var modify_tree_node = function (sid, name, icon) {
        var rest_node = new RestQueryAjax(modifynode_callback);
        var data = {
            "uid": uid,
            "sid": sid,
            "name": name,
            "icon": icon
        };
        rest_node.rename_node_REST(data);

        function modifynode_callback(res) {
            if (res.response.status === 200) {
                get_user_tree();
            }
        }
    };

    function add_node(node) {
        var pid = node.pid;
        var id = node.id;
        var name = node.name;
        var new_node = null;
        if (pid !== "") {
            var p_node = $('a[id="' + pid + '"]').parent();
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
        if (node.hasOwnProperty('childes')) {
            for (var i = 0; i < node.childes.length; i++) {
                add_node(node.childes[i]);
            }
        }
    }

    function node_click(e, t) {
        current_tree_id = $('#_tree').find('.current').find('a').attr('id');
        var files = $('#_tree').find('.current').data('files');
        File_table.setRows(files, current_tree_id);
    }

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
            title = "<span class='mif-tree mr-4'></span>Add New Node";
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
        } else if (dia_type === "del_node") {
            html_content += "<div>Are you sure to delete the selected node? This operation will delete all child nodes and files</div>";
            title = "<span class='mif-warning mr-4'></span>Delete Node";
            Metro.dialog.create({
                title: title,
                content: html_content,
                width: 500,
                actions: [
                    {
                        caption: "Agree",
                        cls: "js-dialog-close alert",
                        onclick: function () {
                            if (!current_tree_id || current_tree_id === "") {
                                Metro.toast.create("Please select a node to delete!", null, 5000, "bg-red fg-white");
                            } else {
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
                        del_tree_node(current_tree_id);
                    }
                }
            });
        } else if (dia_type === "modify_node") {
            html_content = "<div><input id='node_name' data-prepend='<a>Node Name:</a>' data-role=\"input\" type=\"text\"><hr class=\"thin mt-1 mb-1\">";
            html_content += "<input id='node_icon' data-prepend='<a>Node Icon:</a>' data-role=\"input\" type=\"text\"><hr class=\"thin mt-1 mb-1\">";
            html_content += "<div style='height: 100px;overflow-x:hidden'>";
            html_content += "<ul data-role='listview' id='icons' data-select-node='true' data-view='list'>";
            html_content += "</ul></div></div>";
            title = "<span class='mif-cogs mr-4'></span>Modify Node";
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
                                alert('Please select the parent node to modify!');
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
                        modify_tree_node(current_tree_id, name, icon);
                    }
                },
                onOpen: function (e) {
                    buildIconPanel();
                    $('#node_name').val($('#' + current_tree_id).parent().find('.caption').html());
                    $('#node_icon').val($('#' + current_tree_id).parent().find('.icon').find('span').attr('class').replace('mif-', ''));
                }
            });
        } else if (dia_type === "upload") {

        }
    }

    function buildIconPanel() {
        var rest_icon = new RestQueryAjax(icons_callback);
        rest_icon.get_icon_REST({});
        var lv = $('#icons');

        function icons_callback(res) {
            if (res.response.status === 200) {
                var icons_list = res.response.element;
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


