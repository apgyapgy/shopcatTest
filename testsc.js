var user = window.localStorage['user']?window.localStorage['user']:'';
var areaid = window.localStorage['areaid']?window.localStorage['areaid']:'';//小区
var shopid = window.localStorage['shopid']?window.localStorage['shopid']:'';//店铺
var areaname = window.localStorage['areaname']?window.localStorage['areaname']:'';
var shopname = window.localStorage['shopname']?window.localStorage['shopname']:'';
var _cats = {};
showList();
$("#user1").click(function(){
	user = '15316117950';
	showList();
	window.localStorage['user'] = user;
	$(this).addClass("active").siblings().removeClass("active");
});
$("#user2").click(function(){
	user = '13625625040';
	showList();
	window.localStorage['user'] = user;
	$(this).addClass("active").siblings().removeClass("active");
});
$(".header").on("click",'.area',function(){
	$(this).addClass("active").siblings().removeClass("active");
	var _id = $(this).attr("data-id");
	console.log("areaid:",_id);
	areaid = _id;
	window.localStorage['areaid'] = _id;
	showShop();
});
$(".shops").on("click",'.shop',function(){
	$(this).addClass("active").siblings().removeClass("active");
	var _id = $(this).attr("data-id");
	shopid = _id;
	window.localStorage['shopid'] = _id;
	showGoods();
});
$("#con").on("click",'li .add',function(){
	var _goodid = $(this).parent().attr("data-id");
	var _goodname = $(this).siblings('p').html();
	var imgurl = $(this).siblings('img').attr("href");
	var _price = $(this).siblings(".price").html();
	var _data = {
		id:_goodid,
		name:_goodname,
		imgurl:imgurl,
		price:_price
	}
	window.localStorage.good = JSON.stringify(_data);
	//console.log("good:",window.localStorage.good);
	addShopCat(user,areaid,shopid,_goodid);
});
$("#con").on("click","li .sub",function(){
	var _id = $(this).parent().attr("data-id");
	subShopCat(user,areaid,shopid,_id);
});
function showList(){//显示小区
	var _catOfUser = cat[user];
	if(_catOfUser){
		var _aid = '';
		var _headstr = '小区:';
		for(var key in _catOfUser){
			//console.log("key:",key);
			if(!_aid){
				_aid = key;
				areaid = key;
				areaname = _catOfUser[key].name;
				window.localStorage['areaname'] = areaname;
				window.localStorage['areaid'] = key;
			}
			_headstr += '<button class="area" data-id="'+key+'">'+_catOfUser[key].name+'</button>'
		}
		$("#content .header").html(_headstr);
		showShop();
	}
}
function showShop(){//显示店铺
	var _catOfArea = cat[user][areaid].shops;
	if(_catOfArea){
		var _shopid = '';
		var _str = '';
		for(var key in _catOfArea){
			if(!_shopid){
				_shopid = _catOfArea[key].id;
				shopid = _shopid;
				window.localStorage['shopid'] =  _shopid;
			}
			_str += '<button class="shop" data-id="'+_catOfArea[key].id+'">'+_catOfArea[key].name+'</button>';
		}
		$("#content .shops").html(_str);
		showGoods();
	}
	
}
function showGoods(){	
	//console.log(cat[user][areaid]['shops']);
	var _catOfShop = cat[user][areaid]['shops'];
	var _goods;
	for(var key in _catOfShop){
		if(_catOfShop[key].id == shopid){
			_goods = _catOfShop[key]['goods'];
			shopname = _catOfShop[key].name;
			window.localStorage['shopname'] = shopname;
			break;
		}
	}
	if(_goods){
		var str = "";
		for(var key in _goods){
			str += '<li data-id="'+_goods[key]['id']+'">'
				+'<img src="'+_goods[key]['imgurl']+'" alt="">'
				+'<p>'+_goods[key]['name']+'</p>'
				+'<b class="price">单价：'+_goods[key]['price']+'</b>'
				+'<b class="num">  数量：'+_goods[key]['num']+'</b>'
				+'<span class="add">+</span>'
				+'<span class="sub">-</span>'
				+'</li>';
		}
		$("#con").html(str);
	}			
}
function subShopCat(_userid,_areaid,_shopid,_goodid){//购物车商品减1
	console.log("剁手第一步，先减一个商品");
	var _cat = window.localStorage['cat']?JSON.parse(window.localStorage['cat']):{};
	var _shopIndex = getShopIndex(_userid,_areaid,_shopid);
	console.log("shopIndex:",_shopIndex);
	if(_shopIndex != -1){
		var _goodIndex = getGoodIndex(_userid,_areaid,_shopIndex,_goodid);
		if(_goodIndex != -1){
			var _num = _cat[_userid][_areaid]['shops'][_shopIndex]['goods'][_goodIndex].num;
			console.log("num:",_num);
			if(_num > 1){
				_cat[_userid][_areaid]['shops'][_shopIndex]['goods'][_goodIndex].num--;
			}else{
				console.log("就一件商品了，减啥呢，删了吧。")
				_cat[_userid][_areaid]['shops'][_shopIndex]['goods'].splice(_goodIndex,1);
				if(!_cat[_userid][_areaid]['shops'][_shopIndex]['goods'].length){//如果这个店铺没有商品了，就把店铺删除
					console.log("店铺都成空店了，卖了吧，卖了吧")
					_cat[_userid][_areaid]['shops'].splice(_shopIndex,1);
					if(!_cat[_userid][_areaid]['shops'].length){
						console.log("小区都没店铺了，也卖了吧");
						delete _cat[_userid][_areaid];
						if(JSON.stringify(_cat[_userid]) == '{}'){
							delete _cat[_userid];
						}
					}
				}
			}
		}else{
			console.log("这件宝贝你还没加呢。");
		}
		//console.log(_userid,_areaid,_shopIndex,_goodid,_goodIndex);
		
	}else{
		console.log("这个店铺的东西还没装入购物车哦");
	}
	console.log("减1个:",_cat);
	window.localStorage['cat'] = JSON.stringify(_cat);	
}
//添加购物车
function addShopCat(_userid,_areaid,_shopid,_goodid){
	var _cat = window.localStorage['cat']?JSON.parse(window.localStorage['cat']):{};
	var _good = JSON.parse(window.localStorage['good']);
	window.localStorage.removeItem('good');
	//还无购物车信息
	if(!_cat){
		console.log("还未存储数据呢");
		_cat[_userid] = {
			[_areaid]:{
				name:areaname,
				shops:[
					{
						id:_shopid,
						name:shopname,
						url:'',
						goods:[
							{
								id:_goodid,
								name:_good.name,
								num:1,
								price:_good.price,
								selected:false,
								imgurl:''
							}
						]
					}
				]
			}
		}
	}else{
		if(!_cat[_userid]){
			console.log("什么都没有");
			_cat[_userid] = {
				[_areaid]:{
					name:areaname,
					shops:[
						{
							id:_shopid,
							name:shopname,
							url:'',
							goods:[
								{
									id:_goodid,
									name:_good.name,
									num:1,
									price:_good.price,
									selected:false,
									imgurl:''
								}
							]
						}
					]
				}
			}
		}else if(!_cat[_userid][_areaid]){
			_cat[_userid][_areaid] = {
				name:areaname,
				shops:[]
			};
			_cat[_userid][_areaid]['shops'].push({
							id:_shopid,
							name:shopname,
							url:'',
							goods:[
								{
									id:_goodid,
									name:_good.name,
									num:1,
									price:_good.price,
									selected:false,
									imgurl:''
								}
							]
						});
			console.log('该用户在该小区没有存数据');
		}else if(getShopIndex(_userid,_areaid,_shopid)==-1){
			_cat[_userid][_areaid]['shops'] .push({
							id:_shopid,
							name:shopname,
							url:'',
							goods:[
								{
									id:_goodid,
									name:_good.name,
									num:1,
									price:_good.price,
									selected:false,
									imgurl:''
								}
							]
						});
			console.log("该用户在该小区没有存这家店铺，这很尴尬。")
		}else{
			var _shopIndex = getShopIndex(_userid,_areaid,_shopid);
			var _goodIndex = getGoodIndex(_userid,_areaid,_shopIndex,_goodid);
			if(_goodIndex == -1){
				var _data = {
					id:_good.id,
					name:_good.name,
					num:1,
					price:_good.price,
					selected:false,
					imgurl:_good.imgurl
				}
				_cat[_userid][_areaid]['shops'][_shopIndex]['goods'].push(_data);
				console.log("找到庙，没找到和尚");
			}else{
				_cat[_userid][_areaid]['shops'][_shopIndex]['goods'][_goodIndex].num++;
				console.log("找到和尚了，那就加1吧")
			}
		}
	}
	console.log("cat:",_cat);
	window.localStorage['cat'] = JSON.stringify(_cat);
}
function getShopIndex(_userid,_areaid,_shopid){
	var _cat = JSON.parse(window.localStorage['cat']);
	var _id = -1;
	var _shops = _cat[_userid][_areaid].shops;
	if(!_shops){
		return -1;
	}
	for(var i = 0;i<_shops.length;i++){
		if(_shops[i].id == _shopid){
			return i;
		}
	}
	return -1;
}
function getGoodIndex(_userid,_areaid,_shopIndex,_goodid){
	var _cat = JSON.parse(window.localStorage['cat']);
	var _id = -1;
	//console.log("index:",_shopIndex);
	//console.log(_cat[_userid][_areaid]['shops'][_shopIndex]);
	var _goods = _cat[_userid][_areaid]['shops'][_shopIndex]['goods'];
	//console.log("goods:",_goods);
	if(!_goods){
		return -1;
	}
	for(var i = 0;i<_goods.length;i++){
		if(_goods[i].id == _goodid){
			return i;
		}
	}
	return -1;
}

//添加购物车 无、有
//减少 多于1，小于等于1
//购物车页面 选中、未选中


