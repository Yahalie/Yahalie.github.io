Application.Alert = {
    alertBox: false,
    defAutoClose:6000,
    Init: function(){
        Application.Alert.alertBox = (!$('ul#zAlerter').length) ? $('<ul id="zAlerter"></ul>').prependTo('body') : $('ul#zAlerter');
    },
    Add:function(type,canclose,title,text,autoclose){
        var NewAlert = '<li class="alert alert-'+type+((canclose)?' alert-dismissible':'')+'" role="alert" style="display:none">';
        if(canclose) {NewAlert+='<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>';}
        if(title) {NewAlert+='<strong>'+title+'</strong> ';}
        if(text) {NewAlert+=text;}
        NewAlert+='</li>';
        Application.Alert.ShowNew(NewAlert,autoclose);
    },
    ShowNew:function(alertd,autoclose){
        var CurAlert = $(alertd).prependTo(Application.Alert.alertBox);
        CurAlert.fadeIn();
        if(autoclose) {
            autoclose = (autoclose===true) ? Application.Alert.defAutoClose : autoclose;
            setTimeout(function(){
                CurAlert.css({overflow: 'hidden'});
                CurAlert.animate({height:'0',opacity:'0','padding-top': '0','padding-bottom': '0'},function(){
                    $(this).remove();
                });
            },autoclose);
        }
    }
};

Application.isCallBack = function(callback){
    if(callback && typeof(callback) === "function") { return callback(); }
};

Array.prototype.in_array = function(p_val) {
    for(var i = 0, l = this.length; i < l; i++)	{
        if(this[i] == p_val) {return true;}
    }
    return false;
};

function is_array(mix) {
    return ( mix instanceof Array );
}

Application.Ajax = {
    Status:true,
    Answer:[],
    Response:function(response){
        var IsJson = false;
        try {
            Application.Ajax.Answer = JSON.parse(response);
            IsJson = true;
        } catch (e) {
            Application.Ajax.Answer = response;
        }
        if(IsJson) {
            if(Application.Ajax.Answer.alert) {
                Application.Alert.Add(
                    Application.Ajax.Answer.alert.type,
                    Application.Ajax.Answer.alert.canclose,
                    Application.Ajax.Answer.alert.title,
                    Application.Ajax.Answer.alert.text,
                    Application.Ajax.Answer.alert.autoclose
                );
            }
            Application.Ajax.Status = Application.Ajax.Answer.status;
        } else {
            Application.Ajax.Status = false;
            var ZDBG = $('#ZDBG');
            if(ZDBG.length) {ZDBG.html(response);}
        }
    },
    Data:function(id){
        if(!id) {return Application.Ajax.Answer.data;}
        else {
            try {
                var Ret = Application.Ajax.Answer.data[id];
            } catch (e) { var Ret = false; }
            return Ret;
        }
    }
};

Application.AjaxAction = function(module,action,data,callback)
{
    var AjAcLink = '/' + module + '/ajx/do_' +  action + '/';
    $.post(AjAcLink,data,function(a){
        Application.Ajax.Response(a);
        Application.isCallBack(callback);
    });
};

$.fn.draggable = function(dragthis,callback){
    var DragBlock = (dragthis) ? dragthis : false;
    var CallBack  = (callback) ? callback : false;

    function disableSelection(){return false;}

    $(this).mousedown(function(e){
        var drag = (!DragBlock) ? $(this) : $(this).parents(DragBlock);
        var posParentTop = drag.parent().offset().top;
        var posParentBottom = posParentTop + drag.parent().height();
        var posOld = drag.offset().top;
        var posOldCorrection = e.pageY - posOld;

        var StartPosition = [];
        drag.parent().children((!DragBlock)?null:DragBlock).each(function(){StartPosition.push($(this).data('sortid'));});

        var isEq = function(a, b){
            if(a.length != b.length) {return false;}
            for(var i=0;i<a.length;i++) {if(a[i]!=b[i]) {return false;}}
            return true;
        };

        drag.css({'z-index':2, 'background-color':'#eeeeee'});
        var mouseMove = function(e){
            drag.addClass('dragActive');
            var posNew = e.pageY - posOldCorrection;
            if (posNew < posParentTop){
                drag.offset({'top': posParentTop});
                if (drag.prev().length > 0 ) {drag.insertBefore(drag.prev().css({'top':-drag.height()}).animate({'top':0}, 100));}
            } else if ((posNew + drag.height()) > posParentBottom){
                drag.offset({'top': posParentBottom - drag.height()});
                if (drag.next().length > 0 ) {drag.insertAfter(drag.next().css({'top':drag.height()}).animate({'top':0}, 100));}
            } else {
                drag.offset({'top': posNew});
                if (posOld - posNew > drag.height() - 1){
                    drag.insertBefore(drag.prev().css({'top':-drag.height()}).animate({'top':0}, 100));
                    drag.css({'top':0});
                    posOld = drag.offset().top;
                    posNew = e.pageY - posOldCorrection;
                    posOldCorrection = e.pageY - posOld;
                } else if (posNew - posOld > drag.height() - 1){
                    drag.insertAfter(drag.next().css({'top':drag.height()}).animate({'top':0}, 100));
                    drag.css({'top':0});
                    posOld = drag.offset().top;
                    posNew = e.pageY - posOldCorrection;
                    posOldCorrection = e.pageY - posOld;
                }
            }
        };
        var mouseUp = function(){
            $(document).off('mousemove', mouseMove).off('mouseup', mouseUp);
            $(document).off('mousedown', disableSelection);
            drag.animate({'top':0}, 100, function(){drag.css({'z-index':1, 'background-color':'transparent'});});
            drag.removeClass('dragActive');

            var NewSort = [];
            drag.parent().children((!DragBlock)?null:DragBlock).each(function(){NewSort.push($(this).data('sortid'));});
            if(NewSort.length>0&&!isEq(StartPosition,NewSort)) {
                if(CallBack && typeof(CallBack) === "function") {CallBack(NewSort);}
            }
            StartPosition = NewSort;
        };
        $(document).on('mousemove', mouseMove).on('mouseup', mouseUp).on('contextmenu', mouseUp);
        $(document).on('mousedown', disableSelection);
        //$(window).on('blur', mouseUp);
    });
};

Application.Draggable = {
    inLoading:false,
    start:function(drag,dragged,type){
        $(drag).draggable(dragged,function(sort){
            if(!Application.Draggable.inLoading) {
                console.log(sort);
                SortLoaded = true;
                $.post('/ajp/do_sort/',{type:type,sort:sort},function(a){
                    Application.Ajax.Response(a);
                    SortLoaded = false;
                });
            }
        });
    }
};


function hideAndDel(elem,callback) {
    elem.css({overflow: 'hidden'});
    elem.animate({height:'0',opacity:'0','padding-top': '0','padding-bottom': '0'},function(){
        elem.remove();
        if(callback && typeof(callback) === "function") {callback();}
    });
}

function UserLogOut(bl) {
    $.post('/user/ajx/do_exit',function(){
        if(bl) {window.location.href = bl;}
        else {window.location.reload();}
    });
}

Application.Loaded(function(){
    $('.signOut').on('click',function(){UserLogOut();});
    $('.signOutGM').on('click',function(){UserLogOut('/');});
});
