
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

	onNoticeInsertBtnClick(comp, info, e)
    {
        const thisObj = this;

        // 에디터 및 입력 필드에서 데이터 가져오기
        const noticeContent = this.noticeContent.getData();
        const noticeTitle = this.noticeTitle.getText(); // 제목 입력 필드 값
        const noticeType = this.noticeType.getSelectedIndex();   // 구분 입력 필드 값

        // 유효성 검사
        if (!noticeTitle || !noticeContent || !noticeType) {
            return AToast.show('제목, 본문, 구분을 모두 입력해주세요.');
        }

        // 쿼리 전송
        theApp.qm.sendProcessByName('TE1011', this.getContainerId(), null,
            function(queryData) { // InBlock 설정
                const inblock1 = queryData.getBlockData('InBlock1')[0];
                inblock1.notice_title = noticeTitle;
                inblock1.notice_content = noticeContent;
                inblock1.notice_type = noticeType;
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
                console.log("Full OutBlock1 Data:", outblock1);
                if (outblock1[0].success_status !== 'Y') {
                    AToast.show('공지사항 저장에 실패했습니다.');
                    return;
                }

                // 성공 처리
                AToast.show('공지사항이 성공적으로 저장되었습니다.');
                thisObj.noticeContent.setData(''); // 에디터 내용 초기화
                thisObj.noticeTitle.setText('');  // 제목 입력 필드 초기화
                thisObj.noticeType.selectItem(0);   // 구분 입력 필드 초기화
            }
        );
    }

    // 그리드에 내용 추가
    addNoticeToGrid(title, content, type)
    {
        const grid = this.grid; // 그리드 객체 참조
        const newRow = {
            index: this.noticeIndex++, // index 증가
            제목: title,
            본문: content,
            구분: type,
            파일경로: '', // 파일 경로는 현재 비워둠
        };

        grid.insertRow(0, newRow); // 맨 위에 추가
    }

    // 데이터 로드 
loadNoticeGrid()
{
    const thisObj = this;

    // 조회 시작일자와 종료일자, 여기서는 예시로 'start_date'와 'end_date'를 '20240101'로 설정
    const start_date = '20240101';  // 실제로는 사용자가 입력하거나 동적으로 설정할 수 있습니다.
    const end_date = '20241231';    // 마찬가지로 동적으로 설정 가능.

    // 공지사항 데이터 로드 (TE1000 쿼리 사용)
    theApp.qm.sendProcessByName('TE1000', this.getContainerId(), {
        InBlock1: {
            notice_type: '',   // 구분 (여기서는 예시로 공백으로 설정)
            start_date: start_date,
            end_date: end_date
        }
    },
    function(queryData) {
        const outblock1 = queryData.getBlockData('OutBlock1');
        if (!outblock1 || outblock1.length <= 0) {
            console.log('공지사항 데이터가 없습니다.');
            return;
        }

        // 그리드 초기화 및 데이터 추가
        thisObj.grid.clearRow(); // 기존 데이터 삭제
        outblock1.forEach(item => {
            thisObj.grid.addRow({
                index: item.notice_id,
                제목: item.notice_title,
                본문: item.notice_content,
                구분: item.notice_type,
                파일경로: item.notice_file,
            });
        });

        // 가장 큰 index로 초기화
        thisObj.noticeIndex = outblock1[outblock1.length - 1].notice_id + 1;
    });
}

}

