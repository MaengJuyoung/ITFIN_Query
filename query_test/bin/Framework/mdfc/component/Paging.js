
(async function(){


/**
 * @author bks
 */
 
await afc.import('Framework/mdfc/layout/PagingItem.js');

//-----------------------------------------------------------------------------------------
//  Paging class
//-----------------------------------------------------------------------------------------
class Paging extends AView
{
	constructor()
	{
		super();
		
		this.frwName = 'mdfc';
	
		this.childComp = null;
	}
}
window.Paging = Paging;

Paging.CONTEXT = 
{
	
    tag:'<div data-base="Paging" data-class="Paging" data-button-width="18" class="Paging-Style"></div>',
    defStyle: {},
    events: []
};


//이 함수가 실행된 이후에 init 함수가 실행된다.
Paging.prototype.createElement = function(context)
{
	AView.prototype.createElement.call(this, context);
	
	//개발 시점에 Drag & Drop 을 통해 최초 컴포넌트를 추가하는 경우, layout 을 동적으로 로드하여 태그를 추가한다.
	//이후에 초기화 하는 경우는 이미 하위 태그가 파일에 저장되어져 있다.
	if(this.$ele.children().length==0) 
	{
		var item = $('<div style="width:100%; height:100%;"></div>')[0];
		afc.loadHtmlSync(item, 'Framework/mdfc/layout/PagingItem.html');
		this.$ele.append(item);
	}
};


Paging.prototype.init = function(context, evtListener)
{
	AView.prototype.init.call(this, context, evtListener);

	this.childComp = this.element.children[0].children[0].acomp;
};

//앏은 복사
Paging.prototype.clone = function(obj)
{
    if(obj instanceof Object)
	{
        var copy = obj.constructor();
        for (var attr in obj)
		{
            if(obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    }
};


//setter start ------------------------------------------
Paging.prototype.isNumber = function(s)
{
	var nc = /^[0-9]*$/;
	return nc.test(s);
};
	
Paging.prototype.setReadOnly = function(isReadOnly)
{
    if(isReadOnly) this.$ele.attr('readonly', isReadOnly);
    else this.$ele.removeAttr('readonly');
	
	this.childComp.buttonReadonly = this.$ele.attr('readonly');
};

Paging.prototype.setDisabled = function(isDisabled)
{
    if(isDisabled) this.$ele.attr('disabled', isDisabled);
    else this.$ele.removeAttr('disabled');
	
	this.childComp.buttonDisabled = this.$ele.attr('disabled');
};



//총 카운트 수
//페이징뷰를 새로고침을 같이 진행케 한다.
Paging.prototype.setTotalCount = function(cnt)
{
	if(!this.isNumber(cnt)) cnt = 0;
	this.childComp.totalCount = cnt;
	
	this.setPageView();
};
//현재 페이지 수
Paging.prototype.setPageIndex = function(idx)
{
	this.childComp.pageIdx = idx;
};
//페이지당 레코드 수
Paging.prototype.setPerPage = function(per)
{
	this.childComp.perPage = per;
};
//총 카운트 수
Paging.prototype.setBlock = function(blk)
{
	this.childComp.block = blk;
};
//기본 setter setting
Paging.prototype.setPage = function(cnt, idx, per, blk)
{
	this.childComp.totalCount = cnt;
	this.childComp.pageIdx = idx;
	this.childComp.perPage = per;
	this.childComp.block = blk;
};
//가운데 유무(default: true)
Paging.prototype.setIsCenter = function(bln)
{
	this.childComp.isCenter = bln;
};
//전달할 정보 key/value setting
Paging.prototype.setParam = function(data)
{
	this.childComp.param = data;
};
Paging.prototype.addParam = function(data)
{
	var params = this.clone(data);
	for(var key in params) this.childComp.param[key] = params[key];
};
//setter end --------------------------------------------

//getter start ------------------------------------------
//총 카운트 수
Paging.prototype.getTotalCount = function()
{
	return this.childComp.totalCount;
};
//전체 페이지 수
Paging.prototype.getTotalPage = function()
{
	return this.childComp.totalPage;
};
//현재 페이지 수
Paging.prototype.getPageIndex = function()
{
	return this.childComp.pageIdx;
};
//페이지당 레코드 수
Paging.prototype.getPerPage = function()
{
	return this.childComp.perPage;
};
//총 카운트 수
Paging.prototype.getBlock = function()
{
	return this.childComp.block;
};
//기본 getter setting
Paging.prototype.getPage = function()
{
	return {
			totalCount: this.childComp.totalCount,
			totalPage: this.childComp.totalPage,
			pageIndex: this.childComp.pageIdx,
			perPage: this.childComp.perPage,
			block: this.childComp.block,
			param: this.childComp.param
		};
};
//getter end --------------------------------------------


//그리드, 리스트뷰 객체 
//-------------------------------------------------------
Paging.prototype.setComponent = function(acomp)
{
	this.childComp.component = acomp;
	this.childComp.$ele.html("");
};

//this 위임
//-------------------------------------------------------
//  delegate functions
//  function pagingBindData(acomp, data);
//-------------------------------------------------------
Paging.prototype.setDelegator = function(delegator)
{
	this.childComp.delegator = delegator;
};


Paging.prototype.setPageView = function()
{
	this.childComp.setPageView();
};

// 컴포넌트 내부에 드랍 가능여부 리턴
Paging.prototype.getDroppable = function()
{
	return false;
};

window.Paging = Paging;

})();