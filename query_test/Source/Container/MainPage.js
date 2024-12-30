
MainPage = class MainPage extends APage
{
	constructor(containerId)
	{
		super(containerId)

		//TODO:edit here

	}

	init(context)
	{
		super.init(context)

		//TODO:edit here

	}

	onCreate()
	{
		super.onCreate()

		// 메인 컨테이너를 세로방향으로 분리 
        const cntrs = this.createSplit(2, [-1, 40], 'column', 0);

        if ( sessionStorage.getItem('userId') && sessionStorage.getItem('loginTime') ) {
            const isVaild = ((new Date()).getTime() - Number(sessionStorage.getItem('loginTime'))) < (60/*초*/ * 60/*분*/ * 12/*시간*/ * 1000/*밀리초*/);   // 12시간, 43_200_000ms
            if ( isVaild ) {
                this.setUserData({
                    user_id     : sessionStorage.getItem('userId'),
                    user_name   : sessionStorage.getItem('userName'),
                });
                this.setMenuCollection(cntrs);
                return;
            }
            AToast.show(`자동 로그인 만료로 다시 로그인해주시기 바랍니다.`);
        }
        this.openLogin(cntrs);
	}

    openLogin(cntrs)
    {
        sessionStorage.clear();

        const loginWin = new AWindow();
        loginWin.openFull('Source/Window/Login.lay');
        loginWin.setResultCallback((flag, data) => {
            if ( !flag ) return;

            this.setUserData(data);
            this.setMenuCollection(cntrs);
        });
    }

    setUserData(userData)
    {
        theApp.userId = sessionStorage.getItem('userId');
        theApp.userName = sessionStorage.getItem('userName');

        sessionStorage.setItem('userId', userData.user_id);
        sessionStorage.setItem('userName', userData.user_name);
        sessionStorage.setItem('loginTime', new Date().getTime());
    }

    setMenuCollection(cntrs) 
    {
        theApp.navView = cntrs[1].setView('Source/Container/Nav.lay');
        theApp.navi = new ANavigator('main', cntrs[0]);
        theApp.registerPage(menuCollection);
        theApp.goPage('TE1000');
    }

}

