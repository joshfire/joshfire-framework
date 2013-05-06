/**
*
*/

require(["jquery"], function($, Bootstrap) {
    
    // Document is Ready
    $(function() {

        var firstLoad = true;

        /**
        * Collapse function for Titles
        */
        $.fn.collapse = function() {
            var parent = $(this).attr('id');
            if( $(this).hasClass('collapsed') ) {
                $(this).removeClass('collapsed');
                $("li[data-parent='"+parent+"']").fadeIn();
            } else {
                $("li[data-parent='"+parent+"']").fadeOut();
                $(this).addClass('collapsed');
            }
        }


        /**
        * Load an HTML file in #pages-screen DIV
        */
    	var loadPage = function(page, callback) {
    		$.get('/documentation/'+page+".html", function(html) {
    			$("#pages-screen").html(html);
    			if(callback) callback(true);
    		}).error(function() {
    			if(callback) callback(false);
    		});
    	}

        $(window).on('hashchange', function() {
            if(document.location.hash.length > 1) {
                loadPage(document.location.hash.substring(1));
            }

        });


        // Create collapse on titles
        $('li.title').each(function() {
            var title = this;
            var parent = $(title).attr('id');

            // On click collapse sub items
            $(title).click(function(event) {
                event.preventDefault();
                $(title).collapse();
            })
        });


        // Create links on items
    	$('li a').each(function() {
    		var link = this;

    		var pageLink = $(this).attr('href').substring(1);

    		// Bind click event on link
    		$(link).click(function(event) {

    			loadPage(pageLink, function(loaded) {
    				if(!loaded) {
    					$("#pages-screen").html("<h3>Work in progress...</h3>");
    				} 

    				$('a').removeClass('active');
    				$(link).addClass('active');
    			});
    			
    		});
    	});


        if(document.location.hash.length > 1) {
            loadPage(document.location.hash.substring(1));
        } else {
    	   loadPage('home');
        } 

    });
});