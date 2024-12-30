
Register = class Register extends AView
{
	constructor()
	{
		super()

		//TODO:edit here

	}

	init(context, evtListener)
	{
		super.init(context, evtListener)

        this.getContainer().element.style.boxShadow = '1px 1px 0.5rem 1px rgba(0, 0, 0, 0.1)';
        this.getContainer().element.style.borderRadius = '0.5rem';
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

	onRegisterBtnClick(comp, info, e)
	{
        const thisObj = this;

        const userInput = {
            id      : this.userId.getText(),
            pw      : this.userPw.getText(),
            pwChk   : this.userPwChk.getText(),
            name    : this.userName.getText(),
        };

        for ( let key in userInput ) {
            if ( !userInput[key] ) return AToast.show('입력란이 전부 채워지지 않았습니다.');
        }
        if ( userInput.pw !== userInput.pwChk ) return AToast.show('비밀번호 확인이 일치하지 않습니다');
    
        theApp.qm.sendProcessByName('TE0001', this.getContainerId(), null,
        function(queryData)
        { // InBlock 설정
            const inblock1 = queryData.getBlockData('InBlock1')[0];
            inblock1.user_id = userInput.id;
            inblock1.user_pw = CryptoJS.SHA256(userInput.pw).toString();
            inblock1.user_name = userInput.name;
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
                AToast.show('회원가입에 실패했습니다.');
                return;
            }

            console.log(outblock1[0]);
            thisObj.getContainer().close(true, outblock1[0]);
        });
	}

	onRegisterKeyup(comp, info, e)
	{
        if ( e.key === 'Enter' ) this.onRegisterBtnClick();
	}

	onCloseBtnClick(comp, info, e)
	{
        this.getContainer().close(false);
	}
};

