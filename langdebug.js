Application.Loaded(function(){

    var LangModal = $('#langdebugermodal');
    var LangForm  = LangModal.find('#langdebugform');

    $('#saveLanListDebug_').on('click',function(){
        $.post('/'+Application.CurLanguageLink+'ajp/do_ldbgAdd/',LangForm.serialize(),function(a){
            Application.Ajax.Response(a);
            LangModal.modal('hide');
            location.reload();
        });
    });
});
