//common script
$(document).ready(function () {
    //btn_tab 
    $(document).on("click", ".btn_tab_map", function () {
        var tab = $(this).data("tab");
        
        //외부차량
        if(tab === "tab1"){
        	window.location.href="../vehicle/1";
        }
        //웨어러블
        else{
        	window.location.href="../wearable/1";
        }
    });

});
