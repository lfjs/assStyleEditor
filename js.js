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
var config = [];
window.addEventListener('load', function () {
	var upload = document.querySelector('#file');
	upload.addEventListener('change', function () {
		var files = upload.files;
		function readAndPreview(file) {
			if (/\.(ass)$/i.test(file.name) ) {			// 确保 `file.name` 符合我们要求的扩展名
				var reader = new FileReader();
				reader.addEventListener("load", function () {
				//ass开头[Script Info]区
					var obj = {};
					obj.name = file.name.replace(/\.ass$/, '');
					obj.sn = obj.name.replace(/[^\w]/g, '_');
					obj.PlayResX = parseInt(matchAgain(matchAgain(reader.result,/(?=PlayResX).*/),/\d+/));
					obj.PlayResY = parseInt(matchAgain(matchAgain(reader.result,/(?=PlayResY).*/),/\d+/));
					obj.content = reader.result;
					obj.style = [];
				//ass中段[V4+ Styles]区
					var tempStyle = matchAgain(reader.result,/[^\w](?=style).*:.*/);
					var tempStyleHead = matchAgain(reader.result,/(?=format).*:.*Encoding/);
					var tempStyleHeadArr = tempStyleHead[0].replace(/format.*:\s*/i,'').match(/[^,|\s]+?(?=,)|\w+$/g);
					for(var i=0;i<tempStyle.length;i++){
						var objStyle = {};
						for(var j=0;j<tempStyleHeadArr.length;j++){
							objStyle[tempStyleHeadArr[j]] = (tempStyle[i].replace(/(style.*:\s*|\s)/gi,'').match(/[^,]+?(?=,)|\d+$/g))[j]
						}
						obj.style.push(objStyle);
					}
					config.push(obj);
				//克隆示例备用
					var tpl=document.getElementById("tpl");
					var cln=tpl.cloneNode(true);
					//tpl.style.display = 'none';
					var inputAll = [];
					var radioAll = document.createElement('div');
				//输入框装填
					for(x in obj){
						if(x == 'name'){
							cln.id = 'name_' + obj.sn;
							continue
						}else if(x == 'content') continue;
					//字幕样式装填
						if(x == 'style'){
							for(var z=0;z<obj.style.length;z++) {
								var styleZ = document.createElement('div');
								styleZ.id = obj.sn + '_style_'+obj.style[z].Name.replace(/\s/,'');
								//styleZ.className = obj.sn + '_style';
								styleZ.className = obj.sn + '_style';
								var radioZ = document.createElement('input');
								radioZ.type = 'radio';
								radioZ.onclick = function(e){
									var styleSet = document.getElementsByClassName(obj.sn + '_style');
									for(var i=0;i<styleSet.length;i++){
										styleSet[i].style.display = 'none';
										if(styleSet[i].id == (obj.sn+'_style_'+e.target.value)){
											styleSet[i].style.display = '';
											for(var j=0;j<styleSet[i].children.length;j++){
												pushChange(styleSet[i].children[j].value, styleSet[i].children[j].name, styleSet[i].children[j].title, styleSet[i].children[j].id)
											}
										}
									}
								};
								radioZ.value = obj.style[z].Name.replace(/\s/,'');
								radioZ.name =  obj.sn + '_style';
								var divZ = document.createElement('span');
								divZ.innerText = obj.style[z].Name.replace(/\s/,'');
								var labelZ = document.createElement('label');
								labelZ.appendChild(radioZ);
								labelZ.appendChild(divZ);
							//字幕样式输入框
								for (y in obj.style[z]) {
									var inputStyle = document.createElement('input');
									inputStyle.type = 'text';
									inputStyle.value = obj.style[z][y];
									inputStyle.addEventListener('focus', function () {
										this.focusInput = true;
									});
									inputStyle.addEventListener('blur', function () {
										this.focusInput = false;
										pushChange(this.value, this.name, this.title, this.id)
									});
									inputStyle.id = y + '_' + obj.sn + '_style_'+z;
									inputStyle.title = matchStyle(y);
									inputStyle.name = obj.sn;
									//inputAll.push(inputStyle);
									styleZ.appendChild(inputStyle);
								}
								inputAll.push(styleZ);
								radioAll.appendChild(labelZ);
							//载入默认显示default
								(obj.style[z].Name.indexOf('Default')+1)>0?radioZ.click():styleZ.style.display = 'none';
							}
							continue;
						}
					//文件基本宽高
						var input = document.createElement('input');
						input.type = 'text';
						input.value = obj[x];
						input.addEventListener('focus',function(){
							this.focusInput = true;
						});
						input.addEventListener('blur',function(){
							this.focusInput = false;
						});
						input.id = x + '_' + obj.sn;
						input.title = matchStyle(x);
						input.name = obj.sn;
						inputAll.push(input);
					}
					cln.children[0].children[1].children[0].appendChild(radioAll);
					for(i=0;i<inputAll.length;i++){
						cln.children[0].children[1].children[0].appendChild(inputAll[i]);
					}
				//定位修饰字幕元素
					;(function locateChild(parentObj){
						if(parentObj.id.indexOf('sub')+1){
							parentObj.id = 'sub_' + file.name.replace(/\.[^.]*$/, '');
							//先娶第一个样式测试
							for(x in obj.style[0]){
								//字幕字号适应元素尺寸
								if(x.indexOf('Fontsize')+1){
									parentObj.style[matchStyle(x)] = ((tpl.clientHeight*obj.style[0][x])/obj.PlayResY)+'px';
									continue
								}
								//定义描边样式
								if(x == 'Outline'){
									(function locateChildA(locateObj){
										if(locateObj.className.indexOf('stroke')+1){
											locateObj.style[matchStyle(x)] = obj.style[0][x] *2 +'px';
											return
										}
										if(locateObj.children.length == 0) return;
										for(j=0;j<locateObj.children.length;j++){
											locateChildA(locateObj.children[j])
										}
									})(parentObj);
									continue
								}
								//描边颜色
								if(x == 'OutlineColour'){
									(function locateChildA(locateObj){
										if(locateObj.className.indexOf('stroke')+1){
											var rgb = obj.style[0][x].match(/.{2}/g);
											locateObj.style[matchStyle(x)] = '#'+rgb[4]+rgb[3]+rgb[2];
											locateObj.style.opacity = ((256-parseInt(rgb[1],16))*(1/256)).toFixed(2);
											return
										}
										if(locateObj.children.length == 0) return;
										for(j=0;j<locateObj.children.length;j++){
											locateChildA(locateObj.children[j])
										}
									})(parentObj);
									continue
								}
								parentObj.style[matchStyle(x)] = parseInt(obj.style[0][x])?obj.style[0][x]+'px': obj.style[0][x]
							}
							return
						}
						if(parentObj.children.length == 0) return;
						for(var i=0;i<parentObj.children.length;i++){
							locateChild(parentObj.children[i])
						}
					})(cln);
					document.getElementsByTagName('body')[0].appendChild(cln);
				}, false);
				reader.readAsText(file);
			}else swal('请选择扩展名为“*.ass”的文件！')
		}
		if (files) {
			[].forEach.call(files, readAndPreview);
		}
		//upload.value = '';
	});
//点击事件
	document.onclick = function(e){
		var evt = e || window.event;
		var target = evt.target || evt.srcElement;
		//target.id?console.info(target.id):0;
	//下载
		if(target.id.indexOf('down')+1){
			console.log(config);
			for(var i=0;i<config.length;i++){
				var pushConfig = function(obj){
					var contentTemp = obj.content.replace(/PlayResX.*/i,'PlayResX:'+config[i].PlayResX);
					contentTemp = contentTemp.replace(/PlayResY.*/i,'PlayResY:'+config[i].PlayResY);
					//var s0 = obj.style[0];
					var pushStyle = function(styleText){
						var bTemp = styleText.replace(/ /g,'').split(/,/);
						var strTemp = '';
						for(var k=0;k<obj.style.length;k++) {
							strTemp += '\r\nStyle:';
							for (var j = 0; j < bTemp.length; j++) {
								j == 0 ? void(0) : strTemp += ',';
								strTemp += obj.style[k][bTemp[j]];
							}
						}
						return strTemp
					};
					var str = pushStyle(' Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding');
					console.log(str);
					//contentTemp = contentTemp.replace(/style:.*,.*/gi,str);
					contentTemp = contentTemp.replace(/[^.](?=style).*:.*,.*/gi,'');
					contentTemp = contentTemp.replace(/((?=format).*:.*Encoding)/gi,"$1"+str);
					return contentTemp
				};
				console.log('\ufeff' + pushConfig(config[i]));
				startDownload('\ufeff' + pushConfig(config[i]), config[i].name.replace(/\.[^.]*$/, '') + '.ass');
			}
	//全屏
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
			}else swal('您使用的浏览器可能并不支持全屏！');
	//
		}else if(target.id.indexOf('show')+1){
			console.log(config);
			if(config.length > 1){
				for(var i=1;i<config.length;i++){
					console.log(isObjectValueEqual(config[0].style[0],config[i].style[0]))
				}
			}
		}
	};
});
var matchStyle = function(assStyle){
	switch (assStyle) {
		case 'PlayResX': return "width";
		case 'PlayResY': return "height";
		//迷幻的Fontsize，貌似跟字体有关，屏幕测量与数值永远不符
		case 'Fontsize': return "fontSize";
		case 'Fontname': return "fontFamily";
		//描边程度：严格按照PlayResY比例，数值就是从文字出发草描边结束的单方向偏移距离，text-stroke-width是双向偏移
		case 'Outline': return "-webkit-text-stroke-width";
		case 'OutlineColour': return "-webkit-text-stroke-color";
	}
};
//全屏切换
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
//从一行中提取数字
var matchAgain = function (text,regex) {
	var reg = new RegExp(regex,"gi");
	return text.toString().match(reg)||0;
};
//
var pushChange = function(num,name,title,id){
//获取style名
	var styleName = document.getElementById(id.replace(/^.*?_/,'Name_'));

	if(styleName){
		for(var i=0;i<config.length;i++){
			for(var j=0;j<config[i].style.length;j++) {
				if (config[i].name == name&&(config[i].style[j].Name.replace(/\s/g,'') == styleName.value)) {
					config[i].style[j][id.split("_")[0]] = num
				}
			}
		}
	}else{
		for(var k=0;k<config.length;k++){
			if (config[k].name == name) config[k][id.split("_")[0]] = num
		}
	}
	var sub = document.getElementById('name_'+name);
	;(function locateChild(obj){
		if(obj.className.indexOf('stroke')+1){
			if(id.indexOf('Outline_')+1){
				obj.style[title] = num *2 +'px';
				return
			}
			if(id.indexOf('OutlineColour_')+1){
				var rgb = num.match(/.{2}/g);
				obj.style[title] = '#'+rgb[4]+rgb[3]+rgb[2];
				obj.style.opacity = ((256-parseInt(rgb[1],16))*(1/256)).toFixed(2);
				return
			}
		}
		if(obj.id.indexOf('sub_')+1){
			if(id.indexOf('Fontname_')+1){
				obj.style[title] = num;
				return
			}
			if(id.indexOf('Fontsize_')+1){
				var tempPlayResY = document.getElementById('PlayResY_'+name);
				obj.style[title] = ((sub.clientHeight*num)/tempPlayResY.value)+'px';
				return
			}
			if(id.indexOf('PlayResY_')+1){
				var tempFontsize = document.getElementById('Fontsize_'+name+'_style_0');
				obj.style.fontSize = ((sub.clientHeight*tempFontsize.value)/num)+'px';
				return
			}
		}
		if(obj.children.length == 0) return;
		for(var i=0;i<obj.children.length;i++){
			locateChild(obj.children[i]);
		}
	})(sub);
};
// Handle keyboard controls
var keysDown = {};
addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
	if(e.target.focusInput){
		if (38 in keysDown ) { // Player holding up || w
			parseInt(e.target.value)||e.target.value == 0?++e.target.value:swErr();
			pushChange(e.target.value,e.target.name,e.target.title,e.target.id)
		}
		if (40 in keysDown ) { // Player holding down || s
			parseInt(e.target.value)||e.target.value == 0?--e.target.value:swErr();
			pushChange(e.target.value,e.target.name,e.target.title,e.target.id)
		}
		if (13 in keysDown ) { //enter
			//e.target.blur();
			pushChange(e.target.value,e.target.name,e.target.title,e.target.id)
		}
		if (27 in keysDown ) { //escape
			e.target.blur();
			pushChange(e.target.value,e.target.name,e.target.title,e.target.id)
		}
	}
}, false);
addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);
var swErr = function(){
	swal({
		title: "目前这玩意还不能上下选择",
		text: "这个框框一会会自己关闭",
		timer: 1500,
		button: "关！",
		icon: "error"
	});
};
var isObjectValueEqual = function (a, b) {
	// Of course, we can do it use for in
	// Create arrays of property names
	var aProps = Object.getOwnPropertyNames(a);
	var bProps = Object.getOwnPropertyNames(b);
	// If number of properties is different,
	// objects are not equivalent
	if (aProps.length != bProps.length) {
		return false;
	}
	for (var i = 0; i < aProps.length; i++) {
		var propName = aProps[i];
		// If values of same property are not equal,
		// objects are not equivalent
		if (a[propName] !== b[propName]) {
			return false;
		}
	}
	// If we made it this far, objects
	// are considered equivalent
	return true;
};