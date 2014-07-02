/**
 * App Cache Handling
 * Here is the simplified version. Courtesy of Mike Koss.
 * 
 * See, http://labnote.beedesk.com/the-pitfalls-of-html5-applicationcache
 */
function handleAppCache() {
    if (applicationCache === undefined) {
        return;
    }
  
    if (applicationCache.status == applicationCache.UPDATEREADY) {
        applicationCache.swapCache();
        location.reload();
        return;
    }
  
    applicationCache.addEventListener('updateready', handleAppCache, false);
}

/* New modernizr test for all touch devices */
Modernizr.addTest('touchcapable', function () {
    var bool;
    if(('ontouchstart' in window) || (window.DocumentTouch && document instanceof DocumentTouch) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)) {
      bool = true;
    } else {
      bool = false;
    }
    return bool;
});

/* Global namespace */
var ArtX = ArtX || {};

ArtX.data = ArtX.data || {};

ArtX.el = {
    html            : $('html'),
    win             : $(window),
    doc             : $(document),
    body            : $('body')
};

ArtX.util = {
    hasTouch        : Modernizr.touchcapable,
    hasPosFixed     : Modernizr.positionfixed,
    hasiOSPosFixed  : Modernizr.iospositionfixed,
    viewportWidth   : function() { return ArtX.el.win.width();     },
    viewportHeight  : function() { return ArtX.el.win.height();     },
    docHeight       : function() { return ArtX.el.doc.height();    },
    bodyHeight      : function() { return ArtX.el.body.height();    },
    footerHeight    : function() { return ArtX.el.footer.height();    },
    scrollPos       : function() { return ArtX.el.win.scrollTop(); },
    mobileMode      : function() {
        return (ArtX.util.viewportWidth() <= 767)? true : false;
    },
    desktopMode     : function() {
        return (ArtX.util.viewportWidth() >= 1024)? true : false;
    },
    orientation     : function() {
        if (typeof orientation != 'undefined') {
            return (Math.abs(window.orientation) === 90)? "landscape" : "portrait";
        } else {
            return (ArtX.util.viewportWidth() >= ArtX.util.viewportHeight()) ? "landscape" : "portrait";
        }
    },
    replaceAll: function (txt, replace, with_this) {
        return txt.replace(new RegExp(replace, 'g'),with_this);
    },
    isOldIE: function() {
        return (($.browser.msie) && ($.browser.version <= 8))? true : false;
    }
};

/* Set up Accessible Skiplinks
   ========================================================================== */
ArtX.setupSkipLinks = function() {
    /* Skiplink Javascript for Safari and Chrome */
    if ($("#skiptarget").length > 0) {
        var is_webkit = navigator.userAgent.toLowerCase().indexOf('webkit') > -1;
        var is_opera = navigator.userAgent.toLowerCase().indexOf('opera') > -1;
        if( is_webkit || is_opera ) {
            var target = document.getElementById('skiptarget');
            target.href="#skiptarget";
            target.innerText="Start of main content";
            target.setAttribute("tabindex" , "0");
            document.getElementById('skiplink').setAttribute("onclick" , "document.getElementById('skiptarget').focus();");
        }
    }
};

/* Set up slide-in menu panels
   ========================================================================== */

ArtX.setupSlidingPanels = function() {

    var $masthead = $(".masthead"),
        $footer = $(".footer"),
        mastheadHeight = $masthead.outerHeight,
        footerHeight = $footer.outerHeight,
        $slidingMenuPanel = $("#menu-panel"),
        menuSliderOptions;

    if ($slidingMenuPanel.length > 0) {
        if (ArtX.el.html.hasClass("positionfixed")) {
            menuSliderOptions = {
                name: 'menu-panel',
                side: 'right',
                displace: false
            };
        } else {
            menuSliderOptions = {
                name: 'menu-panel',
                side: 'right'
            };
        }

        // Initialize Menu panel
        if ($slidingMenuPanel.length > 0) {
            console.log("Initializing Menu sliding panel");

            var $slidingMenuTrigger = $("#menu-trigger");

            $slidingMenuTrigger
                .sidr(menuSliderOptions)
                .click(function(e) {
                    e.preventDefault();
                });
        }
    }
   
};

/* Set up Back button
   ========================================================================== */
ArtX.setupBackButton = function() {
    var $backButton = $(".btn-back");
    if ($backButton.length > 0) {
        console.log("Initializing back button");

        $backButton.click(function() {
            location.href=document.referrer;
        });
    }
};

/* Set up toggle switches
   ========================================================================== */
ArtX.setupToggleSwitches = function() {
    $toggleBoxes = $(".onoffswitch").find("input[type='checkbox']");

    if ($toggleBoxes.length > 0) {
        console.log("Initializing toggle switches");
        $toggleBoxes.onoff();
    }
};

/* Set up Peeking slider
   ========================================================================== */

ArtX.setupPeekSlider = function() {
    // Assumption -- there will only ever be one peek-style slider per page/screen
    var $peekSlider = $(".slider-style-peek").find("ul");
    if ($peekSlider.length > 0) {
        console.log("Initializing peeking slider");

        var peekSlideInstance = $peekSlider.bxSlider({
            oneToOneTouch:false,
            pager:false,
            auto:false,
            onSliderLoad: function(currentIndex) {
                //console.log("currentIndex: " + currentIndex);
                $peekSlider.find("li").eq(currentIndex).addClass("slide-prev");
                $peekSlider.find("li").eq(currentIndex+2).addClass("slide-next");
            },
            onSlideBefore: function($slideElement, oldIndex, newIndex) {
                //console.log("oldIndex: " + oldIndex);
                //console.log("newIndex: " + newIndex);
                $(".slide-prev").removeClass("slide-prev");
                $(".slide-next").removeClass("slide-next");
                $peekSlider.find("li").eq(newIndex).addClass("slide-prev");
                $peekSlider.find("li").eq(newIndex+2).addClass("slide-next");
            }
        });

        $('#peek-slider-next').click(function(){
          peekSlideInstance.goToNextSlide();
          return false;
        });

        $('#peek-slider-previous').click(function(){
          peekSlideInstance.goToPrevSlide();
          return false;
        });
    }
};

/* Set up Favorites slider in footer
   ========================================================================== */
ArtX.setupFavoriteSlider = function() {
    var $favoriteSlider = $("#favorite-slider");
    if ($favoriteSlider.length > 0) {
        console.log("Initializing favorites slider");

        var favSlideInstance = $favoriteSlider.bxSlider({
            minSlides:3,
            maxSlides:4,
            slideWidth:300,
            slideMargin:5,
            oneToOneTouch:false,
            pager:false
        });

        $('#favorite-slider-next').click(function(){
          favSlideInstance.goToNextSlide();
          return false;
        });

        $('#favorite-slider-previous').click(function(){
          favSlideInstance.goToPrevSlide();
          return false;
        });
    }
};

/* Set up Favorite stars
   ========================================================================== */

ArtX.setupFavoriteStars = function() {
    var $favoriteStars = $(".favorite-star");
    if ($favoriteStars.length > 0) {
        console.log("Initializing favorite stars");

        $favoriteStars.click(function() {
            var $thisStarIcon = $(this).find(".icon");
            if ($thisStarIcon.hasClass("icon-star")) {
                $thisStarIcon.removeClass("icon-star").addClass("icon-star2");
            } else {
                $thisStarIcon.removeClass("icon-star2").addClass("icon-star");
            }
            return false;
        });
       
    }
};

/* Set up Text Truncation 
   ========================================================================== */
ArtX.setupTextTruncation = function() {
    
    var textToTruncate = $(".truncate");
    if(textToTruncate.length > 0) {
        console.log("Initializing text truncation");
        textToTruncate.trunk8({
            lines: 2,
            tooltip: false
        });

        // Set up a resize event for truncated text
        ArtX.el.win.resize(function() {
            textToTruncate.trunk8({
                lines: 2,
                tooltip: false
            });
        });  
    }
};

/* Set up Signup Modal 
   ========================================================================== */
ArtX.setupSignupModal = function() {
    console.log("Setting up Signup Modal window");

    var isSignedIn = true,
        $signupModalObj = $("#signup-popup");

    // DEV NOTE: This should be replaced with a more robust solution in the final site.
    // This detection is just for demo purposes.

    if ($("#favorite-notsignedin").length > 0) {
        isSignedIn = false;
    }

    console.log("Signed in? " + isSignedIn);

    if (!isSignedIn) {
        $signupModalObj.foundation('reveal', 'open');
    }

    // Set up behavior on modal close
    $(document).on("click", ".close-reveal-modal, .reveal-modal-bg", function() {
        $signupModalObj.foundation('reveal', 'close');
        //console.log("Modal closed");
    });

    // Set up modal trigger link
    $(document).on("click", ".open-signup", function() {
        $signupModalObj.foundation('reveal', 'open');
    });

};

/* Set up custom checkboxes 
   ========================================================================== */
ArtX.setupCustomCheckboxes = function() {
    var $checkboxes = $(".custom-checkbox").find("input[type=checkbox]");

    if ($checkboxes.length > 0) {
        console.log("Setting up custom checkboxes");

        $checkboxes.customInput();
    }
};

/* Initialize/Fire
   ========================================================================== */
ArtX.startup = {
    init : function () {
        //console.log("Initial load: scripting initializing");

        $('a[href="#"]').click(function(e){e.preventDefault();});
        picturefill();

        ArtX.setupSkipLinks();
        ArtX.setupSignupModal();
        ArtX.setupBackButton();
        ArtX.setupTextTruncation();

        ArtX.setupSlidingPanels();
        ArtX.setupPeekSlider();
        ArtX.setupFavoriteSlider();
        ArtX.setupFavoriteStars();
        ArtX.setupCustomCheckboxes();
        ArtX.setupToggleSwitches();

        // Initialize FastClick on certain items, to remove the 300ms delay on touch events
        FastClick.attach(document.body);
    },
    finalize : function() {
        
    }
};


$(document).ready(function() {

    handleAppCache();

    Modernizr.load([
        
        // Test need for matchMedia polyfill
        {
            test: window.matchMedia,
            nope: ['/ui/js/standalone/media.match.min.js'],
            load: ['/ui/js/standalone/enquire.min.js','/ui/js/standalone/picturefill.min.js'],
            complete: function() {

                /* Fire based on document context 
                ========================================================================== */

                var namespace  = ArtX.startup, context = document.body.id;
                if (typeof namespace.init === 'function') {
                    namespace.init();
                }
                if (namespace && namespace[ context ] && (typeof namespace[ context ] === 'function')) {
                    namespace[ context ]();
                }
                if (typeof namespace.finalize === 'function') {
                    namespace.finalize();
                }

                
            }
        }
    ]);
});