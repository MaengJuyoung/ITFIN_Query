
tab1 = class tab1 extends AView
{
	constructor()
	{
		super()
        this.contiKey = '';
        this.acnt_cd = '';
	}

	init(context, evtListener)
	{
		super.init(context, evtListener)
        this.acnt_cd = this.getContainerView().acnt_cd;
		//TODO:edit here

	}

    onInitDone()
	{
		super.onInitDone()
	}

	onActiveDone(isFirst)
	{
		super.onActiveDone(isFirst)
	}


	onTabInsertBtnClick(comp, info, e)
	{
        this.loadGrid();
	}

	onTabContiKeyClick(comp, info, e)
	{
		this.loadGrid(this.contiKey);
	}

    loadGrid(contiKey=''){
        const thisObj = this;
        thisObj.grid.removeAll();
        const ordAction = thisObj.ordAction.getSelectIndex();
        console.log("ordAction",ordAction)
        
        // 쿼리 전송
        theApp.qm.sendProcessByName('TE3000', this.getContainerId(), null,
            function(queryData) { // InBlock 설정
                const inblock1 = queryData.getBlockData('InBlock1')[0];
                inblock1.acnt_cd = thisObj.acnt_cd;
                inblock1.ord_action = ordAction;
                console.log("inblock1",inblock1);
            },
            function(queryData) { // OutBlock 처리
                const errorData = this.getLastError();
                if (errorData.errFlag === 'E') {
                    console.log('Error Data:', errorData);
                    AToast.show(`${queryName} 실행 중 에러가 발생했습니다.`);
                    return;
                }

                const outblock1 = queryData.getBlockData('OutBlock1');
                console.log("outblock1",outblock1);

                if (!outblock1 || outblock1.length <= 0) {
                    AToast.show('조회된 데이터가 없습니다.');
                    return;
                }


                // const selectedTab = thisObj.tab.selectTabById(tabId);
                // console.log("selectedTab=",selectedTab)
/*
                const gridComp = selectedTab.content.view.grid;
                console.log("탭 그리드=",gridComp)
                */
            }
        );
    }
}

