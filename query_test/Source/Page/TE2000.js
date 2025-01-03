
TE2000 = class TE2000 extends AView
{
	constructor()
	{
		super();
	}

	init(context, evtListener)
	{
		super.init(context, evtListener)

        const today = new Date();
        const startDate = new Date(today.setMonth(today.getMonth() - 1)); // 한 달 전 날짜 계산
        this.startDate.setDate(`${startDate.getFullYear()}${(startDate.getMonth() + 1).toString().padStart(2, '0')}${startDate.getDate().toString().padStart(2, '0')}`);

        this.acnt_cd ='';       // 계좌번호 
        this.queryMap = {       // 탭 ID와 매핑되는 쿼리 이름
            tab1: 'TE3000',
            tab2: 'TE3010',
            tab3: 'TE3020',
            tab4: 'TE3030',
        };
	}

	onInitDone()
	{
		super.onInitDone();

        this.loadAdmin();       // 관리자 조회 및 셀렉트 박스 세팅
        this.loadUserGrid();    // 회원 조회 및 그리드 세팅
	}

	onActiveDone(isFirst)
	{
		super.onActiveDone(isFirst);
        
        var tabData = this.getTabData();
        console.log("tabData",tabData)
	}

    // 관리자 조회 시 - TE2000
    loadAdmin() {
        const thisObj = this;
        theApp.qm.sendProcessByName('TE2000', this.getContainerId(), null, 
            function (queryData) {  },
            function (queryData) {
                const errorData = this.getLastError();
                if (errorData.errFlag === 'E') {
                    console.log('Error Data:', errorData);
                    AToast.show('관리자 조회 중 에러가 발생했습니다.');
                    return;
                }

                const outblock1 = queryData.getBlockData('OutBlock1');
                outblock1.unshift({'user_id': "*******"});

                if (!outblock1 || outblock1.length <= 0) {
                    AToast.show('조회된 데이터가 없습니다.');
                    return;
                }
            }
        );
    }

    // 회원 조회 시 - TE2010
    loadUserGrid(contiKey = '') {
        const thisObj = this;
        thisObj.grid.removeAll();

        theApp.qm.sendProcessByName('TE2010', this.getContainerId(), null,
            function(queryData){
                const inblock1 = queryData.getBlockData('InBlock1')[0];
                if (inblock1.user_id == "*******") inblock1.user_id = 0;
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
                // next_key 저장 (필요 시 버튼 등에 사용)
                thisObj.contiKey = outblock1[0].next_key;
            }
        );
    }

    // 조회 버튼 클릭 시 
	onInsertBtnClick(comp, info, e)
	{
        this.loadUserGrid();
	}

    // 회원 선택 시 
	onGridSelect(comp, info, e)
	{   
        const thisObj = this;
        const index = thisObj.grid.getRowIndexByInfo(info);
        if (index == -1) return;

        const acnt_cd = thisObj.grid.getDataByOption(info)[3];        
        thisObj.acnt_cd = acnt_cd;          // 선택한 회원의 계좌번호 전역변수에 저장

        const tabId = thisObj.tab.getLastSelectedTabId();
        console.log("선택된 탭=",tabId);
        thisObj.tab.selectTabById(tabId);   // 회원만 선택 시 tabId는 첫번째 탭
        thisObj.executeTabQuery(tabId);     // 회원만 선택 시, 자동으로 거래내역 보여주기
	}

    // tab 선택 시 - TE3000, TE3010, TE3020, TE3030
	onTabActionup(comp, info, e)
	{
        const thisObj = this;
        const tabId = e.target.tabId;
        thisObj.executeTabQuery(tabId);
	}

    executeTabQuery(tabId) {
        const thisObj = this;

        const tabId2 = thisObj.tab.getLastSelectedTabId();
        console.log("선택된 탭=",tabId);
        console.log("이전에 선택한 탭=",tabId2);
        

        // if (thisObj.tab.getLastSelectedTabId() == tabId) return;    // 이전에 선택한 탭이면 데이터 추가 안하고 return -> 다른거 눌럿다가 누르면 추가됨 젠장~
        
        // const thisTab = thisObj.tab.getTabById(tabId);
        // // thisObj.tab.clearTabContent(thisTab);


        // 쿼리 전송
        theApp.qm.sendProcessByName(thisObj.queryMap[tabId], this.getContainerId(), null,
            function(queryData) { // InBlock 설정
                const inblock1 = queryData.getBlockData('InBlock1')[0];
                inblock1.acnt_cd = thisObj.acnt_cd;
            },
            function(queryData) { // OutBlock 처리
                // thisObj.tab.clearTabContent(tabId);
                const errorData = this.getLastError();
                if (errorData.errFlag === 'E') {
                    console.log('Error Data:', errorData);
                    AToast.show(`${queryName} 실행 중 에러가 발생했습니다.`);
                    return;
                }

                const outblock1 = queryData.getBlockData('OutBlock1');
                if (!outblock1 || outblock1.length <= 0) {
                    AToast.show('조회된 데이터가 없습니다.');
                    return;
                }
            }
        );
    }
}

