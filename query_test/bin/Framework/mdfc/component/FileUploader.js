
(async function(){


/**
 * @author bks
 */

await afc.import('Framework/mdfc/layout/FileUploaderItem.js');

//-----------------------------------------------------------------------------------------
//  FileUploader class
//-----------------------------------------------------------------------------------------
class FileUploader extends AView
{
    constructor()
    {
        super()

        this.frwName = 'mdfc';
    }
	
}

window.FileUploader = FileUploader;


FileUploader.CONTEXT = 
{
	
    tag:'<div data-base="FileUploader" data-class="FileUploader" data-upload-url="" data-accept-select="*.*" data-accept-type="" class="FileUploader-Style"></div>',
		

    defStyle: 
    {
    	width:'400px', height:'40px' 
    },
   
    events: []
};


//이 함수가 실행된 이후에 init 함수가 실행된다.
FileUploader.prototype.createElement = function(context)
{
	AView.prototype.createElement.call(this, context);
	
	//개발 시점에 Drag & Drop 을 통해 최초 컴포넌트를 추가하는 경우, layout 을 동적으로 로드하여 태그를 추가한다.
	//이후에 초기화 하는 경우는 이미 하위 태그가 파일에 저장되어져 있다.
	if(this.$ele.children().length==0) 
	{
		var item = $('<div></div>')[0];
		afc.loadHtmlSync(item, 'Framework/mdfc/layout/FileUploaderItem.html');
		this.$ele.append(item);
	}
};


FileUploader.prototype.init = function(context, evtListener)
{
	AView.prototype.init.call(this, context, evtListener);

	this.childComp = this.element.children[0].children[0].acomp;
};


FileUploader.prototype.setReadOnly = function(isReadOnly)
{
    if(isReadOnly) this.$ele.attr('readonly', isReadOnly);
    else this.$ele.removeAttr('readonly');
	
	var childItem = this.childComp.getChildren();
	for(var i=0; i<childItem.length; i++)
	{
		if(isReadOnly) childItem[i].$ele.attr('readonly', isReadOnly);
		else childItem[i].$ele.removeAttr('readonly');
	}
};

FileUploader.prototype.setDisabled = function(isDisabled)
{
    if(isDisabled) this.$ele.attr('disabled', isDisabled);
    else this.$ele.removeAttr('disabled');
	
	var childItem = this.childComp.getChildren();
	for(var i=0; i<childItem.length; i++)
	{
		if(isDisabled) childItem[i].$ele.attr('disabled', isDisabled);
		else childItem[i].$ele.removeAttr('disabled');
	}
};


//파일종류 설정
FileUploader.prototype.setAccept = function(accept)
{
	this.childComp.setAccept(accept);	
};


//멀티 파일 설정
FileUploader.prototype.setMultiple = function(blean)
{
	this.childComp.setMultiple(blean);	
};

//드래그드랍 설정
FileUploader.prototype.setDragdrop = function(blean)
{
	this.childComp.setDragdrop(blean);	
};

//초기화
FileUploader.prototype.removeAll = function()
{
	this.childComp.removeAll();	
};

FileUploader.prototype.getFileItem = function()
{
	return this.childComp;
};


//파일path정보 가져오기
FileUploader.prototype.getValue = function()
{
	var dataInfo = {
		fileName: this.childComp.fileTfd.getText(),
		size: this.childComp.sendSize,
		sizeMB: this.childComp.formatBytes(this.childComp.sendSize, 0),
		multiple: this.childComp.multiple,
		accept: this.childComp.accept
	};
	return dataInfo;
};

FileUploader.prototype.getFilesInfo = function()
{
	if(this.childComp) return this.childComp.getFilesInfo();
};

//url 정보 가져오기
FileUploader.prototype.getUrl = function()
{
	this.childComp.getUrl();
};

//전송
FileUploader.prototype.send = function(data, callback)
{
	this.childComp.send(data, function(cb){
		callback(cb);
	});
};





})();