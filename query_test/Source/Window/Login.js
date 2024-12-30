
Login = class Login extends AView
{
	constructor()
	{
		super()

		//TODO:edit here

	}

	init(context, evtListener)
	{
		super.init(context, evtListener)

		//TODO:edit here

	}

	onInitDone()
	{
		super.onInitDone()

		//TODO:edit here

	}

	onActiveDone(isFirst)
	{
		super.onActiveDone(isFirst)

		//TODO:edit here

	}

	onLoginBtnClick(comp, info, e)
	{
        const thisObj = this;

        const userId = this.userId.getText();
        const userPw = this.userPw.getText();

        if ( !userId || !userPw ) return AToast.show('아이디 또는 비밀번호를 입력해주세요.');
    
        theApp.qm.sendProcessByName('TE0000', this.getContainerId(), null,
        function(queryData)
        { // InBlock 설정
            const inblock1 = queryData.getBlockData('InBlock1')[0];
            inblock1.user_id = userId;
            inblock1.user_pw = CryptoJS.SHA256(userPw).toString();
        },
        function(queryData)
        { // OutBlock 처리
            const errorData = this.getLastError();
            if (errorData.errFlag == "E") {
                console.log("Error Data:", errorData);
                AToast.show('에러가 발생했습니다.');
                return;
            }
            
            const outblock1 = queryData.getBlockData('OutBlock1');

            if ( !outblock1 || outblock1.length <= 0 ) {
                AToast.show('조회된 데이터가 없습니다.');
                return;
            }

            if ( outblock1[0].success_status !== 'Y' ) {
                AToast.show('아이디 또는 비밀번호를 확인해주세요.');
                return;
            }

            console.log(outblock1[0]);
            thisObj.getContainer().close(true, outblock1[0]);
        });
	}

	onLoginKeyup(comp, info, e)
	{
        if ( e.key === 'Enter' ) this.onLoginBtnClick();
	}

	onRegisterBtnClick(comp, info, e)
	{
        const loginWin = new AWindow();
        loginWin.openCenter('Source/Window/Register.lay', null, 720, 480);
        loginWin.setResultCallback((flag, data) => {
            if ( !flag ) return;
            
            AToast.show('회원가입 성공!');
        });
	}
};

