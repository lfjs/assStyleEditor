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

window.addEventListener('load', function () {
	document.onclick = function(e){
		var evt = e || window.event;
		var target = evt.target || evt.srcElement;
		console.log(target.id);
		if(target.id.indexOf('down')+1){
			startDownload

		}
	};

		var upload = document.querySelector('#file');
	upload.addEventListener('change', function () {
		var files = upload.files;
		var name = [];
		var res = [];
		for(i=0;i<files.length;i++){
			name.push(files[i].name);
		}
		function readAndPreview(file) {
			// 确保 `file.name` 符合我们要求的扩展名
			if (/\.(ass)$/i.test(file.name) ) {
				var reader = new FileReader();
				reader.addEventListener("load", function () {
					res.push(reader);
					//console.log(reader.result)
					var node = document.createElement('PRE');
					node.innerText = reader.result;
					document.getElementsByTagName('body')[0].appendChild(node)
				}, false);
				reader.readAsText(file);
			}else swal('请选择扩展名为“*.ass”的文件！')
		}
		if (files) {
			[].forEach.call(files, readAndPreview);
		}
			//console.log(res);
		//upload.value = '';
	})
});