/**
 * 所有的服务Ajax请求
 */
function Config() {
	var URLset = {
		BaseURI : "http://localhost:8080/ShipAssist-Services/services/api/",
		MapURL : "http://localhost:8090/iserver/services/map-china400/rest/maps/China",
		FileURI : "http://localhost:8080/ShipAssist-Services/"
	};
	this.getUrl = function(key) {
		return URLset[key];
	};
}
var UrlConfig = function() {
};
var instance = new Config();
UrlConfig.getBaseURI = function() {
	return instance.getUrl('BaseURI');
};
UrlConfig.getMapURL = function() {
	return instance.getUrl('MapURL');
};
UrlConfig.getFileURI = function() {
	return instance.getUrl('FileURI');
};

/**
 * 所有的查询服务Ajax请求类
 */
function RestQueryAjax(callback) {
	// 返回函数
	RestQueryAjax.prototype = {
		callback : callback
	};
	// 返回值生成器
	var responseBuilder = function(request, response, STATUS, message) {
		return {
			request : request,
			response : response,
			STATUS : STATUS,
			message : message
		}
	};

	// POST-Ajax
	var ResultPost = function postQuery(data, f, restin, method) {
		$.ajax({
			type : 'POST',
			url : UrlConfig.getBaseURI() + restin + '/' + f + '/' + method,
			data : data,
			dataType : 'json',
			xhrFields : {
				'Access-Control-Allow-Origin' : '*',
				'Access-Control-Allow-Methods' : 'POST',
				'Access-Control-Allow-Headers' : 'Content-Type'
			},
			contentType : 'application/x-www-form-urlencoded; charset=utf-8',
			success : function(result) {
				if (result != null) {
					if (result.totalCount != 0) {
						callback(responseBuilder(data, result.element, 1,
								'查询成功'));
					} else {
						callback(responseBuilder(data, result.element, 0,
								result.message));
					}
				} else {
					callback(responseBuilder(data, '', 0, '响应错误'));
				}
			},
			error : function(jqXHR, textStatus, errorThrown) {
				callback(responseBuilder(data, jqXHR.responseText, 0,
						textStatus));
			}
		});
	};

	// GET-Ajax
	var ResultGet = function getQuery(data, f, restin, method) {
		$.ajax({
			url : UrlConfig.getBaseURI() + restin + '/' + f + '/' + method,
			type : "GET",
			dataType : 'jsonp',
			jsonp : 'jsoncallback',
			data : data,
			timeout : 0,
			contentType : 'application/x-www-form-urlencoded; charset=utf-8',
			success : function(result) {
				if (result != null) {
					if (result.totalCount != 0) {
						callback(responseBuilder(data, result.element, 1,
								'查询成功'));
					} else {
						callback(responseBuilder(data, result.element, 0,
								result.message));
					}
				} else {
					callback(responseBuilder(data, '', 0, '响应错误'));
				}
			},
			error : function(jqXHR, textStatus, errorThrown) {
				callback(responseBuilder(data, jqXHR.responseText, 0,
						textStatus));
			}
		});
	};
}
