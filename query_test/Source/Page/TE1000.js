TE1000 = class TE1000 extends AView
{
	constructor()
	{
		super()

		this.contiKey = '';
	}

	init(context, evtListener)
	{
		super.init(context, evtListener)

		this.createCkEditor(this.noticeContent.element);

        const today = new Date();
        const startDate = new Date(today.setMonth(today.getMonth() - 1)); // 한 달 전 날짜 계산
        this.startDate.setDate(`${startDate.getFullYear()}${(startDate.getMonth() + 1).toString().padStart(2, '0')}${startDate.getDate().toString().padStart(2, '0')}`);
        
	}


	onInitDone()
	{
		super.onInitDone()

		// 초기화 시 데이터 로드
		this.loadNoticeGrid();

	}

	onActiveDone(isFirst)
	{
		super.onActiveDone(isFirst);
	}

    createCkEditor(target)
    {
        return ClassicEditor.create(target, {
            language: 'ko',
            extraPlugins: [customUploadAdapterPlugin],
        })
        .then(editor => {
            editor.editing.view.change(writer => writer.setStyle('height', '200px', editor.editing.view.document.getRoot()))
            this.noticeContent = editor;
        })
        .catch(console.error);

        function customUploadAdapterPlugin(editor) {
            editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
                return new UploadAdapter(loader, `${config.SERVER_ADDRESS}:${config.SERVER_PORT}/upload`);
            };
        }
    }

    // 공지사항 조회 버튼 클릭 시 
	onNoticeSelectBtnClick(comp, info, e)
	{
        this.loadNoticeGrid();
	}

    // 공지사항 다음 버튼 클릭 시 
	onContiKeyClick(comp, info, e)
	{
         this.loadNoticeGrid(this.contiKey);  // next_key를 포함하여 다음 30개 데이터를 다시 불러옴
	}

    // 공지사항 조회 시 - TE1000
    loadNoticeGrid(contiKey = '') {
        const thisObj = this;
        thisObj.noticeId.setText('');       // ID 초기화
        thisObj.noticeContent.setData('');  // 에디터 데이터 초기화
        thisObj.noticeTitle.setText('');    // 제목 초기화
        thisObj.noticeType.selectItem(0);   // 구분 초기화


        // 쿼리 전송
        theApp.qm.sendProcessByName('TE1000', this.getContainerId(), null,
            function (queryData) {
                const inblock1 = queryData.getBlockData('InBlock1')[0];
                inblock1.next_key = contiKey;  // 이전에 가져온 마지막 키를 전달
            },
            function (queryData) {
                const errorData = this.getLastError();
                if (errorData.errFlag === 'E') {
                    console.log('Error Data:', errorData);
                    AToast.show('공지사항 조회 중 에러가 발생했습니다.');
                    return;
                }

                const outblock1 = queryData.getBlockData('OutBlock1');
                thisObj.grid.removeAll();               // 그리드 초기화

                if (!outblock1 || outblock1.length <= 0) {
                    AToast.show('조회된 데이터가 없습니다.');
                    return;
                }
                
                thisObj.contiKey = outblock1[outblock1.length - 1].next_key;
            }
        );
    }

    // 공지사항 선택 조회 시 - TE1010
    onGridSelect(comp, info, e)
    {
        const thisObj = this;
        const index = thisObj.grid.getRowIndexByInfo(info);
        if (index == -1) return;

        const data = thisObj.grid.getDataByOption(info);
        const noticeId = data[0];

        // 쿼리 전송
        theApp.qm.sendProcessByName('TE1010', this.getContainerId(), null,
            function(queryData) { // InBlock 설정
                const inblock1 = queryData.getBlockData('InBlock1')[0];
                inblock1.notice_id = noticeId;  // 선택된 공지사항 ID 전송
            },
            function(queryData) { // OutBlock 처리
                const errorData = this.getLastError();
                if (errorData.errFlag === 'E') {
                    console.log('Error Data:', errorData);
                    AToast.show('공지사항 조회 중 에러가 발생했습니다.');
                    return;
                }

                const outblock1 = queryData.getBlockData('OutBlock1');
                console.log("선택조회 구분",outblock1)

                if (!outblock1 || outblock1.length <= 0) {
                    AToast.show('조회된 데이터가 없습니다.');
                    return;
                }

                // 조회된 공지사항 데이터를 화면에 표시
                thisObj.noticeContent.setData(outblock1[0].notice_content); // 에디터 데이터 설정 또는 초기화
                thisObj.noticeType.selectItem(outblock1[0].notice_type); // 구분 설정 또는 초기화
            }
        );
    }

    // 공지사항 추가 시 - TE1011
	onNoticeInsertBtnClick(comp, info, e)
    {
        const thisObj = this;

        // 에디터 및 입력 필드에서 데이터 가져오기
        const noticeContent = this.noticeContent.getData();

        // 유효성 검사
        if (!noticeContent || !this.noticeTitle.getText()) {
            return AToast.show('모든 항목을 입력해주세요.');
        }

        // 쿼리 전송
        theApp.qm.sendProcessByName('TE1011', this.getContainerId(), null,
            function(queryData) { // InBlock 설정
                const inblock1 = queryData.getBlockData('InBlock1')[0];
                inblock1.notice_content = noticeContent;
            },
            function(queryData) { // OutBlock 처리
                const errorData = this.getLastError();
                if (errorData.errFlag === "E") {
                    console.log("Error Data:", errorData);
                    AToast.show('에러가 발생했습니다.');
                    return;
                }

                const outblock1 = queryData.getBlockData('OutBlock1');
                if (!outblock1 || outblock1.length <= 0) {
                    AToast.show('조회된 데이터가 없습니다.');
                    return;
                }
                if (outblock1[0].success_status !== 'Y') {
                    AToast.show('공지사항 저장에 실패했습니다.');
                    return;
                }

                // 성공 처리
                AToast.show('공지사항이 성공적으로 저장되었습니다.');
                thisObj.radioGroup.setSelectBtn(thisObj.noticeType0);
                thisObj.loadNoticeGrid();
            }
        );
    }

    // 공지사항 수정 시 - TE1012
    onNoticeUpdateBtnClick(comp, info, e) {
        const thisObj = this;

        // 에디터 및 입력 필드에서 데이터 가져오기
        const noticeContent = this.noticeContent.getData(); // 에디터 데이터 값

        // 유효성 검사
        if (!noticeContent || !this.noticeTitle.getText()) {
            return AToast.show('수정할 데이터를 선택하고 모든 필드를 입력해주세요.');
        }

        // 쿼리 전송
        theApp.qm.sendProcessByName('TE1012', this.getContainerId(), null,
            function(queryData) { // InBlock 설정
                const inblock1 = queryData.getBlockData('InBlock1')[0];
                inblock1.notice_content = noticeContent;
            },
            function(queryData) { // OutBlock 처리
                const errorData = this.getLastError();
                if (errorData.errFlag === "E") {
                    console.log("Error Data:", errorData);
                    AToast.show('공지사항 수정 중 에러가 발생했습니다.');
                    return;
                }

                const outblock1 = queryData.getBlockData('OutBlock1');
                if (!outblock1 || outblock1.length <= 0) {
                    AToast.show('수정된 데이터가 없습니다.');
                    return;
                }

                if (outblock1[0].success_status !== 'Y') {
                    AToast.show('공지사항 수정에 실패했습니다.');
                    return;
                }

                // 성공 처리
                AToast.show('공지사항이 성공적으로 수정되었습니다.');
                thisObj.radioGroup.setSelectBtn(thisObj.noticeType0);
                thisObj.loadNoticeGrid();
            }
        );
    }

    // 공지사항 삭제 시 - TE1013
	onNoticeDeleteBtnClick(comp, info, e)
	{
        const thisObj = this;

        // 쿼리 전송
        theApp.qm.sendProcessByName('TE1013', this.getContainerId(), null,
            function(queryData) {   },
            function(queryData) { // OutBlock 처리
                const errorData = this.getLastError();
                if (errorData.errFlag === "E") {
                    console.log("Error Data:", errorData);
                    AToast.show('공지사항 삭제 중 에러가 발생했습니다.');
                    return;
                }

                const outblock1 = queryData.getBlockData('OutBlock1');
                if (!outblock1 || outblock1.length <= 0) {
                    AToast.show('삭제된 데이터가 없습니다.');
                    return;
                }

                if (outblock1[0].success_status !== 'Y') {
                    AToast.show('공지사항 삭제에 실패했습니다.');
                    return;
                }

                // 성공 처리
                AToast.show('공지사항이 성공적으로 삭제되었습니다.');
                thisObj.radioGroup.setSelectBtn(thisObj.noticeType0);
                thisObj.loadNoticeGrid();
            }
        );
	}
}

