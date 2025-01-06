TE2000 = class TE2000 extends AView
{
	constructor()
	{
		super();
        this.contiKey = '';
        this.tabContiKey = '';
        this.insertBtn = '';


	}

	init(context, evtListener)
	{
		super.init(context, evtListener)

        const today = new Date();
        const startDate = new Date(today.setMonth(today.getMonth() - 2)); // 두 달 전 날짜 계산
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
        
        
	}

    // 관리자 조회 시 - TE2000
    loadAdmin() {
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
                    return;
                }                
                if (!contiKey) thisObj.grid.removeAll();           // 그리드 초기화

                // next_key 저장 (필요 시 버튼 등에 사용)
                thisObj.contiKey = outblock1[outblock1.length - 1].next_key;
            },
            function(queryData){    // 수신된 데이터(AQueryData)를 컴포넌트에 반영한 후에 호출되는 함수
                const outblock1 = queryData.getBlockData('OutBlock1');
                outblock1.forEach((item, index) => {
                    if (item.used_yn == 'N') {
                        for (let i = 0; i < thisObj.grid.getColumnCount(); i++) {
                            thisObj.grid.setCellTextColor(index, i, 'red');
                        }
                    } 
                })
            }
        );
        

    }

    // 조회 버튼 클릭 시 
	onInsertBtnClick(comp, info, e)
	{
        this.loadUserGrid();
	}

    // 다음 버튼 클릭 시 
	onContiKeyClick(comp, info, e)
	{
        this.loadNoticeGrid(this.contiKey);
	}

    // 회원 선택 시 
	onGridSelect(comp, info, e)
	{   
        const thisObj = this;
        const index = thisObj.grid.getRowIndexByInfo(info);
        if (index == -1) return;

        const acnt_cd = thisObj.grid.getDataByOption(info)[3];        
        thisObj.acnt_cd = acnt_cd;          // 선택한 회원의 계좌번호 전역변수에 저장

        //const tabId = thisObj.tab.getLastSelectedTabId();
        // thisObj.tab.selectTabById(tabId);   // 회원만 선택 시 tabId는 첫번째 탭
        // thisObj.executeTabQuery(tabId);     // 회원만 선택 시, 자동으로 거래내역 보여주기
	}

    // tab 선택 시 - TE3000, TE3010, TE3020, TE3030
	onTabActionup(comp, info, e)
	{
        const thisObj = this;
        const tabId = e.target.tabId;
        //console.log("thisObj.acnt_cd",thisObj.acnt_cd)
        if (tabId == 'tab1') thisObj.tab.selectTabById(tabId, {data :thisObj.acnt_cd});   // 회원만 선택 시 tabId는 첫번째 탭
        else thisObj.executeTabQuery(tabId);
        //thisObj.executeTabQuery(tabId);

	}

    executeTabQuery(tabId) {
        const thisObj = this;
        //console.log("동적 뷰:", thisObj.getLoadView());
  
        // 비동기적으로 탭을 선택하고 그리드를 찾기 => 그리드 내용 초기화 
        thisObj.tab.selectTabById(tabId).then((selectedTab) => {
            const gridComp = selectedTab.content.view.grid;
            gridComp.removeAll();
      
        }).catch((error) => {  });


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

/*
                const selectedTab = thisObj.tab.selectTabById(tabId);
                console.log("selectedTab=",selectedTab)

                const gridComp = selectedTab.content.view.grid;
                console.log("탭 그리드=",gridComp)
                */
            }
        );
    }
/*
    // tabInsertBtn 클릭 이벤트 핸들러
    onTabInsertBtnClick(comp, info, e) {
        const thisObj = this;
        console.log("onInsertBtnClick")

        // insertBtn 클릭 시 loadUserGrid 호출
        thisObj.loadUserGrid(thisObj.contiKey); // 현재 contiKey를 전달하여 회원 조회

        // 필요에 따라 다른 동작 추가
    }

    // contiKey 클릭 이벤트 핸들러 (예시)
    onTabContiKeyClick(comp, info, e) {
        const thisObj = this;
        console.log("onContiKeyClick")

        // contiKey 값으로 원하는 작업을 처리하는 코드 작성
        console.log('ContiKey clicked:', thisObj.contiKey);
        
        // 예시로 executeTabQuery 실행
        const tabId = thisObj.tab.getLastSelectedTabId();
        thisObj.executeTabQuery(tabId); // 선택된 탭에 대해 쿼리 실행
    }    */
}

