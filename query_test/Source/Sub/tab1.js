
tab1 = class tab1 extends AView
{
	constructor()
	{
		super()
	}

	init(context, evtListener)
	{
		super.init(context, evtListener);
	}

	onInitDone()
	{
		super.onInitDone()
	}

	onActiveDone(isFirst)
	{
		super.onActiveDone(isFirst)

		//TODO:edit here

	}


    
    loadGrid() {
        
        // const ord_action = thisObj.ordAction.getSelectIndex();
        // console.log("ord_action",ord_action)
        /*
        // 쿼리 전송
        theApp.qm.sendProcessByName('TE1010', this.getContainerId(), null,
            function(queryData) { // InBlock 설정
                const inblock1 = queryData.getBlockData('InBlock1')[0];
                inblock1.acnt_cd = data[3],
                inblock1.ord_action = 0,
                inblock1.start_date = startDate,
                inblock1.end_date = endDate
            },
            function(queryData) { // OutBlock 처리
                const errorData = this.getLastError();
                if (errorData.errFlag === 'E') {
                    console.log('Error Data:', errorData);
                    AToast.show('공지사항 조회 중 에러가 발생했습니다.');
                    return;
                }

                const outblock1 = queryData.getBlockData('OutBlock1');
                if (!outblock1 || outblock1.length <= 0) {
                    AToast.show('조회된 데이터가 없습니다.');
                    return;
                }

                const noticeData = outblock1[0];
                console.log(noticeData);

                // 조회된 공지사항 데이터를 화면에 표시
                thisObj.noticeId.setText(noticeData.notice_id); // ID 설정 또는 초기화
                thisObj.noticeContent.setData(noticeData.notice_content); // 에디터 데이터 설정 또는 초기화
                thisObj.noticeTitle.setText(noticeData.notice_title); // 제목 설정 또는 초기화
                thisObj.noticeType.selectItem(noticeData.notice_type); // 구분 설정 또는 초기화
            }
        );
        */
    }
}

