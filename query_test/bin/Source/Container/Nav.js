
Nav = class Nav extends AView
{
	constructor()
	{
		super()

		//TODO:edit here

	}

	init(context, evtListener)
	{
		super.init(context, evtListener)

		this.createNavBtn();
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

    createNavBtn()
    {
        for (var key in menuCollection) {
            var btn = new AButton();
            btn.init();
            btn.setComponentId(key);
            //btn.setGroupName('page');
            btn.addClass('navBtn');
            btn.setText(menuCollection[key]);
            btn.addEventListener('click', this, 'onClickPageBtn');
            this[key] = btn;
            this.addComponent(btn);
        }
    }

    onClickPageBtn(comp, info, e)
    {
        theApp.goPage(comp.compId);
    }
}

