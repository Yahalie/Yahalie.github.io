Application.UserEnter = {
    IsModal:false,
    Modal:false,
    ModalId:'modal_UserLogin',
    OpenUserEnterCls:'openUserLogin',

    EmailInput :'#UE_email',
    PassInput  :'#UE_password',
    SubmitBtn  :'#UserEnterBtn',

    Form: 'UserEnterForm',
    Loading:false,

    Init:function(){

        Application.UserEnter.Modal = $('#'+Application.UserEnter.ModalId);
        if(Application.UserEnter.Modal.length) {Application.UserEnter.IsModal = true;}
        //
        $('.'+Application.UserEnter.OpenUserEnterCls).on('click',function(){
            if(Application.UserEnter.IsModal) {Application.UserEnter.Modal.modal('show');}
            else {window.location.href = '/user/enter/';}
        });
        //
        Application.UserEnter.EmailInput = $(Application.UserEnter.EmailInput);
        Application.UserEnter.PassInput  = $(Application.UserEnter.PassInput);
        //
        if(Application.UserEnter.IsModal) {Application.UserEnter.Modal.on('shown.bs.modal',function(){Application.UserEnter.EmailInput.focus();});}
        //
        Application.UserEnter.Form = $('#'+Application.UserEnter.Form);
        if(Application.UserEnter.Form.length) {
            Application.UserEnter.SubmitBtn = $(Application.UserEnter.SubmitBtn);
            if(Application.UserEnter.IsModal) {
                Application.UserEnter.SubmitBtn.on('click',function(){Application.UserEnter.Form.submit();});
            }
            Application.UserEnter.Form.on('submit',function(e){
                e.preventDefault();
                /**/
                var ActionUrl = $(this).attr('action');
                if(!Application.UserEnter.Loading) {
                    Application.UserEnter.Loading = true;
                    Application.UserEnter.SubmitBtn.button('loading');

                    var AjaxCheck = $.post(ActionUrl,$(this).serialize());
                    AjaxCheck.done(function(a) {
                        $('.has-error').removeClass('has-error');
                        Application.Ajax.Response(a);
                        if(Application.Ajax.Status) {
                            if(Application.UserEnter.IsModal) {
                                window.location.reload();
                            } else {
                                var Link = '/';
                                var BackLink = $('#UE_bl');
                                if(BackLink.length) {Link = Link+BackLink.val();}
                                window.location.href = Link;
                            }
                        } else {
                            var BadFields = Application.Ajax.Data('bf');
                            var CountBadFields = BadFields.length;
                            if(CountBadFields>0) {
                                for(var bf=0;bf<CountBadFields;bf++) {
                                    $('#'+BadFields[bf]).parent().addClass('has-error');
                                    if(!bf) { $('#'+BadFields[bf]).focus(); }
                                }
                            }
                        }
                    });
                    AjaxCheck.always(function() {
                        Application.UserEnter.Loading = false;
                        Application.UserEnter.SubmitBtn.button('reset');
                    });
                }
                /**/
                return false;
            });
        } else {console.log('enter form not found');}

        var SocButtons = $('.btn-social');
        if(SocButtons.length) {
            SocButtons.on('click',function(e){
                e.preventDefault();
                var SocLink = $(this).attr('href');
                if($(this).attr('href').length>5) {
                    var newWin = window.open($(this).attr('href'),false,"width=750,height=500,resizable=yes,scrollbars=yes,status=yes,left="+((screen.width-750)/2)+",top="+((screen.height-500)/2)+"");
                    newWin.focus()
                }
            });
        }
    }
};

Application.Loaded(function(){
    Application.UserEnter.Init();
});
