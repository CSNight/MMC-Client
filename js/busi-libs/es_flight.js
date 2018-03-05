define(function (require) {
    var liveESService,
        timeControl;

    var options = require('options');
    var base_map = require('base_map');
    var control = require('control');
    var layerOptions = options.GridOptions();
    var init = function (map, liveRenderer, liveDataSet, geoFenceLayer) {
        base_map.init(options.map_url);
        timeControl = control.initTimeControlView(loadLiveData, options);
        control.initToggleThemeView(base_map.handle_event);
        liveESService = new SuperMap.ElasticSearch(options.data_url);
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
        getESAggregations(map.getZoom(), map.getBounds(), currentTime, currentTime + options.ControlOptions().speed);
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

    //更新当前时间界面
    function updateProgress(currentTime) {
        $("#progress").html(currentTime);
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

    return {
        initjs: init
    };
});