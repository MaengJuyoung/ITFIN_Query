
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

        const today = new Date();
        const startDateObj = new Date(today); // 복사본 생성
        startDateObj.setMonth(today.getMonth() - 1); // 한 달 전으로 설정
        this.startDate.setDate(this.formatToYYYYMMDD(startDateObj));
        this.endDate.setDate(this.formatToYYYYMMDD(today));
        this.acnt_cd ='';
        this.ord_action = '0';
        
        this.data = {
            startDate: this.startDate, endDate: this.endDate, acnt_cd: this.acnt_cd
        };
	}

	onInitDone()
	{
		super.onInitDone();
        

        this.loadAdminGrid();
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
        theApp.qm.sendProcessByName('TE2000', this.getContainerId(), null, 
            function (queryData) {
                const inblock1 = queryData.getBlockData('InBlock1')[0];
            },
            function (queryData) {
                const errorData = this.getLastError();
                if (errorData.errFlag === 'E') {
                    console.log('Error Data:', errorData);
                    AToast.show('관리자 조회 중 에러가 발생했습니다.');
                    return;
                }
                const outblock1 = queryData.getBlockData('OutBlock1');
                if (!outblock1 || outblock1.length <= 0) {
                    AToast.show('조회된 데이터가 없습니다.');
                    return;
                }

                // SelectBox에 관리자 ID 추가
                outblock1.forEach((item) => {
                    thisObj.selectBox.addItem(item.user_id, item.user_id);
                });
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

    // 조회 버튼 클릭 시 
	onInsertBtnClick(comp, info, e)
	{
        this.loadUserGrid();
	}

    // 날짜를 yyyyMMdd 형식으로 변환하는 함수
    formatToYYYYMMDD(date) {
        // 만약 date가 Date 객체라면 (현재 날짜일 경우)
        if (date instanceof Date) {
            const yyyy = date.getFullYear();
            const mm = (date.getMonth() + 1).toString().padStart(2, '0'); // 월은 0부터 시작하므로 +1
            const dd = date.getDate().toString().padStart(2, '0');
            return `${yyyy}${mm}${dd}`;
        }
        // 만약 date가 {year, month, day} 형식일 경우 (캘린더 픽커에서 받은 데이터)
        else if (date.year && date.month && date.day) {
            const yyyy = date.year;
            const mm = (date.month).toString().padStart(2, '0'); // 월은 1부터 시작
            const dd = (date.day).toString().padStart(2, '0');
            return `${yyyy}${mm}${dd}`;
        }
        // 유효하지 않은 데이터가 들어오면 빈 문자열 반환
        return '';
    }

    // 회원 선택 시 
	onGridSelect(comp, info, e)
	{   
        const thisObj = this;
        const index = thisObj.grid.getRowIndexByInfo(info);
        if (index == -1) return;

        // 조회 시작일자와 마감일자 설정
        const startDate = thisObj.formatToYYYYMMDD(thisObj.startDate.getDate()); 
        const endDate = thisObj.formatToYYYYMMDD(thisObj.endDate.getDate());     
        const acnt_cd = thisObj.grid.getDataByOption(info)[3];
        //const ord_action = '0'
        
        thisObj.data = {
            startDate: startDate, endDate: endDate, acnt_cd: acnt_cd
        };
        console.log("data=",data)
        /*const selectedTab = thisObj.tab.getSelectedTab().tabId;

        thisObj.tab.selectTabById(`${selectedTab}`);
        // 탭 ID와 매핑되는 쿼리 이름
        const queryMap = {
            tab1: 'TE3000',
            tab2: 'TE3010',
            tab3: 'TE3020',
            tab4: 'TE3030',
        };

        thisObj.executeTabQuery(selectedTab, queryMap[selectedTab], data)*/
	}

    // tab 선택 시 - TE3000, TE3010, TE3020, TE3030
    executeTabQuery(tabId, queryName, data) {
        const thisObj = this;
        console.log("thisObj.data1",data)

        // 쿼리 전송
        theApp.qm.sendProcessByName(queryName, this.getContainerId(), null,
            function(queryData) { // InBlock 설정
                const inblock1 = queryData.getBlockData('InBlock1')[0];
                inblock1.acnt_cd = thisObj.data.acnt_cd;
                //inblock1.ord_action = '0';
                inblock1.start_date = thisObj.data.startDate;
                inblock1.end_date = thisObj.data.endDate;
            },
            function(queryData) { // OutBlock 처리
                const errorData = this.getLastError();
                if (errorData.errFlag === 'E') {
                    console.log('Error Data:', errorData);
                    AToast.show(`${queryName} 실행 중 에러가 발생했습니다.`);
                    return;
                }

                const outblock1 = queryData.getBlockData('OutBlock1');
                console.log("outblock1", outblock1);
                if (!outblock1 || outblock1.length <= 0) {
                    AToast.show('조회된 데이터가 없습니다.');
                    return;
                }

                // 필요 시 탭에 따라 추가 처리
                if (tabId === 'tab1') {
                    console.log("Tab 1 데이터 처리");
                } else if (tabId === 'tab2') {
                    console.log("Tab 2 데이터 처리");
                }else if (tabId === 'tab3') {
                    console.log("Tab 3 데이터 처리");
                }else if (tabId === 'tab4') {
                    console.log("Tab 4 데이터 처리");
                }
            }
        );
    }


	onTabActionup(comp, info, e)
	{
        const thisObj = this;
        const tabId = e.target.tabId;
        console.log("thisObj.data2",thisObj.data)


        // 탭 ID와 매핑되는 쿼리 이름
        const queryMap = {
            tab1: 'TE3000',
            tab2: 'TE3010',
            tab3: 'TE3020',
            tab4: 'TE3030',
        };
        thisObj.executeTabQuery(tabId, queryMap[tabId], thisObj.data);

	}
}

