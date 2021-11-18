
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

	var statusList = function() {
		var option = {
			"url": "/rgweb/ext/api/ReadMobileStatus",
			"method": "get",
			"dataType": "json",
			"data": {
				"Skip": 0,
				"Take": 0,
				"UserKey": "",
				"SearchUserKey": "",
				"IsDevice": "",
				"InputTime": "",
				"Regiment": "",
				"HeartRate": "",
				"IsCharger": ""
			},
			"async": false,
			"contentType": "application/json; charset=utf8",
			"success": function(_result) {
				//console.log(_result);
				$(".total_list_area_map_wearable .total_list_body").mCustomScrollbar('destroy');
				$(".total_list_area_map_wearable .total_list_body").children().each(function() {
					$(this).remove();
				});
				
				//total count 추가, cjm
				var totalCnt = _result.totaL_CNT;
				var chargeCnt = 0;				
				var wearCnt = 0;
				
				$.each(_result.resultList, function(idx, status) {
					//total count 추가, cjm
					if(status.isCharger=="Y"){
						chargeCnt += 1;
					}
					else{
						wearCnt += 1;		
					}
					
					var row = "<div class=\"total_list_box\">" +
						"<div class=\"total_txt\">" + (idx + 1) + "</div>" +
						"<div class=\"total_txt\">" + phoneNumberFormatter(status.userKey) + "</div>" +
						"<div class=\"total_txt\">" + status.mgrs + "</div>" +
						"<div class=\"total_txt\">" + dateFormatter(status.inputTime) + "</div>" +
						"</div>";
					$(".total_list_area_map_wearable .total_list_body").append(row);
				});
				//total count 추가, cjm
				$("#wearableTotalNo").text(totalCnt);
				$(".box_footer").text("/" + totalCnt);
				$("#isChargeNo").text(chargeCnt);
				$("#isWearNo").text(wearCnt);

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
						deviceHistoryController.getDeviceHistory(_result.resultList[idx].userKey);
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
			if (lyr.get('layerNm').indexOf("병력") >= 0)
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

	var dateFormatter = function(date) {
		return date.substring(0, 4) + "-" + date.substring(5, 7) + "-" + date.substring(8, 10) + " " + date.substring(11, 13) + ":" + date.substring(14, 16) + ":" + date.substring(17, 19);
	};

	var phoneNumberFormatter = function(numberStr) {
		return numberStr.replace(/[^0-9]/g, "").replace(/(^02|^0505|^1[0-9]{3}|^0[0-9]{2})([0-9]+)?([0-9]{4})$/, "$1-$2-$3").replace("--", "-");
	};
	
	var refreshSource = function() {
		//rinoGIS-Message에서 보내는 Event에 의해 웨어러블 리스트 현황을 갱신함.
		rinoGIS.on("message.RefreshSource", function(e) {
			//console.log(e);			
			
			//선택 된 피처 초기화
			if (highlightFeature != null) {
				highlightFeature.setStyle(null);
				if (highlightFeature.get('selected')) {
					highlightFeature.unset('selected');
				}
			}
			
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


