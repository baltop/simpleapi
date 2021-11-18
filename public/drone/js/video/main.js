$(document).ready(function () {
	var showLog = true;
	var serverIp = '';
	var camName = 'drone1';
	var testCount = 12;
	var vid = new Array(testCount);
	var sessList = ['drone1'];

	

	$.ajax({
		url: "http://211.9.3.50:49999/getCamList",
		/*url:"http://221.155.136.103:49999/getCamList",*/
		type: "POST",
		dataType: "json",
		success: function (data) {
			/*for(var i=0;i<data.count;i++){
				sessList.push(data.list[i].server_session)	
			}*/
			//console.log(sessList)
			serverIp = data.list[0].server_name;

			start(serverIp, showLog, testCount, vid, sessList)
		},
		error: function (error) {
			console.log("cannot take cctv info");
			console.log(error);
		}
	})

	/*	$(".cctv_in").click(function(){
			var popupPath = "wcctvPopup";
			var name = "wcctvPopup";
			var popupHeight = window.screen.height;
			var popupWidth = window.screen.width;
			var popupX = window.screen.width;
			var popupY= window.screen.height;
			var option = 'status=no, height=' + popupHeight  + ', width=' + popupWidth  + ', left='+ popupX + ', top='+ popupY;
			var popup = window.open(popupPath, name, option);
			var tempSessList = [];
			
			var sessNo = $(this).attr('id').replace("dronevideo","")
			tempSessList.push(sessList[parseInt(sessNo)-1]);
			var popupParentSession = document.getElementById("popupParentSession");
			var popupParentServerIp = document.getElementById("popupParentServerIp");
	
			popupParentSession.value = tempSessList[0];
			popupParentServerIp.value = serverIp;
			
			console.log(popupParentSession.value);
			console.log(popupParentServerIp.value);
		});*/

		

	function startThis(to, serverIp, what, camName) {
		to.setDefaultWaitTime(5);
		to.open(what, serverIp, '8880', camName, serverIp + ':3478');
		to.onopen = (evt) => console.log(to.name() + ': Signaling channel opened');
		to.onclose = (evt) => console.log(to.name() + ': Closed');
	}

	function start(serverIp, showLog, testCount, vid, sessList) {
		testCount = 0;
		if (testCount < 0 || testCount > 12)
			testCount = 1;


		if (vid[1] == null) {
			vid[1] = new AcesServer(showLog);
			startThis(vid[1], serverIp, "dronevideo", sessList[0]);
		}
	}

	

	

	getDroneInfo1();
	getDroneInfo2();

	
});

function getDroneInfo1(){
		
	$.ajax({
		url: "http://211.9.3.50:49999/api/FlightInfo",
		type: "GET",
		dataType: "json",
		success: function (_data) {
			var velocity = _data.speed;
			var roll = _data.roll;
			var pitch = _data.pitch;
			var heading = _data.heading;
			var battery = _data.battery;
			var tempCoordinate = _data.av_pos.replace(' ', '').replace(']', '').replace('[', '');
			var longitude = (tempCoordinate.split(','))[0]; // 경도 132
			var latitude = (tempCoordinate.split(','))[1];  //위도, 38
			var altitude = _data.altitude; //고도
			var mgrs = _data.mgrsCoordinate; // 군사좌표

			$('#velocity').append(velocity);
			$('#roll').append(roll);
			$('#pitch').append(pitch);
			$('#heading').append(heading);

		},
		error: function (error) {
			alert("드론 서버를 확인해 주세요")
			console.log(error);
		}
	});
}

function getDroneInfo2(){
		
	$.ajax({
		url: "http://211.9.3.50:49999/api/FlightInfo",
		type: "GET",
		dataType: "json",
		success: function (_data) {
			var velocity = _data.speed;
			var roll = _data.roll;
			var pitch = _data.pitch;
			var heading = _data.heading;
			var battery = _data.battery;
			var tempCoordinate = _data.av_pos.replace(' ', '').replace(']', '').replace('[', '');
			var longitude = (tempCoordinate.split(','))[0]; // 경도 132
			var latitude = (tempCoordinate.split(','))[1];  //위도, 38
			var altitude = _data.altitude; //고도
			var mgrs = _data.mgrsCoordinate; // 군사좌표
			
			$('#battery').append(battery);
			$('#mgrs').append(mgrs);
			$('#altitude').append(altitude);
		},
		error: function (error) {
			alert("드론 서버를 확인해 주세요")
			console.log(error);
		}
	});
}
