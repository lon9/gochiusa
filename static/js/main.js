$(function(){
  var APIKey = "AIzaSyAAukKB5vKPiD7RcbTdTCCgwm1CNHGAGoQ";
  var YouTubeURL = "https://www.googleapis.com/youtube/v3/search";
  var GochiusaURL = "https://gochiusa-button.herokuapp.com/count";

  var finishVideoLoad = false;
  var finishGetCount = false;

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
  var socket = io.connect('http://localhost:3000');
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
