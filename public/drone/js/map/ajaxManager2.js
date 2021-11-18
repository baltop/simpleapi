var ajaxManager = (function () {
	const PROXY = "/uxp/api/proxy";
    //static method variable
    const METHOD_GET = "get";
    const METHOD_POST = "post";
    const METHOD_PUT = "put";
    const METHOD_DELETE = "delete";

    var that = function () {

    };

    //api requeajaxManagerst base library setting;
    var controller = $;

    //set option as a basic library form
    var setOption = function (_method, _url, _param, _successCb, _failureCb) {
        var option = {
            headers : {
                isAjax : true
            }
        };
        option.url = _url;
        option.method = _method;
        option.data = _param;
        option.success = setSuccessCb(_successCb);
        option.error = setFailureCb(_failureCb);
        return option;
    }

    //validate response data
    var validateResponseData = function (_data) {
        var result = true;

        return result;
    };

    var setSuccessCb = function (_cb) {
        return function (_response) {
            _cb && _cb(_response);
        };
    };

    var failCount = 0;
    
    var setFailureCb = function (_callback) {
        return function (_request, _textStatus, _errorThrown) {
            if (_request.getResponseHeader('Redirect')) {
            	if (failCount == 0 ) {
            		var redirectUrl = _request.getResponseHeader('Rurl'); 
        			alert('사용자 정보가 유효하지 않습니다.');
            		if (util.checkInsideOfFrame()) {
            			window.parent.location.href = redirectUrl;
            		} else {
            			location.href = redirectUrl;
            		}
            	}
            	failCount++;
            } else {
                _callback && _callback(_request, _textStatus, _errorThrown);
            }
        };
    };

    that.proxy = function (_url, _method, _headers, _param, _successCb, _failureCb, _isAsync) {
        var data = {
            url: _url,
            Param: {
                url: _url,
                method: _method,
            },
        };
        if (_headers) data.Header = _headers;
        if (_param) data.Param.Data = _param;
        data = JSON.stringify(data);
        var option = setOption(METHOD_POST, PROXY, data, _successCb, _failureCb);
        option.headers = {
            'isAjax' : true,
            'Content-Type': "application/json",
            'charset': "UTF-8"
        };
        if (_isAsync) {
            option.async = false;
        }
        console.log(option);
        controller.ajax(option);
    };


    //request api get method
    that.get = function (_url, _param, _successCb, _failureCb, _isAsync, _header) {
        var option = setOption(METHOD_GET, _url, _param, _successCb, _failureCb);
        if (_isAsync) {
            option.async = false;
        }
        controller.ajax(option);
    };

    //request api post method
    that.post = function (_url, _param, _successCb, _failureCb, _header) {
        var option = setOption(METHOD_POST, _url, _param, _successCb, _failureCb);
        if (_header) {
            option.headers = _header
        }
        controller.ajax(option);
    };

    //request api put method
    that.put = function (_url, _param, _successCb, _failureCb, _header) {
        var option = setOption(METHOD_PUT, _url, _param, _successCb, _failureCb)
        if (_header) {
            option.headers = _header
        }
        controller.ajax(option);
    };

    //request api delete method
    that.delete = function (_url, _param, _successCb, _failureCb, _header) {
        var option = setOption(METHOD_DELETE, _url, _param, _successCb, _failureCb);
        if (_header) {
            option.headers = _header
        }
        controller.ajax(option);
    };


    return that;
})();