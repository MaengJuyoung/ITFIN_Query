
/*
* ADataMask 사용자 정의 파일
*/
if(!ADataMask.MyFormat) ADataMask.MyFormat = {};
ADataMask.MyFormat.noticeType =
{
	title : "공지사항 구분",
	param : [], //마스크 등록 시 입력할 파라미터 정의
	func : function noticeType(value, param, ele, dataObj)
	{
        switch(value){
            case '1': return "공지";
            case '2': return "긴급";
            case '3': return "뉴스";
            case '4': return "시스템";
        }
	}
};

ADataMask.MyFormat.sellbuyType =
{
	title : "매도매수 구분",
	param : [], //마스크 등록 시 입력할 파라미터 정의
	func : function sellbuyType(value, param, ele, dataObj)
	{
        if (value == '1') return "매도";
        else return "매수";
	}
};

ADataMask.MyFormat.ordType =
{
	title : "호가유형 구분",
	param : [], //마스크 등록 시 입력할 파라미터 정의
	func : function ordType(value, param, ele, dataObj)
	{
        if (value == '1') return "시장가";
        else return "지정가";
	}
};

ADataMask.MyFormat.ordAction =
{
	title : "신규정정취소 구분",
	param : [], //마스크 등록 시 입력할 파라미터 정의
	func : function ordAction(value, param, ele, dataObj)
	{
        if (value == '1') return "신규";
        else if(value == '2') return "정정";
        else return '취소';
	}
};

ADataMask.MyFormat.trscType =
{
	title : "입출금내역 조회 구분",
	param : [], //마스크 등록 시 입력할 파라미터 정의
	func : function trscType(value, param, ele, dataObj)
	{
        if (value == 'D') return "입금";
        else return "출금";
	}
};
