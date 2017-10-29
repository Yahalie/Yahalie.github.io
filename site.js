Application.SideMenu = {
    mainWrapper:false,
    init:function(){
        this.mainWrapper = $("#wrapper");
        $(".menu-toggle").on('click',function(e){
            e.preventDefault();
            Application.SideMenu.mainWrapper.toggleClass("toggled");
            return false;
        });
    }
};

Application.BootSize = {
    sizes : [768,992,1200],
    _curSize:0,
    _getSize:function() {Application.BootSize._curSize = window.innerWidth;},
    isXS:function(){
        return (Application.BootSize._curSize<Application.BootSize.sizes[0]);
    },
    isSM:function(){
        return (
            Application.BootSize._curSize>=Application.BootSize.sizes[0]
            && Application.BootSize._curSize<Application.BootSize.sizes[1]
        );
    },
    isMD:function(){
        return (
            Application.BootSize._curSize>=Application.BootSize.sizes[1]
            && Application.BootSize._curSize<Application.BootSize.sizes[2]
        );
    },
    isLG:function(){
        return (Application.BootSize._curSize>=Application.BootSize.sizes[2]);
    }
};

Application.ToMaxHeight = {
    max:0,
    init:function(elements,callback){
        setTimeout(function(){
            elements.css({height:'auto'});
            var isMax = false;
            elements.each(function() {
                if($(this).height() > Application.ToMaxHeight.max) {
                    Application.ToMaxHeight.max = $(this).height();
                }
            });
            elements.height(Application.ToMaxHeight.max);
            Application.isCallBack(callback);
        },250);
    }
};

var Scroll = {
    docHeight:window.innerHeight,
    curPosition:0,
    curBottomPosition:0,
    lastPosition:0,
    curDirection:false,
    setPosition: function(position){
        this.curPosition = position;
        this.curBottomPosition = Scroll.docHeight + this.curPosition;
        this.curDirection = (this.curPosition<this.lastPosition);
        this.lastPosition = this.curPosition;
    },
    isUp:  function(){return ( this.curDirection);},
    isDown:function(){return (!this.curDirection);},
    isVisible:function(x){ return (x>this.curPosition && x<this.curBottomPosition); },
    topPerc:function(x){return Math.round((x-this.curPosition)/(Scroll.docHeight/100));},
    bottomPerc:function(x){return 100-this.topPerc(x);}
};

Application.ScrollBlocks = {
    status:false,
    blocks:false,
    offset:60,
    init:function(blocks){

        Application.ScrollBlocks.blocks = blocks;
        Application.ScrollBlocks.status = Application.ScrollBlocks.blocks.length > 0;

        blocks.each(function(){
            $this = $(this);
            var ParentBlock = $this.parent();
            var MaxTop = ParentBlock.offset().top;
            var MaxBottom = ParentBlock.innerHeight() + ParentBlock.offset().top - Application.ScrollBlocks.offset - $this.outerHeight(true);
            //$(this).innerWidth($(this).innerWidth());
            $('.openedADcolumn').innerWidth(ParentBlock.parent().innerWidth() - ($('.openedShareColumn').innerWidth()+86*2) - $('.openedArticleColumn').innerWidth() - 15);

            $this.data('maxtop',MaxTop);
            $this.data('maxbot',MaxBottom);
            $this.data('padOffset',ParentBlock.offset().top+10);
        });
    },
    update:function(){
        if(Application.ScrollBlocks.status) {
            Application.ScrollBlocks.blocks.each(function(){
                $this = $(this);
                var Min = $this.data('maxtop');
                var Max = $this.data('maxbot');
                var padOffset = $this.data('padOffset');

                var NewPos = Min;

                if(Scroll.curPosition + Application.ScrollBlocks.offset > Min) {
                    $this.css({position:'absolute'});
                    NewPos = (Scroll.curPosition >= Max) ? Max - padOffset + Application.ScrollBlocks.offset : Scroll.curPosition - Min + Application.ScrollBlocks.offset;
                    $this.css({top:NewPos});
                } else {$this.css({position:'relative',top:0});}
            });
        }
    }
};

var ToUp = {
    action:function(){
        $('html, body').animate({scrollTop : 0});
    }
};

var zarDropTags = $('#zarDropTags');
var TagsInLoading = false;
var Page = 1;

zarDropTags.parent().on('scroll',function(){
    var scrollPercent = ($(this).scrollTop()) / (zarDropTags.height() - $(this).height());
    scrollPercent = Math.round(scrollPercent * 100);

    if(scrollPercent>90 && !TagsInLoading) {
        TagsInLoading = true;
        Page++;
        Application.AjaxAction('ajp','loadTags',{page:Page},function(){
            var newTags = Application.Ajax.Data('tags');
            if(newTags.length) {
                for(var i = 0; i<newTags.length; i++)
                {
                    var CurTag = newTags[i];
                    zarDropTags.append('<li><a data-url="' + CurTag.url + '" class="Halvetica" href="/search/?tag=' + CurTag.url + '">' + CurTag.name + '</a></li>');
                }
                TagsInLoading = false;
            }
        });
    }
});

var stagName = $('#stagName');
var tagSearchInpJs = $('#tagSearchInpJs');

zarDropTags.on('click','>li>a',function(e){
    if($('#searchInputHeaderN').val().trim().length) {
        e.preventDefault();
        $this = $(this);
        stagName.text($this.text());
        tagSearchInpJs.val($this.data('url'));
        $('#zzdfert').dropdown('toggle');
        $('#searchInputHeaderN').closest('form').submit();
        return false;
    }
});

$('#startSearch').on('click',function(){
    $('#omnSearch').toggleClass('opened');
    $('.searchHeader').animate({top:0},150);
});

$('#omnSearch').on('click',function(){
    $('#omnSearch').removeClass('opened');
    $('.searchHeader').animate({top:-80},50);
});

$('#closeSearchBtn').on('click',function(){
    $('#omnSearch').removeClass('opened');
    $('.searchHeader').animate({top:-80},50);
});

var QuoteImgPop = {

    _popup: false,
    _curLi: false,
    delTimer:false,
    showTimer:false,
    delFor:false,
    boottomOutSet: 10,

    init:function()
    {
        QuoteImgPop._popup = $('#QuoteImgPop');
        $(document).on('mouseenter','.save-as-img',function(){ QuoteImgPop.action(this); });
        $(document).on('mouseup','.selForPopup',function(){
            var txt = '';
            if (window.getSelection) {
                txt = window.getSelection();
            } else if (document.getSelection) {
                txt = document.getSelection();
            } else if (document.selection) {
                txt = document.selection.createRange().text;
            }
            if(String(txt).length) {
                var node = document.selection ? document.selection.createRange().parentElement() : window.getSelection().focusNode.parentNode;
                QuoteImgPop.action(node);
            }
        });

        $(document).on('mouseenter tap', '.quotesList>li',function(){QuoteImgPop.setHoverCls($(this));});
        $(document).on('mouseleave', '.quotesList>li',function(){QuoteImgPop.delHoverCls($(this));});

        QuoteImgPop._popup.on('mouseenter',function(){QuoteImgPop.setHoverCls(QuoteImgPop._curLi);});
        QuoteImgPop._popup.on('mouseleave',function(){QuoteImgPop.delHoverCls(QuoteImgPop._curLi);});
    },

    delHoverCls:function(elem){
        if(elem.length) {
            if(QuoteImgPop.delTimer != false) { clearTimeout(QuoteImgPop.delTimer); }
            QuoteImgPop.delFor = elem.data('forid');
            QuoteImgPop.delTimer = setTimeout(function(){
                elem.removeClass('hover');
                QuoteImgPop.disable();
            },100);
        }
    },
    setHoverCls:function(elem){
        if(QuoteImgPop.delTimer != false && elem.length && elem.data('forid') == QuoteImgPop.delFor) { clearTimeout(QuoteImgPop.delTimer); }
        if(elem.length && !elem.hasClass('hover')) {
            elem.addClass('hover');
        }
    },

    getPosition:function(elem)
    {
        var Pos = elem.offset();

        var Left = Pos.left + elem.outerWidth();
        var Top = Pos.top; //elem.outerHeight(true)

        if(Top + QuoteImgPop._popup.outerHeight() + QuoteImgPop.boottomOutSet > Scroll.curBottomPosition) {
            Top = Scroll.curBottomPosition - QuoteImgPop._popup.outerHeight() - QuoteImgPop.boottomOutSet;
        }

        Top = (!Top) ? -5000 : Top;
        Left = (!Left) ? -5000 : Left;

        return {top:Top,left:Left};
    },
    action:function(elem)
    {
        QuoteImgPop._curLi = $(elem).closest('li');
        var Article = QuoteImgPop._curLi.find('>article');
        var ShowBtn = QuoteImgPop._curLi.find('.save-as-img');

        if(QuoteImgPop.showTimer !=false) { clearTimeout(QuoteImgPop.showTimer); }

        QuoteImgPop.showTimer = setTimeout(function(){
            var ShareData = QuoteImgPop._curLi.find('.ImgSharing>input');
            if(ShareData.length) {
                QuoteImgPop._popup.offset(QuoteImgPop.getPosition(ShowBtn));

                var ImgLnk = ShareData.filter('.imgLink').val();
                var ImgID = ShareData.filter('.imgID').val();

                var fbLnk = ShareData.filter('.imgShareLnk_fb').val();
                var twLnk = ShareData.filter('.imgShareLnk_tw').val();
                var piLnk = ShareData.filter('.imgShareLnk_pi').val();
            }

            $('<img src="' + ImgLnk + '" class="img-responsive" />').bind('load',function(){

                QuoteImgPop._popup.find('#QuoteImgPopI').html($(this));

                var share_links = '<a onclick="Share.go(\'' + twLnk + '\','+ ImgID +');"><i class="fa fa-twitter"></i></a>'+
                                  '<a onclick="Share.go(\'' + fbLnk + '\','+ ImgID +');"><i class="fa fa-facebook"></i></a>' +
                                  '<a onclick="Share.go(\'' + piLnk + '\','+ ImgID +');"><i class="fa fa-pinterest-p"></i></a>'
                    ;

                QuoteImgPop._popup.find('.foot>span').html(share_links);
                QuoteImgPop._popup.offset(QuoteImgPop.getPosition(ShowBtn));
            });
        },100);

    },
    disable:function()
    {
        QuoteImgPop._popup.offset({top:-5000,left:-500});
        if(QuoteImgPop.showTimer) { clearTimeout(QuoteImgPop.showTimer); }
        QuoteImgPop._popup.find('#QuoteImgPopI').html('<img src="/files/ajax.gif" style="margin: 20px 0">');
    }
};

Application.Loaded(function(){
    if(!Scroll.curBottomPosition) { Scroll.setPosition(0); }
    QuoteImgPop.init();
});

var Share = {
    go: function(urlSet, quoteId){
        if(urlSet) {
            var isOpened = Share.popup(urlSet, quoteId);
            if(isOpened === null) {
                $(this).attr('href',urlSet);
                return true;
            }
        }
        return false;
    },
    popup:function(url, quoteId){

        if(quoteId) {
            Application.AjaxAction('quotes', 'updateShares', {id: quoteId}, function () {
                if (Application.Ajax.Answer != false) {
                    Application.ToMaxHeight.init($('.zth_jq'), function () {
                        Application.ScrollBlocks.init($('.leftMenu'));
                    });
                    Page++;
                    $('.quotesList').append(Application.Ajax.Answer);
                    inLoading = false;
                }
            });
        }

        return window.open(url,'','toolbar=0,status=0,width=626,height=436');
    },

    fb:function(title, description, url_s, image){
        var url  = 'http://www.facebook.com/sharer.php?s=100';
        url += '&p[title]='     + title;
        url += '&p[summary]='   + description;
        url += '&p[url]='       + url_s;
        url += '&p[images][0]=' + image;
        console.log(url);
        Share.go(url);
    },

    tw:function(title, description, url_s, image){
        var url  = 'http://twitter.com/share?';
        url += 'text='          + description;
        url += '&url='          + url_s;
        Share.go(url);
    },

    pi:function(title, description, url_s, image){
        var url  = 'http://pinterest.com/pin/create/button/?';
        url += 'url='           + url_s;
        url += '&description='  + description;
        url += '&media='        + image;
        Share.go(url);
    }
};

var ShareCounter = {
    init:function(url){
        url = (!url) ? window.location.href : url;
        ShareCounter.fb(url);
        ShareCounter.tw(url);
        ShareCounter.pi(url);
    },
    fb: function(url) {
        $.getJSON("http://graph.facebook.com/" + url ,function(json){
            $('.share_fb_count').text(json.shares);
        });
    },

    tw:function(url){
        $.getJSON("http://urls.api.twitter.com/1/urls/count.json?url=" + url + "&callback=?" ,function(json){
            $('.share_tw_count').text(json.count);
        });
    },

    pi:function(url){
        $.getJSON("http://api.pinterest.com/v1/urls/count.json?url="  + url + "&callback=?" ,function(json){
            $('.share_pi_count').text(json.count);
        });
    }
};

Application.Loaded(function(){
    Scroll.docHeight = $(window).height();
    Application.SideMenu.init();
    $(window).on('load resize',function(){
        Application.BootSize._getSize();
        Application.ToMaxHeight.init($('.zth_jq'),function(){
            Application.ScrollBlocks.init($('.leftMenu'));
        });
    });

    $(window).on('scroll',function(){
        Scroll.setPosition($(this).scrollTop());
        if(!Application.BootSize.isXS()) {
            Application.ScrollBlocks.update();
        }
        QuoteImgPop.disable();
    });
    $('#toUp').on('click',ToUp.action);
});

$(document).ready(function() {
  var userAgent = navigator.userAgent;
  if( userAgent.match( /iPad/i ) || userAgent.match( /iPhone/i ) || userAgent.match( /iPod/i ) || userAgent.match( /Android/i ) ) {
    if(localStorage && !localStorage.getItem('m')) {
      var modalcss = '<style>.phone-modal-dialog {margin-top:50px;}.phone-modal-body {padding:0;}#phone-modal-close {  position: absolute;  top: -60px;  right: 0px;  cursor: pointer;  color: white;  z-index: 1;}#phone-modal-close .close-btn {  font-size: 35px;  height:35px;  display:block;}#phone-modal-close .close-text {    font-size: 15px;    display: block; line-height: 15px; height: 15px; } .modal-content{background: transparent;border: medium none;}iframe{border: medium none;}</style>';
      $('head').append(modalcss);
      var modalhtml = '<div id="phone-modal" class="modal fade" tabindex="-1" role="dialog"><div class="modal-dialog phone-modal-dialog"><div class="modal-content"><span aria-hidden="true" id="phone-modal-close"><span class="close-btn">&times;</span><span class="close-txt">exit</span></span><div class="modal-body phone-modal-body"><iframe src="http://wordporn.com/android/wordp.html" width=100% height="500px" border="none"></iframe></div></div></div></div>';
      $('body').append(modalhtml);
      $('#phone-modal').modal();
      $('#phone-modal').find('#phone-modal-close').on('click',function() {
        $('#phone-modal').modal('hide');
      });
      localStorage.setItem('m',1)
      
      setTimeout(function(){
        $('#phone-modal').modal('hide');
      },60000);
    }
  }
});
