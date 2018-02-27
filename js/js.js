var map,
    timeControl,
    liveESService,
    liveRenderer,
    liveDataSet,
    geoFenceLayer,
    dataUrl = "http://127.0.0.1:9200",
    info = L.control({position: 'bottomleft'}),
    layerOptions = getGridOptions();


function init() {
    initMap();
    info.onAdd = function () {
        var popup = L.DomUtil.create('div');
        popup.innerHTML = "<div class='btn-group' role='group' aria-label='...'>" +
            "<button  value='grid' type='button' class='btn btn-default'>格网图</button>" +
            "<button value='heatmap' type='button' class='btn btn-default'>热力图</button></div>"
        handleMapEvent(popup, map);
        return popup;
    };
    info.addTo(map);
    liveESService = new SuperMap.ElasticSearch(dataUrl);
    var buttons = $('.btn-group').children();
    buttons.map(function (key) {
        var value = buttons[key].value;
        if (value === 'grid') {
            $(buttons[key]).on('click', function () {
                layerOptions = getGridOptions();
                if (liveDataSet) {
                    liveRenderer.update({data: liveDataSet, options: layerOptions});
                }
            });
            return;
        }
        if (value === 'heatmap') {
            $(buttons[key]).on('click', function () {
                layerOptions = getHeatMapOptions();
                if (liveDataSet) {
                    liveRenderer.update({data: liveDataSet, options: layerOptions});
                }
            });
        }
    });
}

function handleMapEvent(div, map) {
    if (!div || !map) {
        return;
    }
    div.addEventListener('mouseover', function () {
        map.dragging.disable();
        map.scrollWheelZoom.disable();
        map.doubleClickZoom.disable();
    });
    div.addEventListener('mouseout', function () {
        map.dragging.enable();
        map.scrollWheelZoom.enable();
        map.doubleClickZoom.enable();
    });
}

//开始播放
function start() {
    var options = getControlOptions();
    if (!timeControl) {
        timeControl = new SuperMap.TimeFlowControl(loadLiveData, options);
    } else {
        timeControl.updateOptions(options);
    }
    timeControl.start();
}

//暂停播放
function pause() {
    timeControl.pause();
}

//停止播放
function stop() {
    timeControl.stop();
    clearAll();
}

//时间控制器回调参数，即每次刷新时执行的操作，此处为向服务器请求数据并绘制。实时刷新执行。
function loadLiveData(currentTime) {
    getESAggregations(map.getZoom(), map.getBounds(), currentTime, currentTime + getControlOptions().speed);
    updateProgress(moment(currentTime).format("YYYY-MM-DD HH:mm:ss"));
}

function wrapLatLngBounds(extent) {
    var left = extent.getNorthWest().lng < -180 ? -180 : extent.getNorthWest().lng;
    var bottom = extent.getSouthEast().lat < -90 ? -90 : extent.getSouthEast().lat;
    var right = extent.getSouthEast().lng > 180 ? 180 : extent.getSouthEast().lng;
    var top = extent.getNorthWest().lat > 90 ? 90 : extent.getNorthWest().lat;
    return L.latLngBounds(L.latLng(bottom, left), L.latLng(top, right));
}

function getESAggregations(level, extent, startT, endT) {
    if (startT > endT) {
        return;
    }
    var coords = wrapLatLngBounds(extent), prec;
    if (level <= 2) {
        prec = 2;
    } else if (level > 2 && level <= 5) {
        prec = 4;
    } else if (level > 5) {
        prec = 8;
    } else if (level > 8 && level <= 11) {
        prec = 9;
    } else if (level > 11 && level <= 13) {
        prec = 10;
    } else if (level > 13 && level <= 15) {
        prec = 11;
    } else if (level > 15) {
        prec = 12;
    }
    liveESService.search({
        index: "flights",
        type: "flight_utc",
        body: {
            query: {
                constant_score: {
                    filter: {
                        range: {
                            'time-ms': {
                                from: startT,
                                to: endT
                            }
                        }
                    }
                }
            },
            aggregations: {
                zoomedInView: {
                    filter: {
                        geo_bounding_box: {
                            'location': {
                                top_left: {
                                    lat: coords.getNorthWest().lat,
                                    lon: coords.getNorthWest().lng
                                },
                                bottom_right: {
                                    lat: coords.getSouthEast().lat,
                                    lon: coords.getSouthEast().lng
                                }
                            }
                        }
                    },
                    aggregations: {
                        geohash: {
                            geohash_grid: {
                                field: "location",
                                precision: prec
                            }
                        }
                    }
                }
            }
        }
    }).then(function (response) {
        if (response.error) {
            console.log(error);
            console.log(error.body);
            return;
        }
        renderLive(response.aggregations.zoomedInView.geohash.buckets);
    });
}

//渲染实时点数据
function renderLive(result) {
    if (timeControl && !timeControl.getRunning()) {
        return;
    }
    result = result || {};
    var data = createLiveRendererData(result);
    if (data.length < 1) {
        return;
    }
    updateDataSet(data);
    if (!liveRenderer) {
        liveRenderer = L.supermap.mapVLayer(liveDataSet, layerOptions, {noWrap: true}).addTo(map);
    } else {
        liveRenderer.update({data: liveDataSet, options: layerOptions});
    }
}


function getGridOptions() {
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
}

function getHeatMapOptions() {
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
}

//解析点查询结果数据为mapv数据
function createLiveRendererData(results) {
    var data = [];
    results.map(function (feature) {
        var coords = decodeGeoHash(feature.key);
        data.push({
            geometry: {
                type: 'Point',
                coordinates: [coords.longitude[2], coords.latitude[2]]
            },
            count: feature.doc_count
        });
    });
    return data;
}

//更新点数据集
function updateDataSet(data) {
    if (!liveDataSet) {
        liveDataSet = new mapv.DataSet(data);
        return;
    }
    var innerData = liveDataSet.get();
    var dataLen = data.length;
    for (var i = 0; i < innerData.length; i++) {
        if (i < dataLen && data[i].ident === innerData[i].ident) {
            innerData[i] = data[i];
        }
    }
    liveDataSet.set(innerData);
}

//获取时间控件设置的参数
function getControlOptions() {
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
}

//更新当前时间界面
function updateProgress(currentTime) {
    $("#progress").html(currentTime);
}

//默认设置参数
function getDefaultControlOptions() {
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
}

function initMap() {
    if (!map) {
        map = L.map('map', {
            center: [40.745654, -90.931577],
            maxZoom: 15,
            minZoom: 1,
            zoom: 4,
            crs: L.CRS.EPSG3857
        });
        var attr = 'Data © <a href="https://www.elastic.co/products/elasticsearch" target="_blank">Elasticsearch</a> Map Data <span>© <a href="http://support.supermap.com.cn/product/iServer.aspx" target="_blank">SuperMap iServer</a></span> with <span>© <a href="http://iclient.supermap.io" target="_blank">SuperMap iClient</a></span>';
        var host = window.isLocal ? window.server : "http://support.supermap.com.cn:8090";
        var url = host + "/iserver/services/map-china400/rest/maps/ChinaDark";
        L.supermap.tiledMapLayer(url, {attribution: attr}).addTo(map);
    }

    initTimeControlView();
}

//初始化时间控制控件，仅UI
function initTimeControlView() {
    var control = L.control({position: "topright"});
    control.onAdd = function () {
        var me = this;
        me._div = L.DomUtil.create('div', 'panel panel-primary controlPane');
        me._div.style.width = "300px";
        var titleDiv = $("<div class='panel-heading text-center' id='toggle' style='cursor: pointer'>" +
            "<span class='panel-title text-center'>控制台</span>&nbsp;" +
            "<span class='glyphicon glyphicon-triangle-top' id='toggleIcon' ></span></div>").appendTo(me._div);

        var contentDiv = $("<div class='panel-body content center-block' style='font-size: 14px'></div>").appendTo(me._div);

        var optionsDiv = $("<div class='' id='options'></div>").appendTo(contentDiv);

        var defaultOption = getDefaultControlOptions();

        $("<div class='form-group form-inline'><label class='text-right' for='startTime' >起始时间</label>" +
            "<input id='startTime' type='text' class='form-control input-sm' placeholder='" + defaultOption.startTime +
            "' value='" + defaultOption.startTime + "'/></div></div>").appendTo(optionsDiv);

        $("<div class='form-group form-inline'><label class='text-right' for='endTime' >终止时间</label>" +
            "<input id='endTime' type='text' class='form-control input-sm' placeholder='" + defaultOption.endTime +
            "' value='" + defaultOption.endTime + "'/></div></div>").appendTo(optionsDiv);

        $("<div class='form-group form-inline'><label class='text-right' for='speed' >刷新步长(ms)</label>" +
            "<input id='speed' type='number' min='1' class='form-control input-sm' placeholder='" + defaultOption.speed +
            "' value='" + defaultOption.speed + "'/></div></div>").appendTo(optionsDiv);

        $("<div class='form-group form-inline'><label class='text-right' for='frequency' >刷新频率(ms)</label>" +
            "<input id='frequency' type='number' min='1' class='form-control input-sm' placeholder='" + defaultOption.frequency +
            "' value='" + defaultOption.frequency + "'/></div></div>").appendTo(optionsDiv);

        var progressDiv = $("<div class='form-group'><div class='form-horizontal text-center'><div class='form-group'>" +
            "<label  for='progress'>当前时间：</label><span class='form-control-static' id='progress'>未开始</span>" +
            "</div></div></div>").appendTo(contentDiv);

        var controlDiv = $("<section><div class='form-inline text-center'>" +
            "<input id='start' type='button'  class='btn btn-default text-center' value='开始'/>&nbsp;" +
            "<input id='pause' type='button'  class='btn btn-default text-center' value='暂停'/>&nbsp;" +
            "<input id='stop' type='button'  class='btn btn-default text-center' value='停止'/>" +
            "</div></section>").appendTo(contentDiv);


        me._div.addEventListener('mouseover', function () {
            me._map.dragging.disable();
            me._map.scrollWheelZoom.disable();
            me._map.doubleClickZoom.disable();
        });
        me._div.addEventListener('mouseout', function () {
            me._map.dragging.enable();
            me._map.scrollWheelZoom.enable();
            me._map.doubleClickZoom.enable();
        });

        return me._div;
    };
    control.addTo(map);
    var dateOptions = {
        format: "YYYY-MM-DD HH:mm:ss",
        stepping: 1,
        showClose: true,
        locale: 'zh-cn'
    };
    $("#startTime").datetimepicker(dateOptions);
    $("#endTime").datetimepicker(dateOptions);
    $("#start").on('click', function () {
        $("#options").slideUp("fast", function () {
            toggle(this);
        });
        start();
    });
    $("#pause").on('click', pause);
    $("#stop").on('click', stop);
    $("#toggle").on('click', function () {
        $("#options").slideToggle("fast", function () {
            toggle(this);
        });
        return false;
    });

    function toggle(ele) {
        if ($(ele).is(":visible")) {
            $("#toggleIcon").attr('class', "glyphicon glyphicon-triangle-top");
        } else {
            $("#toggleIcon").attr('class', "glyphicon glyphicon-triangle-bottom");
        }
    }
}

function clearAll() {
    if (timeControl) {
        timeControl.destroy();
        timeControl = null;
    }
    if (liveRenderer) {
        map.removeLayer(liveRenderer);
        liveRenderer = null;
    }
    if (liveDataSet) {
        liveDataSet = null;
    }
    if (geoFenceLayer) {
        geoFenceLayer.remove();
        geoFenceLayer = null;
    }
}
