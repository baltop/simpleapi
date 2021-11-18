var util = (function () {

    /*var currentTime = new Date();*/

    var domParser = new DOMParser();
    var that = function () {
    };

    that.changeMode = function (_mode) {
        if (_mode == POST_MESSAGE_CHANGE_MODE_WHITE) {
            $('body').addClass("wmode");
        } else {
            $('body').removeClass("wmode");
        }
    }

    that.checkInsideOfFrame = function () {
        if ( window.location !== window.parent.location ) { 
            return true;
        } else { 
            return false;
        } 
    }
    that.parseStringToDom = function (_str) {
        var dom = domParser.parseFromString(_str, "text/html")
        return dom.body.firstChild;
        // return dom;
    };

    that.getKorTextOfDay = function (_day) {
        switch (_day) {
            case INDEX_SUN:
                return TEXT_SUN;
            case INDEX_MON:
                return TEXT_MON;
            case INDEX_TUE:
                return TEXT_TUE;
            case INDEX_WED:
                return TEXT_WED;
            case INDEX_THU:
                return TEXT_THU;
            case INDEX_FRI:
                return TEXT_FRI;
            case INDEX_SAT:
                return TEXT_SAT;
        }
    }

    that.getEngTextOfDay = function (_day) {
        switch (_day) {
            case INDEX_SUN:
                return TEXT_ENG_SUN;
            case INDEX_MON:
                return TEXT_ENG_MON;
            case INDEX_TUE:
                return TEXT_ENG_TUE;
            case INDEX_WED:
                return TEXT_ENG_WED;
            case INDEX_THU:
                return TEXT_ENG_THU;
            case INDEX_FRI:
                return TEXT_ENG_FRI;
            case INDEX_SAT:
                return TEXT_ENG_SAT;
        }
    }

    that.getCurrentTime = function () {
    	var currentTime = new Date();
//    	currentTime = new Date();
        var str = "";
        var MM = currentTime.getMonth() + 1;
        var DD = currentTime.getDate();
        DD = (DD < 10) ? "0" + DD : DD;
        var day = that.getKorTextOfDay(currentTime.getDay());
        var hh = currentTime.getHours();
        hh = (hh < 10) ? "0" + hh : hh;
        var mm = currentTime.getMinutes();
        mm = (mm < 10) ? "0" + mm : mm;

        str = MM + "월" + EMPTY_SPACE + DD + "일" + "(" + day + ")" + EMPTY_SPACE + hh + ":" + mm;
        return str;
    };

    that.translaterWindDirection = function (_direction) {
        var output = _direction.split('');
        var length = output.length;
        var str = "";
        for (var i = 0; i < length; i++) {
            var char = output[i];
            if (char == "E") {
                str += "동"
            } else if (char == "W") {
                str += "서"
            } else if (char == "S") {
                str += "남"
            } else if (char == "N") {
                str += "북"
            }
        }
        return str;
    };

    that.getCurrentDate = function () {
    	var currentTime = new Date();
        return currentTime;
    }

    that.getAirConditionStatusColor = function (_value, _list) {
        var length = _list.length;
        var colorList = [
        	"#276cf5",
            "#3ac96f",
            "#f59527",
            "#db4739",
        ]//초록 - #3ac96f, 파랑 - #276cf5, 노랑 - #f59527, 빨강 - #db4739
        for (var i = 0; i < length; i++) {
            if (_list[i].min <= _value &&
                _list[i].max > _value) {
                return colorList[i];
            }
        }
    };

    that.getWeatherInfo = function (_weather, _hour) {
        var weather = _weather;
        var lgtCode = weather.lgtCode;
        var ptyCode = weather.ptyCode;
        var skyCode = weather.skyCode;
        if (lgtCode) {
            if (weather.lgtValue != "empty") return FORECAST_THUNDER;
        }

        if (!ptyCode) {
            ptyCode = "0";
        }

        if (ptyCode == "1") {
            //비
            return FORECAST_RAIN;
        } else if (ptyCode == "2") {
            //비/눈
            return FORECAST_RAIN_AND_SNOW;
        } else if (ptyCode == "3") {
            //눈
            return FORECAST_SNOW;
        } else if (ptyCode == "4") {
            //소나기
            return FORECAST_SHOWER
        } else {
        	var currentTime = new Date();
            var hour = currentTime.getHours()
            if (skyCode) {
                skyCode = parseInt(skyCode);
                if (_hour) hour = _hour;
                if (skyCode >= 6 && skyCode <= 8) {
                    if (hour < 6 || hour > 17) {
                        return FORECAST_CLOWDY_NIGHT;
                    } else {
                        return FORECAST_CLOWDY;
                    }
                } else if (skyCode >= 9 && skyCode <= 10) {
                    return FORECAST_OVERCAST
                } else {
                    if (hour < 6 || hour > 17) {
                        return FORECAST_CLEAN_NIGHT;
                    } else {
                        return FORECAST_CLEAN;
                    }
                }
            } else {
                if (hour < 6 || hour > 17) {
                    return FORECAST_CLEAN_NIGHT;
                } else {
                    return FORECAST_CLEAN;
                }
            }
        }
    };



    that.getParkingStatTime = function (_data, _dataLength) {
        var dateTime = [];
        _data.forEach(function (_item, _index) {
            var time = _item.time.substring(8, 10);

            if (_index < _dataLength) {
                dateTime.push(time);
            }
        })
        return dateTime.reverse();
    }

    that.getParkingInCount = function (_data, _dataLength) {
        var inCount = [];
        _data.forEach(function (_item, _index) {
            if (_index < _dataLength) {
                inCount.push(_item.in);
            }
        })

        return inCount.reverse();
    }
    that.getParkingOutCount = function (_data, _dataLength) {
        var outCount = [];
        _data.map(function (_item, _index) {
            if (_index < _dataLength) {
                outCount.push(_item.out);
            }
        })

        return outCount.reverse();
    }

    that, getBlueColorCd = function (_index) {
        var colors = ['#1B48BD', '#2259E7', '#2572E6', '#2D84ED', '#47BCFF', '#6196E6', '#553bff', '#4421d1', '#7036e3', '#9c88fb'];

        return colors[_index];
    }

    that.getBicycleVocLegend = function (_data) {

        var legend = _data.map(function (_item, _index) {
            return _item.name;
        })
        return legend;
    }

    that.getBicycleAgeLegend = function (_data) {

        var legend = _data.map(function (_item, _index) {
            return _item.interval;
        })
        return legend;
    }

    that.getBicycleVocSeries = function (_data) {
        var series = _data.map(function (_item, _index) {
            var serie = {
                value: _item.cnt,
                name: _item.name,
                itemStyle: {
                    color: getBlueColorCd(_index)
                }
            }
            return serie;
        })
        return series;
    }
    that.getBicycleAgeSeries = function (_data) {
        var series = _data.map(function (_item, _index) {
            var serie = {
                value: _item.cnt,
                name: _item.interval,
                itemStyle: {
                    color: getBlueColorCd(_index)
                }
            }
            return serie;
        })
        return series;
    }

    /**
     * 숫자 3자리마다 콤마 셋팅
     * @param _count
     * @returns {string}
     */
    that.setCountComma = function (_count) {
        var count = _count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return count;
    }

    /**
     * 시작 날짜 리턴
     * @returns {string}
     */
    that.getStartDtmForm8 = function () {

        var result = "";

        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth();

        month++;

        month = (month < 10) ? "0" + month : month;
        var day = date.getDate();
        day = (day < 10) ? "0" + day : day;

        result = year + "" + month + "" + day;
        return result;
    }

    that.getStartDtmForm14 = function () {

        var result = "";

        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth();
        var day = date.getDate();
        var hour = date.getHours();
        var minute = date.getMinutes();
        var second = date.getSeconds();

        month++;

        month = (month < 10) ? "0" + month : month;
        day = (day < 10) ? "0" + day : day;
        hour = (hour < 10) ? "0" + hour : hour;
        minute = (minute < 10) ? "0" + minute : minute;
        second = (second < 10) ? "0" + second : second;


        result = year + "" + month + "" + day + "" + hour + "" + minute + "" + second;
        return result;
    }


    /**
     * 종료 날짜 리턴
     * @returns {string}
     */
    that.getEndDtmForm8 = function () {

        var result = "";

        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth();
        var day = date.getDate();

        month++;

        if (date.getMonth() == 1) {
            date.setFullYear(date.getFullYear() - 1);
            date.setMonth(0);
            if (date.getMonth() == 0) {
                month = 12;
            } else {
                month = date.getMonth();
                month = (month < 10) ? "0" + month : month;
            }
            year = date.getFullYear();
            day = date.getDate();
            day = (day < 10) ? "0" + day : day;
        } else {
            date.setMonth(date.getMonth() - 1);
        }

        result = year + "" + month + "" + day;

        return result;
    }

    /**
     * API로 부터 받아온 시간대별 데이터 중 x 축 데이터 GET
     * @param _data
     */
    that.getBicycleTimeXData = function (_data) {
        var result = _data.map(function (_item, _index) {
            var data = '';
            if (_index !== 0) {
                data = "~" + _item.date.substring(8, 10) + ":00";
            } else {
                data = "~" + _item.date.substring(8, 10) + ":00(현재)";
            }
            return data;
        })
        return result;
    }

    /**
     * API로 부터 받아온 시간대별 데이터 중 Chart Data Get
     * @param _data
     * @returns {*}
     */
    that.getBicycleTimeTimeData = function (_data) {
        var result = _data.map(function (_item, _index) {
            var data = {
                value: 0,
                itemStyle: {}
            }

            if (_index !== 0) {
                data.value = _item.cnt;
            } else {
                data.value = _item.cnt;
                data.itemStyle = {color: '#1c53d3'};
            }
            return data;
        })
        return result;
    }


    var getMonth = function (_date) {
        var result = 'Jan';
        var date = _date.substring(4, 6);

        switch (date) {
            case INDEX_JAN:
                result = TEXT_ENG_JAN;
                break;
            case INDEX_FED:
                result = TEXT_ENG_FED;
                break;
            case INDEX_MAR:
                result = TEXT_ENG_MAR;
                break;
            case INDEX_APR:
                result = TEXT_ENG_APR;
                break;
            case INDEX_MAY:
                result = TEXT_ENG_MAY;
                break;
            case INDEX_JUN:
                result = TEXT_ENG_JUN;
                break;
            case INDEX_JULY:
                result = TEXT_ENG_JULY;
                break;
            case INDEX_AUG:
                result = TEXT_ENG_AUG;
                break;
            case INDEX_SEP:
                result = TEXT_ENG_SEP;
                break;
            case INDEX_OCT:
                result = TEXT_ENG_OCT;
                break;
            case INDEX_NOV:
                result = TEXT_ENG_NOV;
                break;
            case INDEX_DEC:
                result = TEXT_ENG_DEC;
                break;
        }
        return result;
    }

    var getDay = function (_date) {
        var result = '01';
        var date = _date.substring(6, 8);
        return date;
    }
    var getHour = function (_date) {
        var result = '01';
        var date = _date.substring(8, 10);
        return date;
    }

    that.getBicycleUseChartXData = function (_data, _type) {
        var result = "";
        if (_type == 'year') {
            result = _data.map(function (_item, _index) {
                return getMonth(_item.time);
            })
        } else if (_type == 'month') {
            result = _data.map(function (_item, _index) {
                return getDay(_item.time);
            })
        } else if (_type == 'day') {
            result = _data.map(function (_item, _index) {
                return getHour(_item.time);
            })
        }
        return result;
    }

    that.getBicycleUseChartData = function (_data) {
        var series = [
            {
                name: '남',
                data: []
            },
            {
                name: '여',
                data: []
            }
        ]

        _data.forEach(function (_item, _index) {
            series[0].data.push(_item.man)
            series[1].data.push(_item.woman)
        })

        return series;
    }

    that.getBicycleStationStatChartData = function (_data) {
        var chartData = {
            x: [],
            man: [],
            woman: []
        }

        _data.forEach(function (_item, _index) {
            var x = _item.date.substring(4, 6);
            var man = _item.man;
            var woman = _item.woman;

            chartData.x.push(x);
            chartData.man.push(man);
            chartData.woman.push(woman);
        })
        return chartData;
    }

    that.getAirCondtionValue = function (_value) {
        var result = AIR_CONDITION_VALUE_GOOD;
        switch (_value) {
            case 1:
                result = AIR_CONDITION_VALUE_GOOD;
                break;
            case 2:
                result = AIR_CONDITION_VALUE_NORMAL;
                break;
            case 3:
                result = AIR_CONDITION_VALUE_BAD;
                break;
            case 4:
                result = AIR_CONDITION_VALUE_VERYBAD;
                break;
        }
        return result;
    }
    that.getAirCondtionTextClassNm = function (_value, _list) {
        var length = _list.length;
        var colorList = [
            'tBlue',
            'tGreen',
            'tYellow',
            'tRed',
        ]//초록 - #3ac96f, 파랑 - #276cf5, 노랑 - #f59527, 빨강 - #db4739
        for (var i = 0; i < length; i++) {
            if (_list[i].min <= _value &&
                _list[i].max > _value) {
                return colorList[i];
            }
        }

        return result;
    }
    that.getAirConditionCircleClassNm = function (_value) {
        var result = AIR_CONDITION_VALUE_GOOD;
        switch (_value) {
            case 1:
                result = 'green_circle';
                break;
            case 2:
                result = 'blue_circle';
                break;
            case 3:
                result = 'yellow_circle';
                break;
            case 4:
                result = 'red_circle';
                break;
        }
        return result;
    }

    that.getAirConditionListStateClassNm = function (_value) {
        var result = '';

        switch (_value) {
            case 1:
                result = '';
                break;
            case 4:
                result = 'danger_state';
                break;
        }

        return result;
    }

    that.getBicycleBatteryClassNm = function (_battery) {
        var result = 'normal_battery';
        var battery = _battery;

        if (0 <= battery && battery < 26) {
            result = 'red_battery';
        } else if (26 <= battery && battery < 51) {
            result = 'yellow_battery';
        } else if (51 <= battery && battery < 76) {
            result = 'blue_battery';
        } else if (76 <= battery && battery < 101) {
            result = 'green_battery';
        }
        return result;
    }
    that.getBicycleTextClassNm = function (_value) {
        var result = 'tBlue';

        switch (_value) {
            case 'N':
                result = 'tBlue';
                break;
            case 'Y':
                result = 'tRed';
                break;
        }
        return result;
    }
    that.getBicycleEventText = function (_value) {
        var result = '정상';

        switch (_value) {
            case 'N':
                result = '정상';
                break;
            case 'Y':
                result = '비정상';
                break;
        }
        return result;
    }
    that.getBicycleSensorStateClassNm = function (_value) {
        var result = '';

        switch (_value) {
            case 'N':
                result = '';
                break;
            case 'Y':
                result = 'danger_state';
                break;
        }

        return result;
    }
    that.getBicycleSensorStatusText = function (_value) {
        var result = '정상';

        switch (_value) {
            case 'N':
                result = '정상';
                break;
            case 'Y':
                result = '이상발생';
                break;
        }

        return result;
    }
    that.getBicycleSensorCircleClassNm = function (_value) {
        var result = 'blue_circle';
        switch (_value) {
            case 'N':
                result = 'blue_circle';
                break;
            case 'Y':
                result = 'red_circle';
                break;
        }
        return result;
    }

    that.makeRandomId = function (_length) {
        var length = _length;
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    that.setIotTimeFormat = function (_date) {
        var hh = (_date.getHours() < 10) ? ("0" + _date.getHours()) : _date.getHours();
        var mm = (_date.getMinutes() < 10) ? ("0" + _date.getMinutes()) : _date.getMinutes();
        var ss = (_date.getSeconds() < 10) ? ("0" + _date.getSeconds()) : _date.getSeconds();
        return hh + ":" + mm + ":" + ss;

    }
    
    that.checkInternalServer = function () {
        var currentHost = location.hostname;
        return (currentHost == INTERNAL_SERVER_DOMAIN);
    }
    
    that.checkSecure = function () {
        var currentProtocol = location.protocol;
        return (currentProtocol == "https:");
    }
        
    that.getIotColor = function(_l, _v, _b){
    	list = _l || []
    	filtered = list.filter(e => e.minVal <= _v && e.maxVal > _v);
    	return filtered[0] ? filtered[0].color : _b;
    }

    return that;

})();

