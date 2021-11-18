/**
 * 클러스터 레이어 스타일을 정의한다.
 */
var clusterController = (function () {

    // get cluster icon style
    var getClusterIconStyle = function (iconUrl, size){
        var iconStyle = new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 0],
                src: iconUrl,
                anchorOrigin: "bottom-left",
                anchorXUnits: "fraction",
                anchorYUnits: "fraction",
                scale: 1
            }),
            text: new ol.style.Text({
                 font: 'bold 14px NotoSansCJKB',
                 text: size.toString(),
                 offsetX : 16,
                 offsetY : -35,
                 backgroundFill: new ol.style.Fill({color: '#303030'}),
                 fill: new ol.style.Fill({
                     color: '#ffffff'
                 }),
                 stroke : ol.style.Stroke({
                     color: '#3e7496',
                     width: 0.5
                 }),
                 padding: [0, 3, 0, 3]
             }),
             fill: new ol.style.Fill({
                 color: '#1e56df'
             })
        });
        return iconStyle;
    }

    var that = {
        initialize : function() {
            //cctv cluster layer set style
            map.getLayers().getArray().find(lyr => {
				//클러스터 레이어 스타일 적용,
				//ol.source.Cluster 소스 일 경우 distance 속성이 있음을 활용
                if(lyr.getSource().distance){
					let iconUrl = "";
					//기본 스타일의 아이콘 URL을 가져온다.
					if (lyr.getStyle() && lyr.getStyle().getImage() && lyr.getStyle().getImage().getSrc()) {
						iconUrl = lyr.getStyle().getImage().getSrc();
					}
					
					//Feature의 사이즈를 표기하기 위한 스타일을 지정한다.
					lyr.setStyle(function(_feature){
						let features = _feature.get('features');
        				let size = features.length;
						return getClusterIconStyle(iconUrl, size);
					});
                }
            });
        }
    };

    return that;
})();
