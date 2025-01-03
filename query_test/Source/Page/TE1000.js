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
        this.startDate.setDate(this.formatToYYYYMMDD(today));
        this.endDate.setDate(this.formatToYYYYMMDD(today));
	}


	onInitDone()
	{
		super.onInitDone()

		// 초기화 시 데이터 로드
		this.loadNoticeGrid();

	}

	onActiveDone(isFirst)
	{
		super.onActiveDone(isFirst)

		//TODO:edit here

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

    // 공지사항 조회 버튼 클릭 시 
	onNoticeSelectBtnClick(comp, info, e)
	{
        this.loadNoticeGrid();
	}

    // 공지사항 다음 버튼 클릭 시 
	onContiKeyClick(comp, info, e)
	{
         this.loadNoticeGrid(this.contiKey-29);  // next_key를 포함하여 다음 30개 데이터를 다시 불러옴
	}

    // 공지사항 조회 시 - TE1000
    loadNoticeGrid(contiKey = '') {
        const thisObj = this;
        
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
                // 데이터 변환
                const noticeTypeMap = {
                    '1': '공지',
                    '2': '긴급',
                    '3': '뉴스',
                    '4': '시스템',
                };

                outblock1.forEach(item => {
                    item.notice_date = item.notice_date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');   // 날짜 변환
                    item.notice_type = noticeTypeMap[item.notice_type];                                 // 구분 변환
                });

                console.log("outblock1",outblock1)
                thisObj.contiKey = outblock1[0].next_key;
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
    }

    // 공지사항 추가 시 - TE1011
	onNoticeInsertBtnClick(comp, info, e)
    {
        const thisObj = this;

        // 에디터 및 입력 필드에서 데이터 가져오기
        const noticeContent = this.noticeContent.getData();
        // const noticeTitle = this.noticeTitle.getText(); // 제목 입력 필드 값
        // const noticeType = this.noticeType.getSelectedIndex();   // 구분 입력 필드 값

        // 유효성 검사
        if (!noticeContent ) {
            return AToast.show('제목, 본문, 구분을 모두 입력해주세요.');
        }

        // 쿼리 전송
        theApp.qm.sendProcessByName('TE1011', this.getContainerId(), null,
            function(queryData) { // InBlock 설정
                const inblock1 = queryData.getBlockData('InBlock1')[0];
                // inblock1.notice_title = noticeTitle;
                inblock1.notice_content = noticeContent;
                // inblock1.notice_type = noticeType;
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
        const noticeId = this.noticeId.getText(); // ID 필드 값
        const noticeTitle = this.noticeTitle.getText(); // 제목 필드 값
        const noticeContent = this.noticeContent.getData(); // 에디터 데이터 값
        const noticeType = this.noticeType.getSelectedIndex(); // 구분 필드 값

        // 유효성 검사
        if (!noticeId || !noticeTitle || !noticeContent || !noticeType) {
            return AToast.show('수정할 데이터를 선택하고 모든 필드를 입력해주세요.');
        }

        // 쿼리 전송
        theApp.qm.sendProcessByName('TE1012', this.getContainerId(), null,
            function(queryData) { // InBlock 설정
                const inblock1 = queryData.getBlockData('InBlock1')[0];
                inblock1.notice_id = noticeId;
                inblock1.notice_title = noticeTitle;
                inblock1.notice_content = noticeContent;
                inblock1.notice_type = noticeType;
                inblock1.notice_file = ''; // 파일 경로 (필요 시 업데이트)
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

        const noticeId = this.noticeId.getText(); // ID 필드 값
        // 쿼리 전송
        theApp.qm.sendProcessByName('TE1013', this.getContainerId(), null,
            function(queryData) { // InBlock 설정
                const inblock1 = queryData.getBlockData('InBlock1')[0];
                inblock1.notice_id = noticeId;
            },
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

