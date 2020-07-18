var Filedialog = {

    open: function(){

        $('body').addClass('openfiledialogs');
        Filedialog.reload();

    },

    close: function(){

        $('.droparea input[type=file]').val('');

        $('body').removeClass('openfiledialogs');
        $('.filedialogs .destination').text('');

    },

    upload: function(elm){

        var filesElm = elm;

        Object.keys(filesElm.files).forEach(function(k){

            var file = filesElm.files[k];

            Util.getBase64(file).then(function(base64){

                Lucy.socket.emit('file upload', {
                    name: file.name,
                    cwd: Lucy.additionalInfo.cwd,
                    data: base64
                });

            });

        });

        $('.droparea input[type=file]').val('');

    },

    reload: function(){

        $('.filedialogs .destination').text('Destino: ' + Lucy.additionalInfo.cwd);

    }

}

$(document).on('dragover', Filedialog.open);