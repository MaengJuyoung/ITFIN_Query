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

    // 조회 버튼 클릭 시 
	onInsertBtnClick(comp, info, e)
	{
        this.loadUserGrid();
	}

    // 다음 버튼 클릭 시 
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
        thisObj.acnt_cd = acnt_cd;          // 선택한 회원의 계좌번호 전역변수에 저장
        this.innerHeader.element.style.display = 'flex';

        thisObj.tab.selectTabById('tab1');
	}

    // tab 선택 시 - TE3000, TE3010, TE3020, TE3030
	onTabClick(comp, info, e)
	{
        const thisObj = this;
        thisObj.tabContiKey = '';       // tab contiKey 초기화 

        const tabId = comp.compId;
        thisObj.tab.selectTabById(tabId);

        
        if (tabId != 'tab1') this.ordAction.element.style.display = 'none';
        else this.ordAction.element.style.display = 'block';
/*
        const initTab = thisObj.tab.getSelectedView();
        const insertBtn = initTab.$ele[0].childNodes[0].acomp.$ele[0].childNodes[1];
        const tabContikeyBtn = initTab.$ele[0].childNodes[0].acomp.$ele[0].childNodes[2];

        console.log("initTab",initTab)
        console.log("insertBtn",insertBtn)
        console.log("tabContikeyBtn",tabContikeyBtn)
*/


/*
        const queryMap = {       // 탭 ID와 매핑되는 쿼리 이름
            tab1: 'TE3000',
            tab2: 'TE3010',
            tab3: 'TE3020',
            tab4: 'TE3030',
        };
        
        if (tabId !== 'tab1'){
            if (comp.selectedTab.view){
                const initTab = comp.selectedTab.view;
                console.log("initTab",initTab);
                const tabGrid = initTab.grid;
                const contiBtn = initTab.contiKey.$ele[0]
                contiBtn.onClick()
                tabGrid.removeAll();
            }

            
        }*/
	}

    loadTabGrid(tabContiKey=''){
        const thisObj = this;
        if (!tabContiKey) thisObj.grid.removeAll();    // 그리드 초기화
        const tabId = thisObj.selectedTab;
        console.log("tabId",tabId)

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
	onTabContiKeyClick(comp, info, e)
	{
        const initTab = this.tab.getSelectedView().className;
        console.log("initTab",initTab)
        
        //this.loadTabGrid();
	}

    // 탭 다음 버튼 클릭 시 
	onTabInsertBtnClick(comp, info, e)
	{
        const initTab = this.tab.getSelectedView().className;
        console.log("initTab",initTab)
        this.selectedTab = initTab;
        //this.loadTabGrid(this.tabContiKey);
	}
}

