var ads = {};

/* 
 * Lista de parámetros (params):
 *   rssUrl: URL del que se obtendra el XML con los banners publicitarios.
 *   container: Contenedor en el que se actualizara la publicidad.
 *   fadeInterval: Intervalo de tiempo, en milisegundos, en que se desvanece el banner actual 
 *       y aparece el nuevo banner.
 *   interval: Intervalo de tiempo, en milisegundos, en que se actualizara el banner.
 */
 
ads.BannerRotator = function(params) {
    var manager = this;
    var banners = new Array();
    var current = 0;
    var interval = (params.interval)?params.interval:1000;
    var fadeInterval = (params.fadeInterval)?params.fadeInterval:0;
    var iid;
    
    changeBanner = function(current) {
        $(params.container).find("img").eq(0).fadeOut(fadeInterval).detach();
        $(params.container).append(banners[current].fadeIn(fadeInterval));
    }
    
    this.start = function() {
        if($(params.container).find("img").size() > 0 && params.rssUrl && params.rssUrl != null) {
			$.ajax({
				url: params.rssUrl,
                dataType: "xml",
                success: function(data, textStatus, jqXHR) {
					/*$(data).find("item media\\:content").each(function() {
						banners.push($("<img>").attr("src", $(this).attr("url")));
                    });*/
					$(data).find("item").each(function() {
						banners.push($("<img>").attr("src", $(this).find("media\\:content").attr("url")));
                    });
					changeBanner(current);
					if(banners.length > 1) {
                        iid = setInterval(function() {
                            current = parseInt(current + 1) % banners.length;
                            changeBanner(current);
                        }, interval);
                    }
                    if (jqXHR.destroy) {
                    	jqXHR.destroy();
                    }
                }
            });
        }
    }
    
    this.stop = function() {
        if(iid && iid != null) {
            clearInterval(iid);
        }
    }
}
