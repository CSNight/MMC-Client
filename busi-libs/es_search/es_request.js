define(function () {
    var building_es_request = function (level, extent, startT, endT, es_options) {
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
        return {
            index: es_options.index,
            type: es_options.es_type,
            body: {
                query: {
                    constant_score: {
                        filter: {
                            range: eval("(" + "{'" + es_options.range_field + "': {from: " + startT + ",to:" + endT + "}}" + ")")
                        }
                    }
                },
                aggregations: {
                    zoomedInView: {
                        filter: {
                            geo_bounding_box: eval("(" + "{'" + es_options.geo_field + "':{top_left: {lat:" + coords.getNorthWest().lat + ", lon:" +
                                coords.getNorthWest().lng + "},bottom_right: {lat: " + coords.getSouthEast().lat + ",lon:" + coords.getSouthEast().lng +
                                "}}}" + ")")
                        },
                        aggregations: {
                            geohash: {
                                geohash_grid: {
                                    field: es_options.geo_field,
                                    precision: prec
                                }
                            }
                        }
                    }
                }
            }
        };
    };

    var es_request_func = function (url, search_body, timecontrol, options) {
        var liveESService = new SuperMap.ElasticSearch(url);
        liveESService.search(search_body).then(function (response) {
            if (response.error) {
                console.log(error);
                console.log(error.body);
                return;
            }
            renderLive(response.aggregations.zoomedInView.geohash.buckets, timecontrol, options);
        });
    };

    function wrapLatLngBounds(extent) {
        var left = extent.getNorthWest().lng < -180 ? -180 : extent.getNorthWest().lng;
        var bottom = extent.getSouthEast().lat < -90 ? -90 : extent.getSouthEast().lat;
        var right = extent.getSouthEast().lng > 180 ? 180 : extent.getSouthEast().lng;
        var top = extent.getNorthWest().lat > 90 ? 90 : extent.getNorthWest().lat;
        return L.latLngBounds(L.latLng(bottom, left), L.latLng(top, right));
    }

    function renderLive(result, timeControl, options) {
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
            liveRenderer = L.supermap.mapVLayer(liveDataSet, options, {noWrap: true}).addTo(map);
        } else {
            liveRenderer.update({data: liveDataSet, options: options});
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
        request_build: building_es_request,
        request_handle: es_request_func
    };
});