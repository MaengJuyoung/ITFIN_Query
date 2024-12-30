afc.import('Source/Container/MainPage.js');

query_testApp = class query_testApp extends AApplication
{
	constructor()
	{
		super()

        this.qm = {};
        this.navi = {};
		this.clientIp = '';
	}

	onReady()
	{
		super.onReady();

		this.setMainContainer(new MainPage('main'));
		this.mainContainer.open();
        
		this.connectServer();
        this.getClientIp();
	}

    connectServer()
    {
        this.qm = new ExQueryManager();

		const netIo = new HttpIO(this.qm);
		const address = config.SERVER_ADDRESS;
        const port = config.SERVER_PORT;
        const path = config.SERVER_PATH;

		this.qm.setNetworkIo(netIo);
		this.qm.startManager(`${address}:${port}/${path}`);
    }

    getClientIp()
    {
        fetch('https://api64.ipify.org?format=json')
        .then(res => {
            return res.json();
        })
        .then(({ip}) => {
            this.clientIp = ip;
        })
        .catch(err => {
            console.warn(err);
        });
    }

    registerPage(menu)
    {
        // 내비게이터를 등록하지 않았다면 리턴한다.
        if( !this.navi ) return;
        
        for (var key in menu) {
            this.navi.registerPage(`Source/Page/${key}.lay`, key);
        }
    }

    goPage(pageId, data)
    {
        this.navi.goPage(pageId, data);
        
        document.title = `QUERY | ${menuCollection[pageId] || '메인'}`;
    }

    goPrevPage(data)
    {
        const pageId = this.navi?.getPrevPage?.containerId;
        this.navi.goPrevPage(data);

        document.title = `QUERY | ${menuCollection[pageId] || '메인'}`;
    }

    setCalendarStyles(calendarPicker)
    {
        calendarPicker.setCalendarPickerStyle({
            'border': '1px solid rgba(185, 185, 185, 1)',
            'border-radius': '8px',
        });

        calendarPicker.setCalendarIconStyle({
            'background-image': 'url(Assets/Container/calendar.png)',
            'background-size': '22px 22px',
            'background-repeat': 'no-repeat',
            'cursor': 'pointer'
        });

        calendarPicker.setCalendarInputStyle({
            'padding-left': '9px',
            'font-weight': '700',
            'font-size': '20px',
            'color': 'rgba(124, 139, 163, 1)'
        });
        calendarPicker.setCalendarViewStyle({
            'font-size': '15px',
        });
    }

	unitTest(unitUrl)
	{
		//TODO:edit here

		this.onReady()

		super.unitTest(unitUrl)
	}

}

