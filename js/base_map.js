define(function () {
    var initMap = function (url) {
        if (!map) {
            map = L.map('map', {
                center: [40.745654, -90.931577],
                maxZoom: 15,
                minZoom: 1,
                zoom: 4,
                crs: L.CRS.EPSG3857
            });
            L.supermap.tiledMapLayer(url).addTo(map);
        }
    };
    var handleMapEvent = function (div,map) {
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
    };
    return {
        init: initMap,
        handle_event: handleMapEvent
    };
});


