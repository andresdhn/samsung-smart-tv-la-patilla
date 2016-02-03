/*--*/

var firstTime = true; //Flags
var exitFlag = 0;
var notice = 0;
var terms = 0;
var refresh = 0;
var returnFlag = 0;


/*--*/
var timeOut = 10000; //news rotation timeOut
var Interval = 300000; //feed refreshing interval
var Counter = 0;
/*--*/


$(document).ready( function() {
	
	alert ("document ready");
	/* Terms and Conditions file */
	var file = this.file = new Main.FileSystem("LaPatilla_SamsungTerms.txt");
	
	$("#samsung-terms").hide();
	$("#terms-navi").hide();
	
	if(file.read() == undefined) 
	{
		file.write("rejected");
	}

	if(file.read() != undefined && file.read() != "rejected" && file.read() == "accepted") 
	{
		/* Terms and Conditions were previously accepted, app deploy */
		news.Reader.load("RSS", false);
		
	} 
	else if(file.read() == "rejected") 
	{
		/* Terms and Conditions were'nt accepted yet, they are shown */
		document.getElementById("container").style.display = "none"; 
		news.showTermOfConditions(file);
	}
	
	
});

$(document).keydown( function(e) {
	
	switch(e.keyCode) {
		case tvKey.KEY_CONTENT:  // 261 Smart HUB & Content Button
		case tvKey.KEY_INFOLINK:  // 147 Internet @TV Button
		case tvKey.KEY_WLINK :     // Midea Play Button
		{
			break;
		}
        case tvKey.KEY_EXIT:
			if (terms == 1 && exitFlag == 0) 
			{
				alert("Terms Exit bye bye");
				widgetAPI.sendExitEvent();
			}
			else if (terms == 0 && exitFlag == 0) 
			{
				$("#exit-confirm").show();
				exitFlag = 1;
			}
			else if (terms == 0 && exitFlag == 1)
			{
				alert("Exit bye bye");
				widgetAPI.sendExitEvent();
			}
			e.preventDefault();
			break;
			
		case tvKey.KEY_RETURN:
			if (exitFlag == 1) 
			{
				alert("Not Yet");
				$("#exit-confirm").hide();
				exitFlag = 0;
			}
			if (terms == 1) 
			{
				alert("Terms Ret bye bye");
				widgetAPI.sendExitEvent();
			}
			e.preventDefault();
			break;
			
		case tvKey.KEY_ENTER:
			if (exitFlag == 1 && terms == 0) 
			{
				alert("bye bye");
				widgetAPI.sendExitEvent();
				e.stopPropagation();
			}
			break;
	
    }
	//e.preventDefault();
    
});


var news = {
    ui: {}
};

news.ui.nav = function(c) {
    $("#nav-help").removeAttr("class").addClass(c);
};

news.ui.part = (function() {
    return function(id, data) {
        var $part = $("#templates #tpl-" + id).clone().removeAttr("id");
        if (data)
		{
            $part.html($part.html().fill(data));
		}
        return $part;
    };
})();

news.Post = function(feed, title, date, description) {
	var post = this;
	
	alert("news.Post");
	
	title = title.replace(/^noticias[^:]*:\s*/, "");

    this.$element = news.ui.part("post", {
        title: title,
        date: date,
        description: description
    });
    
    this.$selector = news.ui.part("post-selector", {
        title: title,
        date: date
    });

    this.$selector.find("a")
    .click( function() {
        $(post).trigger("display");
		
    })
    .focus( function() {
		news.ui.nav("ud enter back");
		returnFlag = 1;
		
    });   
	
	
	clearInterval(Timer);
	
	var Timer = setTimeout(function() {
		alert ("Timer rotate");
		if (returnFlag == 1 && exitFlag == 0 && notice == 0 && refresh == 0) 
		{
			post.$selector.next().find("a").focus();
			if((post.$selector.prevAll().length == 0) && (feed.$page < feed.$maxPages))
			{
				feed.$page++;
				feed.load();
			}
			else
			{
				feed.$page = 1;
				feed.load();
				feed.$postList.find("a").eq(0).focus();
			}
		}
	}, timeOut);
	
	this.$selector.keydown( function(e) {
		alert ("Display " + e.keyCode);
		switch(e.keyCode) {
		    case tvKey.KEY_RETURN:
				if (exitFlag == 0) 
				{
					if ($("#feed-display").width() == 1 || $("#feed-display").width() == 850 ) 
					{
						$("#feed-display").animate({width: "toggle", opacity: "toggle"}, "slow");
						$("#publicity").animate({opacity: "toggle"}, "fast");
					
						alert($("#feed-display").width());
						
						if (returnFlag == 0) 
						{
							post.$selector.find("a").focus();
							feed.load();
						}
						else 
						{
							news.ui.nav("back");
							returnFlag = 0;
						}
					}
				}
				clearInterval(Timer);
				e.preventDefault();
                break;
				
            case tvKey.KEY_UP:
				alert ("key up " + returnFlag);
				if (returnFlag == 1 && exitFlag == 0) 
				{
					post.$selector.prev().find("a").focus();
					if((post.$selector.prevAll().length == 0) && (feed.$page > 1))
					{
						feed.$page--;
						feed.load();
						feed.$postList.find("a").eq(0).focus();
					}
					else
					{
						feed.$page = feed.$maxPages;
						feed.load();
						feed.$postList.find("a").eq(0).focus();
					}
				}
				clearInterval(Timer);
				break;
				
            case tvKey.KEY_DOWN:
				alert ("key down " + returnFlag);
				if (returnFlag == 1 && exitFlag == 0) 
				{
					post.$selector.next().find("a").focus();
					if((post.$selector.prevAll().length == 0) && (feed.$page < feed.$maxPages))
					{
						feed.$page++;
						feed.load();
					}
					else
					{
						feed.$page = 1;
						feed.load();
						feed.$postList.find("a").eq(0).focus();
					}
				}
				clearInterval(Timer);
				break;
        }
        //e.preventDefault();
		clearInterval(Timer);
    });
	
};

news.Feed = function(title, url, loaded) {
	var feed = this, posts = [], currentPost = null;
    
	this.$element = news.ui.part("feed");
    this.$postList = this.$element.find(".post-list");
    this.$singlePost = this.$element.find(".single-post");
    this.$selector = news.ui.part("feed-selector", {
        title: title
    }).appendTo("#feed-list");

    this.$page = 1;
    this.$maxPages = 0;
	
	alert("news.Feed");
	
	this.populate = function(xml, onlyfocus) {
		
		if (!xml) 
		{
            $([this.$element, this.$selector]).remove();
			return;
        }
        
        var end = feed.$page * 1;
        
        if ((feed.$maxPages = Math.round(xml.getElementsByTagName("item").length /1)) > 20) 
		{
            feed.$maxPages = 20;
        }

        if (feed.$page > feed.$maxPages) 
		{
			return;
        }
        
        this.$postList.empty();
		alert ("end: " + end);
        $.each($.makeArray(xml.getElementsByTagName("item")).slice(end-1, end), function() {
			var title = $(this).find("title").text(),
            date = new Date(Date.parse($(this).find("pubDate").text())),
            description = $(this).find("content\\:encoded").text();
			
			var post = new news.Post(feed, title, date, description);
			
            post.$selector.appendTo(feed.$postList);
			
            $(post).bind("display", function() {
				if (returnFlag == 1 && exitFlag == 0) 
				{
					$("#feed-display").removeClass("list");
					$("#feed-display").addClass("notice");
					$("#feed-display").animate({height: "380px"}, "slow");
					$("#publicity").animate({opacity: "toggle"}, "slow");
		
					feed.$element.addClass("reading-post");
					feed.$singlePost.empty().append(post.$element);
					news.ui.nav("back");

					var scrollIndicator = new news.ui.ScrollIndicator();
					scrollIndicator.show();
					
					notice = 1;
					
				}
                $("#single-post-anchor").unbind("keydown").keydown( function(e) {
					
                    switch(e.keyCode) {
                        case tvKey.KEY_RETURN:
							if (exitFlag == 0) 
							{
								feed.$element.removeClass("reading-post");
								$("#feed-display").animate({height: "58px"}, "slow");
								$("#publicity").animate({opacity: "toggle"}, "slow");
								
								scrollIndicator.hide();
								
								post.$selector.find("a").focus();
								feed.load();								
								
								notice = 0;
							}
							e.preventDefault();
                            break;
                        case tvKey.KEY_UP:
							if (exitFlag == 0) 
							{
								$("#feed-display").scrollTop($("#feed-display").scrollTop() - 50);
								scrollIndicator.move();
							}
                            break;
                        case tvKey.KEY_DOWN:
							if (exitFlag == 0) 
							{
								$("#feed-display").scrollTop($("#feed-display").scrollTop() + 50);
								scrollIndicator.move();
							}
                            break;
                    }
                    //e.preventDefault();
                }).focus();
            });
        });

        if(firstTime) 
		{
            $("#feed-display a").eq(0).focus();
            firstTime = false;
        } 
		else 
		{
            feed.$postList.find("a").eq(0).focus();
        }
        
    };
    
    xml = null;
    this.load = function() {

        $("#error-message").hide();
        if (!loaded) 
		{
        	$("#container").show();
			
			var loading = new news.ui.LoadingIndicator();   
            feed.$selector.blur();
            news.ui.nav("");
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url);
            loading.show();
			
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    loading.hide();
                    if(xhr.status == 200) 
					{
						feed.populate(xml = xhr.responseXML);
                    }
                    else 
					{
                        firstTime = false;
                        loaded = false;
						i = 11;
						var errorTimer = setInterval(function() {
							news.ui.nav("exit");
							i --;
							$("#error-message").html("<p>Error de conexión debido a problemas en la red<br>Reconectando en: " + i + "</p>").show();
							if (i == 0){
								alert ("reload");
								$("#error-message").hide();
								clearInterval(errorTimer);
								news.Reader.load("RSS", false);
								
							}
		
						}, 1000);
						
						$("#feed-list a").eq(0).focus();
                    }
                }
            };
            xhr.send();
            loaded = true;
        }
		else 
		{
			feed.populate(xml, true);
        }
    };
    
	
	this.timer = setInterval(function() {
		alert ("Timer refresh");
		
		if (notice == 0)
		{
			xml = null;
			var xhr = new XMLHttpRequest();
			xhr.open("GET", url);
			
			alert (url);
			refresh = 1;
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4) {
					
					if(xhr.status == 200) 
					{
						feed.populate(xml = xhr.responseXML);
					}
					else 
					{
						firstTime = false;
						loaded = false;
						
						$("#error-message").show();
						$("#feed-list a").eq(0).focus();
					}
				}
			};
			
			xhr.send();
			loaded = true;
			refresh = 0;
		}
	}, Interval);
	
	
    this.$selector.find("a")
    .click( function() {
        $(feed).trigger("display");
        feed.load();
    })
    .focus( function() {
        $("#feed-list a.current").removeClass("current");
        $(this).addClass("current");
        news.ui.nav("enter back");
    });

};

news.Reader = {

    feeds: [],

    sources: {
        "RSS": {
            label: "", base: "",
            feeds: [{
                title: "",
                 url: "http://www.lapatilla.com/site/feed"
            }],
        }
    },

    getFeeds: function(source) {
        return news.Reader.sources[source].feeds;
    },
    
    load: function(source, loaded) {
		
		alert("news.Reader.load");
		document.getElementById("container").style.display = "block"; 

		//Publicidad
		new ads.BannerRotator({
			rssUrl: "http://www.samsung.com/ve/p2images/xml/ad_banners_xp.xml",
			container: $("#publicity"),
			fadeInterval: 500,
			interval: 20000
		}).start();
	
        $.each(news.Reader.getFeeds(source), function() {
            
			var feed = new news.Feed(this.title, this.url, loaded);
			feed.$selector.appendTo(news.ui.$categories);
            
            $(feed).bind("display", function() {
                $("#feed-display").empty().append(feed.$element);
				
            });
			news.Reader.feeds.push(feed);
			
        });
		
        $("#feed-list a").eq(0).focus().click().blur();
		
		
    },
	
    
};


news.ui.LoadingIndicator = function() {
   
	$("#loading-indicator").attr("src", "resource/nav-icon/loader.gif");

    this.show = function() {
        $("#loading-indicator").show();
    };
    
    this.hide = function() {
        $("#loading-indicator").hide();
    };
 
}

news.ui.ScrollIndicator = function() {
    
    var scrollIndicator = this;
    
    this.show = function() {
        scrollIndicator.move();  
        $("#scroll-up").show();
        $("#scroll-down").show();
    };
    
    this.move = function() {
        if($("#feed-display").scrollTop() == 0) 
            $("#scroll-up").attr("src", "resource/images/scrolling/scroll-up-none.png");
        else
            $("#scroll-up").attr("src", "resource/images/scrolling/scroll-up-more.png");
        
        if(($("#feed-display").scrollTop()+$("#feed-display").height()) < $("#feed-display")[0].scrollHeight)
            $("#scroll-down").attr("src", "resource/images/scrolling/scroll-down-more.png");
        else
            $("#scroll-down").attr("src", "resource/images/scrolling/scroll-down-none.png");
    };
    
    this.hide = function() {
        $("#scroll-up").hide();
        $("#scroll-down").hide();
    };
    
};


/*
 * creates a file in File System and provides 
 * funtionalities to write an read
 */
Main.FileSystem = function(fileName) {
	var Obj = this;
	var fileSystem = new FileSystem();

	this.write = function(str) {
		var fileObj = fileSystem.openCommonFile(fileName, "w");
		fileObj.writeAll(str);
		fileSystem.closeCommonFile(fileObj);
	}
	this.read = function() {
		if(fileSystem.openCommonFile(fileName, "r") != null) 
		{
			var fileObj = fileSystem.openCommonFile(fileName, "r");
			var str = jQuery.trim(fileObj.readAll());
			fileSystem.closeCommonFile(str);
			return str;
		}
	}
}

/*
 * Terms and contditions window
 */ 
news.showTermOfConditions = function(file) {
	
	$("#terms-navi").show();
	$("#samsung-terms").focus().eq(0).addClass("focus").show();
	terms = 1;
	$("#samsung-terms").focus().keydown( function(e) {

		switch(e.keyCode)
		{
		case tvKey.KEY_ENTER: 
			alert ("terms Accepted!");
			terms = 0;
			
			$("#samsung-terms").remove();
			$("#terms-navi").remove();
			file.write("accepted");
			
			news.Reader.load("RSS", false);
			e.stopPropagation();
			break;
			
		}	
	});
	
}
