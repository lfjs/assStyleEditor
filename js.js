/**
 * Created by JS-3 on 2017/8/18.
 */
var gotFile = function (name, content) {
	var danmaku = parseFile(content);
	var ass = generateASS(setPosition(danmaku), {
		'title': document.title,
		'ori': name
	});
	startDownload('\ufeff' + ass, name.replace(/\.[^.]*$/, '') + '.ass');
};
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
					asses.push({'name':file.name,'content':reader.result});
					var node = document.createElement('PRE');
					node.innerText = reader.result;
					document.getElementsByTagName('body')[0].appendChild(node);
					var obj = {};
					obj.name = file.name;
					obj.PlayResX = parseInt(matchAgain(matchAgain(reader.result,/(?=PlayResX).*/),/\d+/));
					obj.PlayResY = parseInt(matchAgain(matchAgain(reader.result,/(?=PlayResY).*/),/\d+/));
					config.push(obj);
				}, false);
				reader.readAsText(file);
			}else swal('请选择扩展名为“*.ass”的文件！')
		}
		if (files) {
			[].forEach.call(files, readAndPreview);
		}
		console.log(asses);
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
		}else if(target.id.indexOf('show')+1){
			console.log(config);
		}
	};
});
var matchAgain = function (text,regex) {                      //从一行中提取数字
	var reg = new RegExp(regex,"g");
	return text.toString().match(reg)||0;
};
// Handle keyboard controls
var keysDown = {};
addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
	if(inP.focusInput){
		if (38 in keysDown ) { // Player holding up || w
			//console.log(e.keyCode)
			//console.log(inP.value++)
			inP.value++
		}
		if (40 in keysDown ) { // Player holding down || s
			//console.log(e.keyCode);
			inP.value--
		}
	}
}, false);
addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);
inP.addEventListener("focus", function (e) {
	this.focusInput = true;
	//console.log([inP])
});
inP.addEventListener("blur", function (e) {
	this.focusInput = false;
	//console.log([inP])
});