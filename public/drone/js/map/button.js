function autoRefresh1() {
	var currentLocation = window.location;
	$('#velocity').remove();
	$('#roll').remove();
	$('#pitch').remove();
	$('#heading').remove();
	getDroneInfo1();
	$("#d-status1").fadeOut('slow').load(currentLocation + ' #d-status1').fadeIn("slow");
}
setInterval('autoRefresh1()', 5000); //30초 후 새로고침

function autoRefresh2() {
	var currentLocation = window.location;
	$('#battery').remove();
	$('#mgrs').remove();
	$('#altitude').remove();
	getDroneInfo2();
	$("#d-status2").fadeOut('slow').load(currentLocation + ' #d-status2').fadeIn("slow");
}
setInterval('autoRefresh2()', 5000); //30초 후 새로고침

var dbtnOn = false;

$('#d-btn').click(function() {
	$('#drone_map').css('cursor', 'crosshair');
	dbtnOn = true;
});


var droneAttack = (function() {

	map.on('click', function(evt) {
		console.log(evt);
		if (dbtnOn) {
			var lonlat = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');

			var latitude = lonlat[1];
			var longitude = lonlat[0];
			var mgrsString2 = mgrs.forward(lonlat);
			console.log(mgrsString2);
			var mgrsString = mgrsString2.substring(0, 3) + " " + mgrsString2.substring(3, 5) + " " + mgrsString2.substring(5, 10) + " " + mgrsString2.substring(10)

			clatitude.innerHTML = latitude;
			clongitude.innerHTML = longitude;
			cmgrsString.innerHTML = mgrsString;



			overlay.setPosition(evt.coordinate);

			var sendData = {
				"cctv_id": "drone#1",
				"cctv_pos": "[" + longitude + ', ' + latitude + "]"
			};
			console.log(sendData);

			$('#drone-yes, #drone-no').click(function() {
				if (this.id == 'drone-yes') {
					var url = "http://211.9.2.10:8080/api/OperateDrone";
					var headers = {
						'Content-Type': "application/json"
					};


					var successCb = function(_response) {

						console.log(_response);
						console.log("출동 좌표 : " + "[" + longitude + ', ' + latitude + "]");
						alert('출동 완료');

					}

					var failureCb = function(_err) {
						console.log(_err);
						alert('출동 실패, 드론서버를 확인해주세요.')
						//throw new Error("Failed get Address data")
					};

					ajaxManager.proxy(url, "POST", headers, sendData, successCb, failureCb);


					overlay.setPosition(undefined);
					closer.blur();
					return false;
				}
			});

			$('#drone_map').css('cursor', 'default');
			dbtnOn = false;
		}
	});
});

