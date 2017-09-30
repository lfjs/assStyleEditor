/**
 * Created by JS-3 on 2017/8/18.
 */
var startDownload = function (data, filename) {
	var blob = new Blob([data], { type: 'application/octet-stream' });
	var url = window.URL.createObjectURL(blob);
	var saveas = document.createElement('a');
	saveas.href = url;
	saveas.style.display = 'none';
	document.body.appendChild(saveas);
	saveas.download = filename;
	saveas.click();
	setTimeout(function () { saveas.parentNode.removeChild(saveas); }, 1000);
	document.addEventListener('unload', function () { window.URL.revokeObjectURL(url); });
};
var asses = [];
var PlayResX = 0;
var config = [];
inP.value = PlayResX;
window.addEventListener('load', function () {
	var upload = document.querySelector('#file');
	upload.addEventListener('change', function () {
		var files = upload.files;
		function readAndPreview(file) {
			if (/\.(ass)$/i.test(file.name) ) {			// 确保 `file.name` 符合我们要求的扩展名
				var reader = new FileReader();
				reader.addEventListener("load", function () {
					var obj = {};
					obj.name = file.name;
					obj.PlayResX = parseInt(matchAgain(matchAgain(reader.result,/(?=PlayResX).*/),/\d+/));
					obj.PlayResY = parseInt(matchAgain(matchAgain(reader.result,/(?=PlayResY).*/),/\d+/));
					obj.style = [];
					var tempStyle = matchAgain(reader.result,/[^\w](?=style).*:.*/);
					var tempStyleHead = matchAgain(reader.result,/(?=format).*:.*Encoding/);
					var tempStyleHeadArr = tempStyleHead[0].replace(/format.*:\s*/i,'').match(/[^,|\s]+?(?=,)|\w+$/g);

					//console.log(tempStyleHead);
					for(i=0;i<tempStyle.length;i++){
						var objStyle = {};
						for(j=0;j<tempStyleHeadArr.length;j++){
							objStyle[tempStyleHeadArr[j]] = (tempStyle[i].replace(/style.*:\s*/i,'').match(/[^,|\s]+?(?=,)|\d+$/g))[j]
						}
						obj.style.push(objStyle);
					}
					//console.log(matchAgain(reader.result,/(?=style).*:.*/)[0].replace(/style.*:\s*/i,''));
					config.push(obj);
					console.log(obj);

					asses.push({'name':file.name,'content':reader.result});
					var tpl=document.getElementById("tpl");
					var cln=tpl.cloneNode(true);
					//tpl.style.display = 'none';
					var inputAll = [];
					for(x in obj){
						if(x == 'name'){
							cln.id = x + '_' + obj.name.replace(/\.[^.]*$/, '');
							continue
						}
						cln.children[0].style[matchStyle(x)] = obj[x] + 'px';
						//console.log(x+'---'+obj[x]);
						var input = document.createElement('input');
						input.type = 'text';
						input.value = obj[x];
						input.addEventListener('focus',function(){
							this.focusInput = true;
						});
						input.addEventListener('blur',function(){
							this.focusInput = false;
						});
						input.id = x + '_' + obj.name.replace(/\.[^.]*$/, '');
						input.title = matchStyle(x);
						input.name = 'name_' + obj.name.replace(/\.[^.]*$/, '');
						inputAll.push(input);
					}
					for(i=0;i<inputAll.length;i++){
						cln.children[0].children[0].appendChild(inputAll[i]);
					}
					document.getElementsByTagName('body')[0].appendChild(cln);
				}, false);
				reader.readAsText(file);
			}else swal('请选择扩展名为“*.ass”的文件！')
		}
		if (files) {
			[].forEach.call(files, readAndPreview);
		}
		//console.log(asses);
		//upload.value = '';
	});
	document.onclick = function(e){
		var evt = e || window.event;
		var target = evt.target || evt.srcElement;
		//target.id?console.info(target.id):0;
		if(target.id.indexOf('down')+1){
			console.log(asses);
			for(i=0;i<asses.length;i++){
				startDownload('\ufeff' + asses[i].content, asses[i].name.replace(/\.[^.]*$/, '') + '.ass');
			}
		}else if(target.className.indexOf('full')+1){
			if (document.fullscreenEnabled || document.webkitFullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled) {
				//console.log(e);
				(function locateParent(obj){
					if(obj.parentNode.id.indexOf('name_')+1||obj.parentNode.id.indexOf('tpl')+1){
						if (obj.parentNode.requestFullscreen) switchFullScr(obj.parentNode);
						else if (obj.parentNode.webkitRequestFullscreen) switchFullScr(obj.parentNode);
						else if (obj.parentNode.mozRequestFullScreen) switchFullScr(obj.parentNode);
						else if (obj.parentNode.msRequestFullscreen) switchFullScr(obj.parentNode);
						return
					}
					locateParent(obj.parentNode)
				})(target);
			}else swal('您使用的浏览器可能并不支持全屏！')
		}else if(target.id.indexOf('show')+1){
			console.log(config);
		}
	};
});
var switchFullScr = function(obj){
	if(obj.fullScr){
		if (document.exitFullscreen) document.exitFullscreen();
		else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
		else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
		else if (document.msExitFullscreen) document.msExitFullscreen();
		obj.fullScr = false;
	}else{
		if (obj.requestFullscreen) obj.requestFullscreen();
		else if (obj.webkitRequestFullscreen) obj.webkitRequestFullscreen();
		else if (obj.mozRequestFullScreen) obj.mozRequestFullScreen();
		else if (obj.msRequestFullscreen) obj.msRequestFullscreen();
		obj.fullScr = true;
	}
};
var matchV4Style = function(cc1,cc2){
	var reg = new RegExp(/(?=style).*:.*/,"gi");
	return console.log(cc1.match(reg));
};
var matchStyle = function(assStyle){
	switch (assStyle) {
		case 'PlayResX': return "width";
		case 'PlayResY': return "height";
	}
};
var matchAgain = function (text,regex) {                      //从一行中提取数字
	var reg = new RegExp(regex,"gi");
	return text.toString().match(reg)||0;
};
var pushChange = function(num,name,title){
	//console.log(title);
	var temp = document.getElementById(name);
	temp.children[0].style[title] = num+'px'
};
// Handle keyboard controls
var keysDown = {};
addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
	if(e.target.focusInput){
		if (38 in keysDown ) { // Player holding up || w
			e.target.value++;
			pushChange(e.target.value,e.target.name,e.target.title)
		}
		if (40 in keysDown ) { // Player holding down || s
			e.target.value--;
			pushChange(e.target.value,e.target.name,e.target.title)
		}
	}
}, false);
addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);