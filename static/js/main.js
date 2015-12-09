$(function(){
  var APIKey = "AIzaSyAAukKB5vKPiD7RcbTdTCCgwm1CNHGAGoQ";
  var YouTubeURL = "https://www.googleapis.com/youtube/v3/search";
  var GochiusaURL = "https://gochiusa-button.herokuapp.com/count";
  var WebSocketURL = "https://gochiusa-button.herokuapp.com";

  var finishVideoLoad = false;
  var finishGetCount = false;

  var mobileImageURLs = [
    "http://livedoor.blogimg.jp/anihonet/imgs/b/8/b81abec0-s.jpg",
    "http://pic.prepics-cdn.com/yuka09166190/33027011.jpeg",
    "https://divnil.com/wallpaper/iphone5s/img/app/1/3/1392_744_goichiusa_107_9b7370be5cbe06423c83c1e673d6b17c_raw.jpg",
    "http://pic.prepics-cdn.com/animealbum/36279839.jpeg",
    "https://divnil.com/wallpaper/iphone5s/img/app/2/0/201406241903502c9_72a723c77485f12560d4951f9cd2f3ac_raw.jpg",
    "http://blog-imgs-65.fc2.com/h/a/t/hatsunemiku1006/201406241859522f4.jpg",
    "http://blog-imgs-65.fc2.com/h/a/t/hatsunemiku1006/20140624185951fb1.jpg",
    "http://pic.prepics-cdn.com/orderrabbit/32552177.jpeg",
    "http://www.gochiusa.com/core_sys/images/main/cont/news/sp_v/960/syaro.jpg"
  ];

  var tabletImageURLs = [
    "http://livedoor.blogimg.jp/shachiani/imgs/a/e/aedfc928.jpg",
    "http://blog-imgs-65.fc2.com/h/a/t/hatsunemiku1006/201406241903482c5.jpg",
    "http://blog-imgs-65.fc2.com/h/a/t/hatsunemiku1006/20140624190346915.jpg",
    "http://blog-imgs-65.fc2.com/d/g/d/dgdg875/anime_wallpaper_Gochumon_wa_Usagi_Desu_ka_Hoto_Kokoa_Kafuu_Chino_Natsu_Megumi-77886.png"
  ];

  if(_ua.Mobile || _ua.Tablet){
    finishVideoLoad = true;
    if(_ua.Mobile){
      $('body').css('background-image', 'url(' + mobileImageURLs[Math.floor(Math.random() * mobileImageURLs.length)] + ')');
    }else if(_ua.Tablet){
      $('body').css('background-image', 'url(' + tabletImageURLs[Math.floor(Math.random() * tabletImageURLs.length)] + ')');
    }
  }

  // Ajax
  $.ajax({
    type:"GET",
    url:YouTubeURL,
    dataType:"json",
    crossDomain:true,
    contentType:"application/json",
    data:{
      key:APIKey,
      q:"ご注文はうさぎですか? OR ご注文はうさぎですか??",
      part:"id",
      maxResults:50,
      type:"video",
      videoDefinition:"high"
    },
    success:function(data){
      console.log(data);
      var videos = [];
      for(var i=0; i<data.items.length; i++){
        videos.push({
          videoURL:data.items[i].id.videoId,
          quality:'large',
          opacity:1,
          autoPlay:true,
          startAt:0,
          loop:true,
          containment:'body',
          mute:false,
          showControls: false,
          optimizeDisplay: true
        });
      }
      $('.player').YTPlaylist(videos, true);
    }
  });

  // カウントを取得
  $.ajax({
    type:"GET",
    url:GochiusaURL,
    dataType:'json',
    crossDomain: true,
    contentType:'application/json',
    success:function(data){
      console.log(data);
      $('.count').text(data.count);
      finishGetCount = true;
      if(finishVideoLoad){
        ready();
      }
    }
  });

  $('.player').on('YTPStart', function(e){
    finishVideoLoad = true;
    if(finishGetCount){
      ready();
    }
  })

  function ready(){
    $('.loading').hide();
    $('.player').show();
    $('.container').show();
  }

  // WebSocket
  var socket = io.connect(WebSocketURL);
  socket.on('connect', function(){
    socket.on('count', function(data){
      nicoscreen.add("あぁ^～心がぴょんぴょんするんじゃぁ^～");
      $('.count').text(data.count); 
    });
  });

  // サーバとのコネクション確立まで表示を消す
  $('.player').hide();
  $('.container').hide();

  // フィルターセット
  var filters = {
    blur:5
  };
  $('.player').YTPApplyFilters(filters);

  // コメントセット
  nicoscreen.set({
    base:{
      color:"pink",
      speed:"normal",
      interval:"normal",
      font_size:"50px",
      loop:true
    },
    comments:[]
  });
  nicoscreen.start();

  // コメントのボーダーを消す
  $('#nicoscreen').css("border", "none");

  // ボタンクリック
  $('.show').click(function(){
    socket.emit('pyon');
  });

  // リサイズした時にコメントを初期化する
  var timer = false;
  $(window).resize(function(){
    if(timer !== false){
      clearTimeout(timer);
    }
    timer = setTimeout(function(){
      console.log('resized');
      nicoscreen.start();
    }, 200);
  });
});
