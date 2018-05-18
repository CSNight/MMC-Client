/**
 * 所有的服务Ajax请求
 */
function Config() {
    var URLset = {
        BaseURI: "http://127.0.0.1:5000/",
        MapURL: "http://localhost:8090/iserver/services/map-china400/rest/maps/China",
        FileURI: "http://localhost:8080/ShipAssist-Services/"
    };
    this.getUrl = function (key) {
        return URLset[key];
    };
}

var UrlConfig = function () {
};
var instance = new Config();
UrlConfig.getBaseURI = function () {
    return instance.getUrl('BaseURI');
};
UrlConfig.getMapURL = function () {
    return instance.getUrl('MapURL');
};
UrlConfig.getFileURI = function () {
    return instance.getUrl('FileURI');
};

/**
 * 所有的查询服务Ajax请求类
 */
function RestQueryAjax(callback) {
    this.login_REST = function (data) {
        ResultGet(data, 'user', 'login');
    };
    this.check_login_REST = function (data) {
        ResultGet(data, 'user', 'check_login');
    };
    this.logout_REST = function (data) {
        ResultGet(data, 'user', 'logout');
    };
    this.sign_up_REST = function (data) {
        ResultGet(data, 'user', 'sign_up');
    };
    this.delete_user_REST = function (data) {
        ResultGet(data, 'user', 'delete_user');
    };
    this.get_tree_REST = function (data) {
        ResultPost(data, 'tree', 'get_tree');
    };
    this.del_tree_REST = function (data) {
        ResultGet(data, 'tree', 'del_tree');
    };
    this.create_tree_REST = function (data) {
        ResultGet(data, 'tree', 'create_tree');
    };
    this.add_node_REST = function (data) {
        ResultGet(data, 'tree', 'add_node');
    };
    this.rename_node_REST = function (data) {
        ResultGet(data, 'tree', 'rename_node');
    };
    this.del_node_REST = function (data) {
        ResultGet(data, 'tree', 'del_node');
    };
    this.del_file_REST = function (data) {
        ResultGet(data, 'tree', 'del_file');
    };
    this.add_file_REST = function (data) {
        ResultGet(data, 'tree', 'add_file');
    };
    this.count_file_REST = function (data) {
        ResultGet(data, 'tree', 'count_file');
    };
    this.get_icon_REST = function (data) {
        ResultPost(data, 'tree', 'get_icons');
    };
    this.download_file_REST = function (data) {
        ResultPost(data, 'file', 'download');
    };
    this.del_file_REST = function (data) {
        ResultGet(data, 'tree', 'del_file');
    };
    // 返回函数
    RestQueryAjax.prototype = {
        callback: callback
    };
    // 返回值生成器
    var responseBuilder = function (request, response) {
        return {
            request: request,
            response: response
        }
    };

    // POST-Ajax
    var ResultPost = function postQuery(data, restin, method) {
        $.ajax({
            type: 'POST',
            url: UrlConfig.getBaseURI() + restin + '/' + method,
            data: data,
            dataType: 'json',
            xhrFields: {
                'Access-Control-Allow-Origin': UrlConfig.getBaseURI(),
                'Access-Control-Allow-Methods': 'POST',
                'Access-Control-Allow-Headers': 'Content-Type',
                'withCredentials': true
            },
            contentType: 'application/x-www-form-urlencoded; charset=utf-8',
            success: function (result) {
                if (result != null) {
                    callback(responseBuilder(data, result));
                } else {
                    callback(responseBuilder(data, '响应错误'));
                }
            },
            error: function (jqXHR, textStatus) {
                callback(responseBuilder(data, jqXHR.responseText, 0, textStatus));
            }
        });
    };

    // GET-Ajax
    var ResultGet = function getQuery(data, restin, method) {
        $.ajax({
            url: UrlConfig.getBaseURI() + restin + '/' + method,
            type: "GET",
            data: data,
            timeout: 0,
            contentType: 'application/x-www-form-urlencoded; charset=utf-8',
            xhrFields: {
                withCredentials: true
            },
            success: function (result) {
                if (result != null) {
                    callback(responseBuilder(data, result));
                } else {
                    callback(responseBuilder(data, '响应错误'));
                }
            },
            error: function (jqXHR, textStatus) {
                callback(responseBuilder(data, jqXHR.responseText, 0, textStatus));
            }
        });
    };
}
