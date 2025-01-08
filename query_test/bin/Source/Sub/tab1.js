
// tab1 = class tab1 extends AView
// {
// 	constructor()
// 	{
// 		super()
//         this.contiKey = '';
//         this.acnt_cd = '';
// 	}

// 	init(context, evtListener)
// 	{
// 		super.init(context, evtListener)
// 	}

//     onInitDone()
// 	{
// 		super.onInitDone()
// 	}

// 	onActiveDone(isFirst)
// 	{
// 		super.onActiveDone(isFirst)
// 	}

//     // 조회 버튼 클릭 시 
// 	onTabInsertBtnClick(comp, info, e)
// 	{
//         this.acnt_cd = this.getContainerView().acnt_cd  // 상위 컨테이너 뷰에서 계좌번호 가져오기 
        
//         this.loadGrid();
// 	}

//     // 다음 버튼 클릭 시 
// 	onTabContiKeyClick(comp, info, e)
// 	{
// 		this.loadGrid(this.contiKey);
// 	}

//     // 거래내역 조회 - TE3000
//     loadGrid(contiKey=''){
//         const thisObj = this;
//         if (!contiKey) thisObj.grid.removeAll();           // 그리드 초기화
        
//         theApp.qm.sendProcessByName('TE3000', this.getContainerId(), null,
//             function(queryData) { 
//                 const inblock1 = queryData.getBlockData('InBlock1')[0];
//                 inblock1.acnt_cd = thisObj.acnt_cd;
//                 inblock1.next_key = contiKey;  // 이전에 가져온 마지막 키를 전달
//             },
//             function(queryData) { 
//                 const errorData = this.getLastError();
//                 if (errorData.errFlag === 'E') {
//                     console.log('Error Data:', errorData);
//                     AToast.show(`${queryName} 실행 중 에러가 발생했습니다.`);
//                     return;
//                 }
//                 const outblock1 = queryData.getBlockData('OutBlock1');
//                 if (!outblock1 || outblock1.length <= 0) {
//                     AToast.show('조회된 데이터가 없습니다.');
//                     return;
//                 }
//                 thisObj.contiKey = outblock1[outblock1.length - 1].next_key;
//             }
//         );
//     }
// }

