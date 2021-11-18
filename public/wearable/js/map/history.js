//rinoGIS가 마운트 된 뒤 실행한다.
var deviceHistoryController = (function() {
	var vectorLayer;

	var getDeviceHistory = function(userKey) {
		var option = {
			"url": "/rgweb/ext/api/getMobileStatusHistoryLineGeometry",
			"method": "get",
			"dataType": "json",
			"data": {
				"Skip": 0,
				"Take": 30,
				"UserKey": userKey,
				"SearchUserKey": userKey,
				"IsDevice": "",
				"InputTime": "",
				"Regiment": "",
				"HeartRate": "",
				"IsCharger": ""
			},
			"async": false,
			"contentType": "application/json; charset=utf8",
			"success": function(_result) {

				if (vectorLayer) {
					vectorLayer.setSource(null);
				}
				var styleFunction = function(feature) {
					var geometry = feature.getGeometry();

					var styles = [
						// linestring
						new ol.style.Style({
							stroke: new ol.style.Stroke({
								color: '#ffcc33',
								width: 2
							})
						})
					];

					geometry.forEachSegment(function(start, end) {
						var dx = end[0] - start[0];
						var dy = end[1] - start[1];
						styles.push(new ol.style.Style({
							geometry: new ol.geom.Point(end),
							image: new ol.style.Circle({
								radius: 7,
								fill: new ol.style.Fill({ color: 'black' }),
								stroke: new ol.style.Stroke({
									color: 'white', width: 2
								})
							})
						}));

					});

					return styles;
				};


				var lineStyle = new ol.style.Style({
					stroke: new ol.style.Stroke({
						color: 'green',
						width: 1
					})
				});

				var vectorSource = new ol.source.Vector({
					features: (new ol.format.GeoJSON({
						featureProjection: 'EPSG:3857'
					})).readFeatures(_result)
				});

				vectorLayer = new ol.layer.Vector({
					source: vectorSource,
					style: styleFunction
				});

				vectorLayer.set('hoverStyle', null);

				vectorLayer.setMap(map);

			},
			"error": function(_error) {
				console.log(_error);
			}
		};
		$.ajax(option);
	}

	var clearHistory = function() {
		if (vectorLayer) {
			vectorLayer.setSource(null);
		}
	};


	//팝업 된 오버레이 전체 삭제
	var clearOverlay = function() {
		var statusOverlay = new Array();
		map.getOverlays().getArray().forEach(overlay => {
			//if (overlay.getId() && overlay.getId().indexOf("CCTV") >= 0) {
			statusOverlay.push(overlay);
			//}
		});

		statusOverlay.forEach(ove => {
			map.removeOverlay(ove);
		});
	};


	var that = {
		getDeviceHistory: function(userKey) {
			getDeviceHistory(userKey);
		},
		clearHistory: function() {
			clearHistory();
		}
	};

	return that;
})();