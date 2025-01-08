TE2000 = class TE2000 extends AView
{
	constructor()
	{
		super();
        this.contiKey = '';
        this.tabContiKey = '';
        this.acnt_cd = '';
        this.selectedTab = '';
	}

	init(context, evtListener)
	{
		super.init(context, evtListener)
        const today = new Date();
        const startDate = new Date(today.setMonth(today.getMonth() - 2)); // 두 달 전 날짜 계산
        this.startDate.setDate(`${startDate.getFullYear()}${(startDate.getMonth() + 1).toString().padStart(2, '0')}${startDate.getDate().toString().padStart(2, '0')}`);
	}

	onInitDone()
	{
		super.onInitDone();
        this.loadAdmin();       // 관리자 조회 및 셀렉트 박스 세팅
        this.loadUserGrid();    // 회원 조회 및 그리드 세팅
        this.innerHeader.element.style.display = 'none';
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
        if (!contiKey) thisObj.grid.removeAll();    // 그리드 초기화
        this.acnt_cd = '';                          // 계좌번호 초기화

        theApp.qm.sendProcessByName('TE2010', this.getContainerId(), null,
            function(queryData){
                const inblock1 = queryData.getBlockData('InBlock1')[0];
                inblock1.user_id = inblock1.user_id === "*******" ? 0 : inblock1.user_id;
                inblock1.next_key = contiKey;  // 이전에 가져온 마지막 키를 전달
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

                thisObj.contiKey = outblock1[outblock1.length - 1].next_key;
            },
            /* 데이터쿼리 매핑할 경우 
            function(queryData){    // 수신된 데이터(AQueryData)를 컴포넌트에 반영한 후에 호출되는 함수
                const outblock1 = queryData.getBlockData('OutBlock1');
                outblock1.forEach((item, index) => {
                    if (item.used_yn == 'N') {
                        for (let i = 0; i < thisObj.grid.getColumnCount(); i++) {
                            thisObj.grid.setCellTextColor(index, i, 'red');
                        }
                    } 
                })
            }*/
        );
    }

    // 회원 조회 버튼 클릭 시 
	onInsertBtnClick(comp, info, e)
	{
        this.loadUserGrid();
	}

    // 회원 다음 버튼 클릭 시 
	onContiKeyClick(comp, info, e)
	{
        this.loadUserGrid(this.contiKey);
	}

    // 회원 선택 시 
	onGridSelect(comp, info, e)
	{   
        const thisObj = this;
        const index = thisObj.grid.getRowIndexByInfo(info);
        if (index == -1) return;

        const acnt_cd = thisObj.grid.getDataByOption(info)[3];        

        // 선택한 회원의 계좌번호 전역변수에 저장
        thisObj.acnt_cd = acnt_cd;                  
        
        // 선택된 탭이 있다면 탭 그리드 로드
        const initTab = this.tab.getSelectedView();
        if (initTab) {
            thisObj.ordAction.selectBtnByValue(0);
            this.loadTabGrid();
        }
	}

    // tab 선택 시 - TE3000, TE3010, TE3020, TE3030
	onTabClick(comp, info, e)
	{
        const thisObj = this;
        thisObj.tabContiKey = '';       // tab contiKey 초기화 
        thisObj.innerHeader.element.style.display = 'flex';

        // 선택된 버튼의 아이디를 가져와서 해당 탭 보여주기
        const tabId = comp.compId;
        thisObj.tab.selectTabById(tabId);
        
        // tab1 일 경우 radioGroup 보여주기 
        if (tabId == 'tab1') {
            thisObj.ordAction.element.style.display = 'block';
            thisObj.ordAction.selectBtnByValue(0);
        } else thisObj.ordAction.element.style.display = 'none';
        
        // 쿼리 실행을 위해 전역에 탭 저장 후 탭 그리드 로드 함수 호출
        thisObj.selectedTab = tabId;
        thisObj.loadTabGrid();
	}

    // 탭 구분 변경 시 contiKey 초기화 
	onOrdActionChange(comp, info, e) { 
        this.tabContiKey = '';	
    }

    // 탭 뷰 그리드에 데이터 조회 쿼리 
    loadTabGrid(tabContiKey=''){
        const thisObj = this;
        const tabId = thisObj.selectedTab;

        const initTab = thisObj.tab.getTabById(tabId);
        if (initTab.content.view){
            const tabGrid = initTab.content.view.grid;
            if (!tabContiKey) tabGrid.removeAll();    // 그리드 초기화
        }

        const queryMap = {       // 탭 ID와 매핑되는 쿼리 이름
            tab1: 'TE3000',
            tab2: 'TE3010',
            tab3: 'TE3020',
            tab4: 'TE3030',
        };

        theApp.qm.sendProcessByName(queryMap[tabId], this.getContainerId(), null,
            function(queryData) { 
                const inblock1 = queryData.getBlockData('InBlock1')[0];
                inblock1.acnt_cd = thisObj.acnt_cd;
                inblock1.next_key = tabContiKey;  // 이전에 가져온 마지막 키를 전달
            },
            function(queryData) { 
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
                thisObj.tabContiKey = outblock1[outblock1.length - 1].next_key;
            }
        );
    }

    // 탭 조회 버튼 클릭 시 
    onTabInsertBtnClick(comp, info, e)
	{
        this.loadTabGrid();
	}
	

    // 탭 다음 버튼 클릭 시 
	onTabContiKeyClick(comp, info, e)
	{
        this.loadTabGrid(this.tabContiKey);
	}
}

