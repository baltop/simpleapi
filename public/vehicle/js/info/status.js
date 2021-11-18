
var highlightFeature;
var statusControll = (function() {

	var highlightEvent = function() {
		map.on('click', function() {
			if (highlightFeature != null) {
				highlightFeature.setStyle(null);
				if (highlightFeature.get('selected')) {
					highlightFeature.unset('selected');
				}
			}
		});
	};


	/*
		차량위치 리스트
	*/
	var statusList = function() {
		
		var option = {
			"url": "/widget/chart/getListByCar",
			"method": "get",
			"dataType": "json",
			"async": false,
			"contentType": "application/json; charset=utf8",
			"success": function(_result) {
				//console.log(_result);
				$(".total_list_area_map .total_list_body").mCustomScrollbar('destroy');
				$(".total_list_area_map .total_list_body").children().each(function() {
					$(this).remove();
				});
				
				$.each(_result, function(idx, status) {
										
					var row = "<div class=\"total_list_box\">" +
						"<div class=\"total_txt\">" + status.id + "</div>" +
						"<div class=\"total_txt\">" + '24육2015' + "</div>" +
						"<div class=\"total_txt\">" + status.keyonDate + "</div>" +
						"<div class=\"total_txt\">" + status.keyoffDate + "</div>" +
						"</div>";
					$(".total_list_area_map_wearable .total_list_body").append(row);
				});

				//mCustomScrollbar
				$(".total_list_body").mCustomScrollbar();

				$(".total_list_box").unbind();
				$(".total_list_box").click(function() {
					//이미 선택된 행이라면
					if ($(this).hasClass("active")) {
						$(".total_list_body .total_list_box.active").removeClass("active");
						
						deviceHistoryController.clearHistory();	//이력 geometry clear

						if (highlightFeature) {
							highlightFeature.setStyle(null);
							highlightFeature.unset('selected');
						}
					}
					else {
						$(".total_list_body .total_list_box.active").removeClass("active");
						$(this).addClass("active");
						var idx = $(this).index();
						//시설물 위치로 이동 및 팝업
						statusDetailInfo(_result.resultList[idx]);

						// /map/history.js
						deviceHistoryController.getDeviceHistory(_result.resultList[idx].차량번호);
					}
				});

			},
			"error": function(_error) {
				console.log(_error);
			}
		};
		$.ajax(option);
		
	};

	var statusDetailInfo = function(status) {
		
		var x = Number(status.longitude);
		var y = Number(status.latitude);

		var layer = map.getLayers().getArray().find(lyr => {
			if (lyr.get('layerNm').indexOf("차량") >= 0)
				return lyr;
		});

		//레이어가 보이지 않는 상태라면 visible을 설정한다.
		if (!layer.getVisible()) {
			var option = layer.get('layerId');
			layer.setVisible(true);
		}

		var coord = new ol.proj.transform([x, y], 'EPSG:4326', 'EPSG:3857');
		map.getView().animate({
			zoom: 17,
			center: coord,
			duration: 1000
		});

		if (highlightFeature) {
			highlightFeature.setStyle(null);
			highlightFeature.unset('selected');
		}

		var time = 2500;
		//찾은 시설물 하이라이트
		window.setTimeout(function() {
			highlightFeature = layer.getSource().getClosestFeatureToCoordinate(coord);
			if (highlightFeature) {
				highlightFeature.setStyle(layer.getProperties().selectedStyle);
				highlightFeature.set('selected', true);
			}
		}, time);
		

	};

	/*
		메시지 서버(SSE) Event Dispatch
	*/
	var refreshSource = function() {
		//rinoGIS-Message에서 보내는 Event에 의해 차량위치 리스트 현황을 갱신함.
		rinoGIS.on("message.RefreshSource", function(e) {
			//console.log(e);			
			
			//선택 된 피처 초기화
			if (highlightFeature != null) {
				highlightFeature.setStyle(null);
				if (highlightFeature.get('selected')) {
					highlightFeature.unset('selected');
				}
			}
			
			//리스트 초기화
			statusList();
		});
		
	};

	var that = {
		initialize: function() {
			statusList();
			highlightEvent();
		},
		refresh: function() {
			refreshSource();
		},
		popup: function(fac) {
			statusDetailInfo(fac);
		}
	};
	return that;
})();


