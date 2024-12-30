
ExQueryManager = class ExQueryManager extends QueryManager
{
	constructor()
	{
		super()

		//TODO:edit here

	}

    // 쿼리 수신시 호출되는 함수
    onReceived(data, size)
    {
        var recvObj = JSON.parse(data);
        
        //	2. 패킷 타입과 패킷 아이디를 셋팅한다.
        // this.packetInfo.packetType = this.rcvBuf.getByte(OS_CFUNC, SZ_CFUNC);
        this.packetInfo.packetId = recvObj.head.packet_id;
        // this.packetInfo.packetTrcode = this.rcvBuf.getString(OS_CTRCODE, SZ_CTRCODE);

        this.queryProcess(recvObj);
        
        var trcode = recvObj.head.trcode;
    };

    // 쿼리데이터를 생성하여 리턴하는 함수
    makeQueryData(aquery, isSend)
    {
        var queryData = new AQueryData(aquery, isSend);
        if(!isSend)
        {
            queryData.setFlag('next', this.recvObj.head.next_flag);
            queryData.setContiKey(this.recvObj.head.next_key);
        }
        return queryData;
    };

    // 패킷별 고유 키(값)를 리턴하는 함수
    makePacketId()
    {
        if(this.packetId > 9999) this.packetId = 0;
        return ++this.packetId;
    };

    // 헤더 정보를 세팅하는 함수
    makeHeader(queryData, abuf, menuNo)
    {
        var packetId = this.makePacketId();
        
        //콘솔 임시 추가
    // 	console.log("makeHeader:", queryData, abuf, menuNo);
        
        var aquery = queryData.getQuery();
        
        abuf.head = abuf.head || {};
        abuf.head.func      = this.getHeaderInfo('func');
        abuf.head.packet_id = packetId;
        
        abuf.head.dircode   = aquery.getValue("queryType");
        abuf.head.trcode    = aquery.getName();
        abuf.head.user_id   = theApp.userId;
        abuf.head.user_ip   = theApp.clientIp;

        return packetId;
    };

    setErrorData(cbObj)
    {
        //----------------------------------------------------
        //	* rcvBuf에서 에러데이터에 해당하는 정보를 뽑아 저장한다.	
        this.errorData.errFlag = cbObj.error.success != "Y" ? "E" : null;
        this.errorData.errCode = cbObj.error.code;
        this.errorData.errMsg  = cbObj.error.message;
        //----------------------------------------------------
    };

    fileProcess()
    {
        // 파싱해서 마스터조회했던 콜백함수를 호출해준다.
        // filler위치에서 파일명? 조회해서
        var abuf = this.rcvBuf;
        var cbObj = this.getQueryCallback(this.packetInfo.packetId);
        
        if(!cbObj) return;
        //----------------------------------------------------
        //	1. 쿼리 네임을 얻어 queryData 를 생성한다.
        var qryName = cbObj.trName;
        var aquery = AQuery.getSafeQuery(qryName),
            queryData = this.makeQueryData(aquery);
        
        //	2. queryData 객체에 값을 채운다
        queryData.outBlockData_File(abuf, SZ_COMMONHEADER_SIZE);
        cbObj.func.call(this, queryData);
    };

    // ajax url 다른주소 요청함수
    extAjaxSend(url, data, callback)
    {
        $.ajax(
        {
            type:'POST',
            dataType: "text",
            url: `${config.SERVER_ADDRESS}`+url,
            data: { 'data': data },
            success: function(data)
            {
                if(callback) callback({ result: "success", message: data });
            },
            error: function (error)
            {
                if(callback) callback({ result: false, message: error.statusText });
            }
        });
    };

    //파일 데이터 보내기
    formDataSend(url_path, data_obj, file_arr, callback)
    {
        if( url_path == null ) {
            if(callback) callback({ result: false, message: "업로드할 주소가 없습니다." });
            return false;
        }

        if(file_arr == null || file_arr.length <= 0) {
            if(callback) callback({ result: false, message: "파일을 선택해주세요." });
            return false;
        }

        if( window.FormData == null || afc.isIos == true ) {
            this.formDataSendIFrame(url_path, data_obj, file_arr, callback);
        } else {
            this.formDataSendAjax(url_path, data_obj, file_arr, callback);
        }
    };

    // ajax 로 파일전송
    formDataSendAjax(url_path, data_obj, file_arr, callback)
    {
        var formData = new FormData();	//폼객체 생성

        if( data_obj != null ) {
            Object.keys(data_obj).forEach(function(key) {
                formData.append(key, data_obj[key]);
            });
        }

        if( file_arr != null ) {
            file_arr.forEach(function(file) {
                formData.append("image_file", file);
            });
        }

        $.support.cors = true;
        $.ajax({
            url: `${this.getWebappUrl()}${url_path}`,
            cache: false,
            crossDomain: true,
            timeout: 30*1000,
            xhrFields: {
                withCredentials: false
            },
            type: "POST",
            data: formData,
            async: false,	//false:동기, true:비동기
            contentType: false,	//파일업로드일 경우 사용
            processData: false,	//파일업로드일 경우 사용
            xhr: function() {
                var myXhr = $.ajaxSettings.xhr();
                myXhr.upload.onprogress = function (e) {
                    //For uploads
                    if( e.lengthComputable ) {
                        if( callback != null ) {
                            callback({ result: "progress", message: (e.loaded / e.total *100|0)+"%" });
                        }
                    }
                };
                return myXhr;
            },
            success:function(data){
                if(callback) callback({ result: "success", data: data });
            },
            error: function(error){
                if(callback) callback({ error: true, message: error.statusText });
            }
        });
    };

}


