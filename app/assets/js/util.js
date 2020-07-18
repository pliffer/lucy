var Util = {

    getDateString: function(unixtime){

        return Util.getBeautifulDate(unixtime) + ' ' + Util.getSimpleHour(unixtime);

    },

    months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
    monthsShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],

    getSimpleHour(unixtime, outputSeconds){

        if(typeof unixtime === 'undefined') unixtime = new Date().getTime();

        if(typeof outputSeconds === 'undefined') outputSeconds = true;

        var date = new Date(unixtime);

        var hour    = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();

        if(hour < 10){
            hour = '0' + hour;
        }

        if(minutes < 10){
            minutes = '0' + minutes;
        }

        if(seconds < 10){
            seconds = '0' + seconds;
        }

        if(outputSeconds){
            outputSeconds = ':' + seconds;
        } else{
            outputSeconds = '';
        }

        return hour + ':' + minutes + outputSeconds;

    },

    getBeautifulDate: function(unixtime){

        if(typeof unixtime === 'undefined') unixtime = new Date().getTime();

        var date = new Date(unixtime);

        return date.getDate() + ' de ' + Util.months[date.getMonth()] + ', ' + date.getFullYear();

    },

    getLightDate: function(unixtime, delimiter){

        if(typeof unixtime === 'undefined'){
            unixtime = new Date().getTime();
        }

        if(typeof delimiter === 'undefined'){
            delimiter = '/';
        }

        var date = new Date(unixtime);

        var year  = date.getFullYear();
        var month = date.getMonth() + 1;
        var day   = date.getDate();

        if(month < 10){
            month = '0' + month;
        }

        if(day < 10){
            day = '0' + day;
        }

        var offset = date.getTimezoneOffset() / 60;

        if(offset < 10){
            offset = '0' + offset;
        }

        return day + delimiter + month;

    },

    getBase64: function(file){

        return new Promise(function(resolve, reject){

            var reader = new FileReader();
            
            reader.readAsDataURL(file);
            
            reader.onload = function(){

                resolve(reader.result);

            }

            reader.onerror = function(error){

                reject(error);

            }

        });

    },

    urlParams: function(){

        var query = document.location.search;

        if(query[0] === '?') query = query.replace('?', '');

        var vars = query.split("&");

        var query_string = {};
        
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            // If first entry with this name
            if (typeof query_string[pair[0]] === "undefined") {
                query_string[pair[0]] = decodeURIComponent(pair[1]);
                // If second entry with this name
            } else if (typeof query_string[pair[0]] === "string") {
                var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
                query_string[pair[0]] = arr;
          // If third or later entry with this name
            } else {
                query_string[pair[0]].push(decodeURIComponent(pair[1]));
            }
        }

        return query_string;

    },


}