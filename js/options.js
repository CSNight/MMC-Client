define(function () {
    var map_url = "http://support.supermap.com.cn:8090/iserver/services/map-china400/rest/maps/ChinaDark";
    var data_Url = "http://127.0.0.1:9200";
    var getGridOptions = function () {
        return {
            fillStyle: 'rgba(55, 50, 250, 0.8)',
            shadowColor: 'rgba(255, 250, 50, 1)',
            shadowBlur: 10,
            size: 40,
            globalAlpha: 0.5,
            label: {
                show: true,
                fillStyle: 'white',
                shadowColor: 'yellow',
                font: '15px Arial',
                shadowBlur: 10
            },
            gradient: {
                0: "rgba(49, 54, 149, 0)",
                0.2: "rgba(69,117,180, 0.7)",
                0.3: "rgba(116,173,209, 0.7)",
                0.4: "rgba(171,217,233, 0.7)",
                0.5: "rgba(224,243,248, 0.7)",
                0.6: "rgba(254,224,144,0.7)",
                0.7: "rgba(253,174,97,0.7)",
                0.8: "rgba(244,109,67,0.8)",
                0.9: "rgba(215,48,39,0.8)",
                0.95: "rgba(165, 0, 38,0.8)"
            },
            draw: 'grid'
        }
    };
    var getHeatMapOptions = function () {
        return {
            size: 20,
            gradient: {
                0: "rgba(49, 54, 149, 0)",
                0.2: "rgba(69,117,180, 0.7)",
                0.3: "rgba(116,173,209, 0.7)",
                0.4: "rgba(171,217,233, 0.7)",
                0.5: "rgba(224,243,248, 0.7)",
                0.6: "rgba(254,224,144,0.7)",
                0.7: "rgba(253,174,97,0.7)",
                0.8: "rgba(244,109,67,0.8)",
                0.9: "rgba(215,48,39,0.8)",
                0.95: "rgba(165, 0, 38,0.8)"
            },
            draw: 'heatmap'
        }
    };
    var getDefaultControlOptions = function () {
        var startMs = 1498772645774;
        var endMs = 1498935332879;
        var start = moment(startMs).format("YYYY-MM-DD HH:mm:ss");
        var end = moment(endMs).format("YYYY-MM-DD HH:mm:ss");
        return {
            startTime: start,
            endTime: end,
            speed: 900000,
            frequency: 1000
        }
    };
    //获取时间控件设置的参数
    var getControlOptions = function () {
        var startTime = $("#startTime").val();
        var endTime = $("#endTime").val();
        startTime = new Date(Date.parse(startTime.replace(/-/g, "/"))).getTime();
        endTime = new Date(Date.parse(endTime.replace(/-/g, "/"))).getTime();
        var speed = $("#speed").val();
        speed = (speed > 0) ? speed : 1000;
        speed = parseInt(speed);
        var frequency = $("#frequency").val();
        frequency = (frequency > 0) ? frequency : 1000;
        frequency = parseInt(frequency);
        return {
            startTime: startTime,
            endTime: endTime,
            speed: speed,
            frequency: frequency
        }
    };
    return {
        map_url: map_url,
        data_url: data_Url,
        GridOptions: getGridOptions,
        HeatMapOptions: getHeatMapOptions,
        DefaultControlOptions: getDefaultControlOptions,
        ControlOptions: getControlOptions
    }
});






