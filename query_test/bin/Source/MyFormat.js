
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
