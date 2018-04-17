define(function (require) {

    var options = require('busi-libs/es_search/options');
    var base_map = require('busi-libs/es_search/base_map');
    var plugins = require('busi-libs/es_search/plugins');
    var layerOptions = options.GridOptions();
    var es_options = null;
    var init = function (map, liveRenderer, liveDataSet, callbackOptions) {
        es_options = callbackOptions;
        options.setDefaultControlOptions(es_options);
        base_map.init(options.map_url);
        plugins.initTimeControlView(loadLiveData, options);
        plugins.initToggleThemeView(base_map.handle_event);
        var buttons = $('.btn-group').children();
        buttons.map(function (key) {
            var value = buttons[key].value;
            if (value === 'grid') {
                $(buttons[key]).on('click', function () {
                    layerOptions = options.GridOptions();
                    if (liveDataSet) {
                        liveRenderer.update({data: liveDataSet, options: layerOptions});
                    }
                });
                return;
            }
            if (value === 'heatmap') {
                $(buttons[key]).on('click', function () {
                    layerOptions = options.HeatMapOptions();
                    if (liveDataSet) {
                        liveRenderer.update({data: liveDataSet, options: layerOptions});
                    }
                });
            }
        });
    };

    //时间控制器回调参数，即每次刷新时执行的操作，此处为向服务器请求数据并绘制。实时刷新执行。
    function loadLiveData(currentTime) {
        var es_request = require('busi-libs/es_search/es_request');
        var search_body = es_request.request_build(map.getZoom(), map.getBounds(), currentTime, currentTime + options.ControlOptions().speed, es_options);
        es_request.request_handle(options.data_url, search_body, timeControl, layerOptions);
        updateProgress(moment(currentTime).format("YYYY-MM-DD HH:mm:ss"));
    }

    //更新当前时间界面
    function updateProgress(currentTime) {
        $("#progress").html(currentTime);
    }

    return {
        initjs: init
    };
});