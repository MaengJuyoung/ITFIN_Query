
TE2000 = class TE2000 extends AView
{
	constructor()
	{
		super()

		//TODO:edit here

	}

	init(context, evtListener)
	{
		super.init(context, evtListener)

		//TODO:edit here
        this.selectBox.selectItem(0);

	}

	onInitDone()
	{
		super.onInitDone()

		//TODO:edit here
        //this.loadAdminGrid();
        this.loadUserGrid();
	}

	onActiveDone(isFirst)
	{
		super.onActiveDone(isFirst)

		//TODO:edit here

	}

    // 관리자 조회 시 - TE2000
    loadAdminGrid() {
        const thisObj = this;
        // 쿼리 전송
        theApp.qm.sendProcessByName('TE2000', this.getContainerId(), {},
            function (queryData) {
                const errorData = this.getLastError();
                if (errorData.errFlag === 'E') {
                    console.log('Error Data:', errorData);
                    AToast.show('관리자 조회 중 에러가 발생했습니다.');
                    return;
                }
                const outblock1 = queryData.getBlockData('OutBlock1');
                console.log("outblock1=",outblock1);

                if (!outblock1 || outblock1.length <= 0) {
                    AToast.show('조회된 데이터가 없습니다.');
                    return;
                }

                /*
                // SelectBox에 관리자 ID 추가
                outblock1.forEach((item) => {
                    thisObj.selectBox.addItem(item.user_id, item.user_id);
                });

                */
            }
        );
    }

    // 회원 조회 시 - TE2010
    loadUserGrid(contiKey = '') {
        const thisObj = this;
        thisObj.grid.removeAll();
        const search = thisObj.search.getText();
        const user_id = thisObj.selectBox.getSelectedItemText();

        theApp.qm.sendProcessByName('TE2010', this.getContainerId(), null,
            function(queryData){
                const inblock1 = queryData.getBlockData('InBlock1')[0];
                if (user_id == '********'){
                    inblock1.user_id = ''
                }else inblock1.user_id = user_id;
                inblock1.search = search || '' // 선택되지 않으면 빈 값
            },
            function(queryData){
                const errorData = this.getLastError();
                if (errorData.errFlag === 'E') {
                    console.log('Error Data:', errorData);
                    AToast.show('회원 조회 중 에러가 발생했습니다.');
                    return;
                }

                const outblock1 = queryData.getBlockData('OutBlock1');
                if (!outblock1 || outblock1.length <= 0) {
                    AToast.show('조회된 데이터가 없습니다.');
                    thisObj.grid.removeAll();               // 그리드 초기화
                    return;
                }

                outblock1.forEach((item) => {
                    const rowIndex = thisObj.grid.addRow([
                        item.user_id,
                        item.member_id,
                        item.member_name,
                        item.acnt_cd,
                        item.deposit_amt,
                        item.used_yn,
                    ]);
                    // used_yn이 'N'인 경우 스타일 적용
                    if (item.used_yn === 'N') {
                        thisObj.grid.setCellTextColor2(rowIndex, 'red');
                    }
                });
                
                // next_key 저장 (필요 시 버튼 등에 사용)
                thisObj.contiKey = outblock1[0].next_key;
            }
        );
    }


	onInsertBtnClick(comp, info, e)
	{
        this.loadUserGrid();
	}
}

