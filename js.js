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
					obj.name = file.name.replace(/\.[^.]*$/, '');
					obj.PlayResX = parseInt(matchAgain(matchAgain(reader.result,/(?=PlayResX).*/),/\d+/));
					obj.PlayResY = parseInt(matchAgain(matchAgain(reader.result,/(?=PlayResY).*/),/\d+/));
					obj.content = reader.result;
					obj.style = [];
				//ass中段[V4+ Styles]区
					var tempStyle = matchAgain(reader.result,/[^\w](?=style).*:.*/);
					var tempStyleHead = matchAgain(reader.result,/(?=format).*:.*Encoding/);
					var tempStyleHeadArr = tempStyleHead[0].replace(/format.*:\s*/i,'').match(/[^,|\s]+?(?=,)|\w+$/g);
					for(i=0;i<tempStyle.length;i++){
						var objStyle = {};
						for(j=0;j<tempStyleHeadArr.length;j++){
							objStyle[tempStyleHeadArr[j]] = (tempStyle[i].replace(/style.*:\s*/i,'').match(/[^,|\s]+?(?=,)|\d+$/g))[j]
						}
						obj.style.push(objStyle);
					}
					config.push(obj);
				//克隆示例备用
					var tpl=document.getElementById("tpl");
					var cln=tpl.cloneNode(true);
					//tpl.style.display = 'none';
					var inputAll = [];
				//输入框装填
					for(x in obj){
						if(x == 'name'){
							cln.id = x + '_' + obj.name.replace(/\.[^.]*$/, '');
							continue
						}else if(x == 'content') continue;
					//字幕样式装填
						if(x == 'style'){
							for(y in obj.style[0]){
								var inputStyle = document.createElement('input');
								inputStyle.type = 'text';

								inputStyle.value = obj.style[0][y];

								inputStyle.addEventListener('focus',function(){
									this.focusInput = true;
								});
								inputStyle.addEventListener('blur',function(){
									this.focusInput = false;
								});

								inputStyle.id = y + '_' + obj.name.replace(/\.[^.]*$/, '') + '_style_0';
								inputStyle.title = matchStyle(y);
								inputStyle.name = obj.name.replace(/\.[^.]*$/, '');
								inputAll.push(inputStyle);
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
						input.id = x + '_' + obj.name.replace(/\.[^.]*$/, '');
						input.title = matchStyle(x);
						input.name = obj.name.replace(/\.[^.]*$/, '');
						inputAll.push(input);
					}
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
			for(i=0;i<config.length;i++){
				var pushConfig = function(obj){
					var temp = obj.content.replace(/PlayResX.*/i,'PlayResX:'+config[i].PlayResX);
					temp = temp.replace(/PlayResY.*/i,'PlayResY:'+config[i].PlayResY);
					var s0 = obj.style[0];
					var pushStyle = function(styleText){
						var bTemp = styleText.replace(/ /g,'').split(/,/);
						var strTemp = 'Style:';
						for(j=0;j<bTemp.length;j++){
							j==0?void(0):strTemp +=',';
							strTemp +=s0[bTemp[j]];
						}
						return strTemp
					};
					var str = pushStyle(' Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding');
					console.log(str);
					temp = temp.replace(/style:.*,.*/i,str);
					return temp
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
	for(var i=0;i<config.length;i++){
		if(config[i].name == name) config[i].style[0][id.split("_")[0]] = num
	}
	var sub = document.getElementById('name_'+name);
	var tempPlayResY = document.getElementById('PlayResY_'+id.split("_")[1]);
	var tempFontsize = document.getElementById('Fontsize_'+id.split("_")[1]+'_style_0');
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
				obj.style[title] = ((sub.clientHeight*num)/tempPlayResY.value)+'px';
				return
			}
			if(id.indexOf('PlayResY_')+1){
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