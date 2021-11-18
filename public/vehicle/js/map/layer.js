//rinoGIS가 마운트 된 뒤 실행한다.
var layerController = (function() {
	var featureSelected = function() {

		rinoGIS.on("ol.interaction.FeatureSelected", function(e) {
			
			//차량
			var features = e.properties.features;
			
			//단일 정보일때
			if (features.length == 1) {
				var option = {
					"url": "[팝업UI]",
					"method": "get",
					"dataType": "html",
					"async": true,
					"contentType": "text / html; charset=utf8",
					"success": function(_result) {

						var x = parseFloat(e.coordinate[0]);
						var y = parseFloat(e.coordinate[1]);
						//var coordinates = new ol.proj.transform([x, y], 'EPSG:3857', 'EPSG:4326');
						
						console.log(features[0]);
						
						//폼 변경
						_result = _result.replace(/{objectid}/gi, "info_" + features[0].getId().replace(".",""));
						_result = _result.replace(/{userKey}/gi, phoneNumberFormatter(features[0].get('userKey')));
						_result = _result.replace(/{inputTime}/gi, dateFormatter(features[0].get('inputTime')));
						_result = _result.replace(/{mgrs}/gi, features[0].get('mgrs'));
						_result = _result.replace(/{latitude}/gi, features[0].get('latitude'));
						_result = _result.replace(/{longitude}/gi, features[0].get('longitude'));

						var newWidget = new DOMParser().parseFromString(_result, 'text/html').body.childNodes[0];

						//지도 오버레이
						var overlay = new ol.Overlay({
							id: "info_" + features[0].getId().replace(".",""),
							element: newWidget,
							autoPan: true,
							autoPanAnimation: {
								duration: 250,
							},
						});
						map.addOverlay(overlay);
						overlay.setPosition(e.coordinate);


						$("#info_" + features[0].getId().replace(".","") + " .btn_close").on("click", function() {
							map.removeOverlay(overlay);
						});



					},
					"error": function(_error) {
						console.log(_error);
					}
				};
				$.ajax(option);

			}
			else {
				//alert("1개의 객체에 대해서만 상세 조회가 가능합니다.\n 지도를 확대하세요.")
				var option = {
					"url": "[클러스터객체팝업UI]",
					"method": "get",
					"dataType": "html",
					"async": true,
					"contentType": "text / html; charset=utf8",
					"success": function(_result) {

						var x = parseFloat(e.coordinate[0]);
						var y = parseFloat(e.coordinate[1]);
						
						console.log(features);
						
						//폼변경
						_result = _result.replace(/{objectid}/gi, "info_" + features[0].get('objectid'));
						
						var userKeys = ""
						
						for(var i=0; i<features.length; i++){
							userKeys += "<tr><td>"+(i+1)+"</td><td>식별번호</td><td colspan=\"3\">"+phoneNumberFormatter(features[i].get('userKey')) + "</td></tr>"
						}
						_result = _result.replace(/{userKey}/gi, userKeys);
						_result = _result.replace(/{count}/gi, features.length);

						var newWidget = new DOMParser().parseFromString(_result, 'text/html').body.childNodes[0];

						var overlay = new ol.Overlay({
							id: "info_" + features[0].get('objectid'),
							element: newWidget,
							autoPan: true,
							autoPanAnimation: {
								duration: 250,
							},
						});
						map.addOverlay(overlay);
						overlay.setPosition(e.coordinate);
						
						//스크롤바 생성
						$("#info_" + features[0].get('objectid') + " .content").mCustomScrollbar();

						$("#info_" + features[0].get('objectid') + " .btn_close").on("click", function() {
							map.removeOverlay(overlay);
						});

					},
					"error": function(_error) {
						console.log(_error);
					}
				};
				$.ajax(option);
			}
		});
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

	//WGS84 경위도 좌표, 레벨 이동
	var moveToPointAndZoom = function(x, y, lv) {
		var coordinates = new ol.proj.transform([x, y], 'EPSG:4326', 'EPSG:3857');

		map.getView().animate({
			zoom: lv,
			center: coordinates,
			duration: 1000
		});
	};

	//WGS84 경위도 좌표 이동
	var moveToPoint = function(x, y) {
		var coordinates = new ol.proj.transform([x, y], 'EPSG:4326', 'EPSG:3857');

		map.getView().animate({
			zoom: Math.round(map.getView().getZoom()),
			center: coordinates,
			duration: 1000
		});
	};

	//WGS84 경위도 좌표 Extent 이동
	var zoomToExtent = function(xmin, ymin, xmax, ymax) {
		var coordinates = new ol.proj.transformExtent([xmin, ymin, xmax, ymax], 'EPSG:4326', 'EPSG:3857');

		map.getView().fit(coordinates, {
			duration: 1000,
			nearest: true
		});
	};

	var setVisibleLayer = function(lyrNm) {
		var layer = map.getLayers().getArray().find(lyr => {
			if (lyr.get('layerNm') == lyrNm)
				return lyr;
		});

		//레이어가 보이지 않는 상태라면 visible을 설정한다.
		if (layer && !layer.getVisible()) {
			//var option = layer.get('layerId');
			layer.setVisible(true);
		}
	};
	

	var that = {
		featureSelected: function() {
			featureSelected();
		},
		moveToPoint: function(x, y) {
			moveToPoint(x, y);
		},
		moveToPointAndZoom: function(x, y, level) {
			moveToPointAndZoom(x, y, level);
		},
		zoomToExtent: function(xmin, ymin, xmax, ymax) {
			zoomToExtent(xmin, ymin, xmax, ymax);
		},
		setVisibleLayer: function(lyrNm) {
			setVisibleLayer(lyrNm);
		}
	};

	return that;
})();