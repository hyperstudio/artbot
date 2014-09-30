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
    if (
        ('ontouchstart' in window) ||
        (window.DocumentTouch && document instanceof DocumentTouch) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0)
    ){
        // Secondary test to rule out some false positives
        if (
            (window.screen.width > 1279 && window.devicePixelRatio == 1) ||
            (window.screen.width > 1000 && window.innerWidth < (window.screen.width * 0.9)) // this checks if a user is using a resized browser window, not common on mobile devices
        ){
            bool = false;
        } else {
            bool = true;
        }
    } else {
        bool = false;
    }
    return bool;
});


/* Helper function to capitalize only the first letter of a string
   ========================================================================== */
// Usage: "hello world".capitalize();  =>  "Hello world"
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};


/* Set up form validation for email, passwords, etc.
   ========================================================================== */
jQuery.validator.addMethod("zipcode", function(value, element) {
    return this.optional(element) || /^\d{5}(?:-\d{4})?$/.test(value);
}, "Please provide a valid zip code.");

jQuery.validator.addMethod("remoteEmail", function(value, element) {
    // Temp return so things don't break while we work things out
    return true;

    // Comment out the above and uncomment the below to test the validator method
    /*
    $.mobile.loading('show');
    $.ajax({
        type: "GET",
        data: {
            "email": value
        },
        url: Artbot.var.jsonDomain + "/registrations",
        success: function(response){
            console.log("Checking: the user is in the system");
            return true;
        },
        error: function (jqXHR, error, errorThrown) {
            // 404 = Email not in system
            if((jqXHR.responseText !== undefined) && (jqXHR.status === 404)){

                var result = $.parseJSON(jqXHR.responseText);
                var errorText;
                $.each(result, function(k, v) {
                    errorText = v;
                    console.log(errorText);
                });
                return false;
            } else {
                console.log("Error checking if the user is in the system");
                Artbot.errors.logAjaxError(jqXHR, error, errorThrown);
                return false;
            }
        },
        complete: function() {
            $.mobile.loading('hide');
        }
    }); */
}, "User does not exist");
// Dev note: We unfortunately cannot set the error message based on the returned error payload because we cannot do cross-domain asynchronous Ajax calls. We are hardcoding the "User does not exist" message instead.



var emailRuleSet = {
    required: true,
    email: true
};
var existingEmailRuleSet = {
    required: true,
    email: true,
    "remoteEmail": "remoteEmail"
};
var emailMsgSet = {
    required: "This field is required.",
    email: "Please enter a valid email address."
};
var passwordMsgSet = {
    required: "This field is required."
};
var confirmPasswordMsgSet = {
    required: "This field is required.",
    equalTo: "Passwords must match."
};

// Setting defaults for all validation -- submitHandlers should be added individually
jQuery.validator.setDefaults({
    focusCleanup: true,
    focusInvalid: false,
    rules: {
        "password_confirmation": {
            equalTo: "#password"
        },
        "email": emailRuleSet,
        "zipcode": "zipcode",
        "signin-email": existingEmailRuleSet,
        "signin-password": "required"
    },
    messages: {
        "email": emailMsgSet,
        "password": passwordMsgSet,
        "password_confirmation": confirmPasswordMsgSet,
        "signin-email": emailMsgSet,
        "signin-password": passwordMsgSet
    }
});


/* Global namespace */
var Artbot = Artbot || {};

Artbot.data = Artbot.data || {};

Artbot.el = {
    html            : $('html'),
    win             : $(window),
    doc             : $(document),
    body            : $('body'),
    calendarContainer: $("#event-calendar"),
    eventCalendar   : ""
};

Artbot.util = {
    hasTouch        : Modernizr.touchcapable,
    hasPosFixed     : Modernizr.positionfixed,
    hasiOSPosFixed  : Modernizr.iospositionfixed,
    viewportWidth   : function() { return Artbot.el.win.width();     },
    viewportHeight  : function() { return Artbot.el.win.height();     },
    docHeight       : function() { return Artbot.el.doc.height();    },
    bodyHeight      : function() { return Artbot.el.body.height();    },
    footerHeight    : function() { return Artbot.el.footer.height();    },
    scrollPos       : function() { return Artbot.el.win.scrollTop(); },
    mobileMode      : function() {
        return (Artbot.util.viewportWidth() <= 767)? true : false;
    },
    desktopMode     : function() {
        return (Artbot.util.viewportWidth() >= 1024)? true : false;
    },
    orientation     : function() {
        if (typeof orientation != 'undefined') {
            return (Math.abs(window.orientation) === 90)? "landscape" : "portrait";
        } else {
            return (Artbot.util.viewportWidth() >= Artbot.util.viewportHeight()) ? "landscape" : "portrait";
        }
    },
    findQuerystring: function(qs) {
        hu = window.location.search.substring(1);
        gy = hu.split("&");
        for (i = 0; i < gy.length; i++) {
            ft = gy[i].split("=");
            if (ft[0] == qs) {
                return ft[1];
            }
        }
    },
    replaceAll: function (txt, replace, with_this) {
        return txt.replace(new RegExp(replace, 'g'),with_this);
    },
    isOldIE: function() {
        return (($.browser.msie) && ($.browser.version <= 8))? true : false;
    },
    getNumberOfChildItems: function(container) {
        var $containerObj = $(container);
        var childItemCount = 0;

        if ($containerObj.length > 0) {
            var $childrenOfContainer = $containerObj.children();
            if ($childrenOfContainer.length > 0) {
                childItemCount = $childrenOfContainer.length;
            }
        }
        return childItemCount;
    },
    isThereMore: function(data) {
        // Check to see if there are more results to show
        jsonArray = data;
        console.log(jsonArray);
        if (jsonArray.length > 0) {
            // More results to be fetched
            console.log("There are at least " + jsonArray.length + " results to be fetched");
            return true;
        } else {
            // No more results
            console.log("No more results");
            return false;
        }
    }
};

/* Logging Ajax errors */
Artbot.errors = {
    logAjaxError: function (jqXHR, error, errorThrown, isErrorAjaxResponse) {
        console.log("Error: " + errorThrown);
        console.log("jqXHR status: " + jqXHR.status + " " + jqXHR.statusText);
        if (isErrorAjaxResponse) {
            console.log("jqXHR response: " + jqXHR.responseText);
        }
    },
    showFormError: function (jsonError) {
        // Get results from JSON returned
        var result = $.parseJSON(jsonError);
        var errorText;
        var $errorSource;
        var errorLabelHTML;
        $.each(result, function(k, v) {
            $errorSource = $("#" + k);
            errorText = k.capitalize() + ' ' + v;
            console.log("Error text: " + errorText);

            $errorLabel = $("<label>")
                .attr("id", k + "-error")
                .addClass("error")
                .html(errorText)
                .attr( "for", k );

            $errorSource.addClass("error");
            $errorLabel.insertAfter( $errorSource );
        });
    }
};

/* Setting up a dataService function that can handle different Ajax requests */
Artbot.dataService = {
    getJsonFeed: function(jsonUrl, callback) {
        $.getJSON(jsonUrl, function (data) {
            callback(data);
        });
    }
};


// Variables that can be used throughout
Artbot.var = {
    itemsPerPage : 5,
    isInitialLoad: true,
    hasVisitedBefore: false,
    jsonDomain: "http://artx-staging.herokuapp.com",
    eventDetailID: 1, // acts as a fallback in case for some reason the Events data doesn't load
    venueDetailID: 1, // acts as a fallback in case for some reason the Venue data doesn't load
    relatedInterests: {} // empty object placeholder, used by Event detail to pass info to footer slider
};


/* Set up Peeking slider on Discover Page
   ========================================================================== */
Artbot.discoverSlider = {
    init: function() {
        // Assumption -- there will only ever be one peek-style slider per page/screen
        if ($("#discover-slider").find("ul").length > 0) {
            Artbot.discoverSlider.populateSlider();
        }
    },
    populateSlider: function() {

        var beforeSendFunction = function() {}; // blank function for now

        if ($.cookie('token') !== undefined) {
            beforeSendFunction = function(request) {
                request.setRequestHeader("authentication_token", $.cookie('token'));
            };
        }

        $.mobile.loading('show');

        $.ajax({
            type: "GET",
            dataType: "json",
            data: {
                per_page: 10
            },
            url: Artbot.var.jsonDomain + "/discoveries/",
            beforeSend: beforeSendFunction,
            success: function( data ) {
                console.log("Discover slider data successfully fetched");
                //console.log(JSON.stringify(data.events));
                console.log("Number of discover events fetched: " + data.events.length);
                Artbot.discoverSlider.buildSlider(data);
            },
            error: function (jqXHR, error, errorThrown) {
                console.log("Error fetching Discover slider data");
                console.log("jqXHR status: " + jqXHR.status + " " + jqXHR.statusText);
                console.log("jqXHR response: " + jqXHR.responseText);
            },
            complete: function() {
                $.mobile.loading('hide');
            }
        });
    },
    buildSlider: function(data) {
        console.log("Building discover slider");
        var eventArray = data.events;
        var slideTemplate = $('#template-discoverslider').html();
        
        $("#discover-slider").find("ul").html(_.template(slideTemplate, {eventArray:eventArray}));

        var numberOfSlides = $("#discover-slider").find("ul").children().length;

        if (numberOfSlides > 1) { // there's more than one slide to show
            Artbot.discoverSlider.initSlider();
        }

        // Initialize favorite stars
        Artbot.favoriteStars.init();

        Artbot.footerSlider.init();
    },
    initSlider: function() {
        console.log("More than one slide -- initializing Discover slider functionality");
        var peekSlideInstance = $("#discover-slider").find("ul").bxSlider({
            oneToOneTouch:false,
            pager:false,
            auto:false,
            onSliderLoad: function(currentIndex) {
                //console.log("currentIndex: " + currentIndex);
                $("#discover-slider").find("ul").find("li").eq(currentIndex).addClass("slide-prev");
                $("#discover-slider").find("ul").find("li").eq(currentIndex+2).addClass("slide-next");
            },
            onSlideBefore: function($slideElement, oldIndex, newIndex) {
                //console.log("oldIndex: " + oldIndex);
                //console.log("newIndex: " + newIndex);
                $(".slide-prev").removeClass("slide-prev");
                $(".slide-next").removeClass("slide-next");
                $("#discover-slider").find("ul").find("li").eq(newIndex).addClass("slide-prev");
                $("#discover-slider").find("ul").find("li").eq(newIndex+2).addClass("slide-next");
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

/* Set up Favorites-style slider in footer
   ========================================================================== */
Artbot.footerSlider = {
    vars: {
        footSlideInstance: "",
        footSlideOptions: {
            minSlides:2,
            maxSlides:4,
            slideWidth:200,
            slideMargin:0,
            oneToOneTouch:false,
            pager:false
        },
        pageSize: 15,
        slideTemplate: "",
        relatedInterestCounter: 0,
        totalRelatedInterests: 0,
        locationRadius: 10  // Mile radius for nearby events
    },
    init: function() {
        if ($("#footer-slider").length > 0) {
            
            Artbot.footerSlider.vars.relatedInterestCounter = 0; // on startup

            // Set up some variables
            if ($("#favorites-slider").length > 0) {
                /* Favorites slider */
                
                Artbot.footerSlider.vars.slideTemplate = $('#template-favoriteslider').html();

            } else {
                /* Generic Events slider */

                Artbot.footerSlider.vars.slideTemplate = $('#template-eventslider').html();
            }

            // Populate the slider with data
            Artbot.footerSlider.populateSlider();
        }
    },
    populateSlider: function() {
    
        var ajaxURL;
        var beforeSendFunction = function() {}; // blank function for now

        // First, which footer slider is it?

        if ($("#favorites-slider").length > 0) {
            /* Favorites slider */

            console.log("Initializing Favorites slider");
            
            // Check if the user is logged in
            if ($.cookie('token') !== undefined) {
                
                // User is logged in, so we can fetch the favorites

                $.ajax({
                    type: "GET",
                    dataType: "json",
                    data: {
                        "per_page": Artbot.footerSlider.vars.pageSize
                    },
                    url: Artbot.var.jsonDomain + "/favorites/",
                    beforeSend: function(request) {
                        request.setRequestHeader("authentication_token", $.cookie('token'));
                    },
                    success: function( data ) {
                        console.log("Footer slider data successfully fetched");
                        
                        var jsonString = JSON.stringify(data.favorites);

                        // Hide any existing messages
                        $(".footer-slider-msg").hide();

                        if (jsonString.length > 2) {
                            // Favorites were returned, make the slider
                            // console.log(jsonString);
                            Artbot.footerSlider.buildSlider(data);
                            Artbot.footerSlider.initSlider();
                        } else {
                            // No favorites returned, show the "no favorites yet" message
                            $("#footer-slider-msg-nofavorites").fadeIn(400);
                        }
                    },
                    error: function (jqXHR, error, errorThrown) {
                        console.log("Error fetching footer slider data");
                        console.log("jqXHR status: " + jqXHR.status + " " + jqXHR.statusText);
                        console.log("jqXHR response: " + jqXHR.responseText);
                    }
                });

            } else {
                
                // User is not logged in, show the appropriate message
                $("#footer-slider-msg-favoritesignup").fadeIn(400);

            }
        } else if ($("#venue-events-slider").length > 0) {
            /* Related Events slider for Venue pages */

            console.log("Initializing Related Events slider");

            // Get the Venue ID from the .venue-detail div
            //var venueID = $(".venue-detail").attr("data-venue-id");
            var venueID = Artbot.var.venueDetailID;
            console.log("Venue ID: " + venueID);

            $.ajax({
                type: "GET",
                dataType: "json",
                data: {
                    "per_page": Artbot.footerSlider.vars.pageSize
                },
                url: Artbot.var.jsonDomain + "/locations/" + venueID + "/events",
                success: function( data ) {
                    console.log("Footer slider data successfully fetched");
                    
                    var jsonString = JSON.stringify(data.events);

                    // Hide any existing messages
                    $(".footer-slider-msg").hide();

                    if (jsonString.length > 2) {
                        // Events were returned, make the slider
                        // console.log(jsonString);
                        Artbot.footerSlider.buildSlider(data);
                        Artbot.footerSlider.initSlider();
                    } else {
                        // No events returned, show the "no events" message
                        $("#footer-slider-msg-noevents").fadeIn(400);
                    }
                },
                error: function (jqXHR, error, errorThrown) {
                    console.log("Error fetching footer slider data");
                    console.log("jqXHR status: " + jqXHR.status + " " + jqXHR.statusText);
                    console.log("jqXHR response: " + jqXHR.responseText);
                }
            });

        } else if ($("#related-interest-slider").length > 0) {
            /* Related Interest slider for Event Detail pages */

            console.log("Initializing Related Interest slider");

            var jsonString = JSON.stringify(Artbot.var.relatedInterests);

            //console.log(jsonString);

            if (jsonString.length > 2) {
                // There are related interests

                var numberOfTags = 0;

                $.each(Artbot.var.relatedInterests, function (key, value) {
                    numberOfTags++;
                });

                Artbot.footerSlider.vars.totalRelatedInterests = numberOfTags - 1; // zero-based index

                //console.log("Number of tags: " + numberOfTags);
                
                // Create click event to trigger cycleRelatedInterests
                $("#cycle-relatedinterest").click(function(){
                    Artbot.footerSlider.cycleRelatedInterests(Artbot.var.relatedInterests);
                    return false;
                });

                // Trigger cycleRelatedInterests
                Artbot.footerSlider.cycleRelatedInterests(Artbot.var.relatedInterests);

            } else {
                // TODO: Show error for no results
                $("#footer-slider-msg-noevents").fadeIn(400);
            }

        } else if ($("#near-you-slider").length > 0) {
            /* Near You slider for map page */

            console.log("Initializing Near You slider");

            // First, we have to try to get the user's current position.
            Artbot.geolocation.getLocation(Artbot.footerSlider.processNearbyEvents, Artbot.footerSlider.hideFooter);

        }
    },
    processNearbyEvents: function() {
        // Check if we were successful
        console.log("Location call made, checking if values are correct");

        if ((Artbot.geolocation.vars.currentLatitude !== "") && (Artbot.geolocation.vars.currentLongitude !== "")) {
            
            console.log("My latitude: " + Artbot.geolocation.vars.currentLatitude);

            // We have a position; fetch events
            $.ajax({
                type: "GET",
                dataType: "json",
                url: Artbot.var.jsonDomain + "/events",
                data: {
                    latitude: Artbot.geolocation.vars.currentLatitude,
                    longitude: Artbot.geolocation.vars.currentLongitude,
                    radius: Artbot.footerSlider.vars.locationRadius,
                    "per_page": Artbot.footerSlider.vars.pageSize
                },
                success: function( data ) {
                    console.log("Footer slider data successfully fetched");
                    
                    var jsonString = JSON.stringify(data.events);
                    //console.log(jsonString);

                    // Hide any existing messages
                    $(".footer-slider-msg").hide();

                    if (jsonString.length > 2) {
                        // Events were returned, make the slider
                        // console.log(jsonString);
                        Artbot.footerSlider.buildSlider(data);
                        Artbot.footerSlider.initSlider();
                    } else {
                        // No events returned, show the "no events in radius" message
                        $("#location-radius").html(Artbot.footerSlider.vars.locationRadius);
                        $("#footer-slider-msg-noeventsnearby").fadeIn(400);
                    }
                },
                error: function (jqXHR, error, errorThrown) {
                    console.log("Error fetching footer slider data");
                    console.log("jqXHR status: " + jqXHR.status + " " + jqXHR.statusText);
                    console.log("jqXHR response: " + jqXHR.responseText);
                },
                complete: function() {
                    $.mobile.loading('hide');
                }
            }); 
        } else {
            // Couldn't get a position; hide footer
            Artbot.footerSlider.hideFooter();
            $.mobile.loading('hide');
        }
    },
    hideFooter: function() {
        console.log("Hiding the footer");
        $(".content.layout-footer").removeClass("layout-footer");
        $(".footer").hide();
    },
    cycleRelatedInterests: function(data) {
        var currentInterest = data[Artbot.footerSlider.vars.relatedInterestCounter];

        console.log("Interest counter going into the function: " + Artbot.footerSlider.vars.relatedInterestCounter);
        //console.log("Here's the current interest:");
        //console.log(JSON.stringify(currentInterest));

        // Show spinner
        $.mobile.loading('show');

        // Remove any existing contents of the slider
        $("#footer-slider").empty();

        // Change the text of slider header (#target-relatedinterest)
        $("#target-relatedinterest").text(currentInterest.tag.name);

        $(".footer-slider-msg").hide();

        // Build slider with events via _.template
        var itemArray = currentInterest.events;
        Artbot.footerSlider.buildSlider(itemArray);

        if (Artbot.footerSlider.vars.footSlideInstance === "") {
            // There were no favorites before, so we need to initialize the slider
            Artbot.footerSlider.initSlider();

        } else {
            // Slider is already initialized, we need to reload it
            Artbot.footerSlider.reload();
        }

        // Hide spinner
        $.mobile.loading('hide');


        // Iterate the counter variable
        if(Artbot.footerSlider.vars.relatedInterestCounter < Artbot.footerSlider.vars.totalRelatedInterests) {
            Artbot.footerSlider.vars.relatedInterestCounter++;
        } else {
            Artbot.footerSlider.vars.relatedInterestCounter = 0;
        }

    },
    buildSlider: function(data) {

        console.log("Building footer slider");
        var itemArray;
        var slideTemplate;

        if ($("#favorites-slider").length > 0) {
            /* Favorites slider */
            
            console.log("Initializing Favorites slider");
            itemArray = data.favorites;  

        } else if ($("#related-interest-slider").length > 0) {
            /* Related Interest slider for Event Detail pages */

            console.log("Initializing Related Interest slider");
            itemArray = data; // TODO: Get the correct data structure
        } else {
            /* Events slider for Venue and By Location pages */

            console.log("Initializing Events slider");
            itemArray = data.events;

        }

        $("#footer-slider").html(_.template(Artbot.footerSlider.vars.slideTemplate, {itemArray:itemArray}));
        
    },
    initSlider: function() {
        Artbot.footerSlider.vars.footSlideInstance = $("#footer-slider").bxSlider(Artbot.footerSlider.vars.footSlideOptions);
        Artbot.footerSlider.initSliderNav();
    },
    initSliderNav: function() {
        $(".footer-slider").removeClass("not-enough-slides");

        var numberOfSlides = $("#footer-slider").children("li:not(.bx-clone)").length;
        console.log("Number of footer slides: " + numberOfSlides);

        $('#footer-slider-next').unbind("click");
        $('#footer-slider-previous').unbind("click");

        if (numberOfSlides > 2) {
            $('#footer-slider-next').click(function(){
              Artbot.footerSlider.vars.footSlideInstance.goToNextSlide();
              return false;
            });

            $('#footer-slider-previous').click(function(){
              Artbot.footerSlider.vars.footSlideInstance.goToPrevSlide();
              return false;
            });
        } else {
            $(".footer-slider").addClass("not-enough-slides");
        }
    },
    addFavorite: function(favoriteData) {
        // Add a new favorite to the slider 
        console.log("Adding a new favorite to the footer slider");   

        if (Artbot.footerSlider.vars.footSlideInstance === "") {
            // There were no favorites before, so we need to initialize the slider
            
            $(".footer-slider-msg").hide();
            Artbot.footerSlider.init();

        } else {
            // Slider is already initialized, add our new favorite to the existing slider
            
            var itemArray = favoriteData;
            var eventHtml = _.template(Artbot.footerSlider.vars.slideTemplate, {itemArray:itemArray});
            $(eventHtml).prependTo($("#footer-slider"));
            Artbot.footerSlider.reload();
        }   
    },
    removeFavorite: function(selectedEventID) {
        // Remove a favorite from the slider, if we're on the homepage
        // The event ID to delete is passed into the function

        //Find the link with the matching event ID, grab the parent LI and .remove() it
        $("#footer-slider").find("a[href='event.html?eventid=" + selectedEventID + "']").parent("li").remove();

        // Count how many non-cloned children the footer slider now has
        var numberOfSlides = $("#footer-slider").children("li:not(.bx-clone)").length;
        console.log("Number of non-cloned children: " + numberOfSlides);

        if (numberOfSlides > 0) {
            // Reload the slider
            Artbot.footerSlider.reload();

        } else {
            // We removed all the favorites; show the "no favorites yet" message
            $("#footer-slider-msg-nofavorites").fadeIn(400);
        }
    },
    reload: function() {
        if (($("#footer-slider").length > 0) && (Artbot.footerSlider.vars.footSlideInstance !== "")) {
            
            console.log("Reloading footer slider");
  
            Artbot.footerSlider.vars.footSlideInstance.reloadSlider(Artbot.footerSlider.vars.footSlideOptions);
            Artbot.footerSlider.initSliderNav();

        }
    },
    destroy: function() {
        if (($("#footer-slider").length > 0) && (Artbot.footerSlider.vars.footSlideInstance !== "")) {
            console.log("Destroying footer slider");
            $("#footer-slider").fadeOut(400, function() {
                Artbot.footerSlider.vars.footSlideInstance.destroySlider();
                Artbot.footerSlider.vars.footSlideInstance = "";
                $("#footer-slider").empty();

                $("#footer-slider").fadeIn(400);
            });
        }
    }
};


/* Set up Favorite stars
   ========================================================================== */

Artbot.favoriteStars = {
    init: function() {
        if ($(".favorite-star").length > 0) {
            console.log("Initializing favorite stars");

            // First, destroy any current star bindings so that we can call this
            // wherever we want, without duplicating events
            Artbot.favoriteStars.destroy();

            Artbot.favoriteStars.sync();

            $(".favorite-star").click(function() {

                if ($.cookie('token') === undefined) {
                    // The user is not logged in, we can't save a favorite

                    console.log("We can't toggle a favorite because the user is not logged in.");

                    Artbot.signupModal.open();

                } else {
                    // The user is logged in, so we can save or delete the favorite

                    // Capture the Event ID from the data-attribute on the clicked link
                    var selectedEventID = $(this).data("event-id");

                    // Is the click to set a favorite, or unset a favorite?
                    var $thisStarLink = $(this);
                    var $thisStarIcon = $(this).find(".icon");

                    if ($thisStarIcon.hasClass("icon-star")) {
                        // The user wishes to make this event a favorite

                        $.mobile.loading('show');

                        $.ajax({
                            type: "POST",
                            url: Artbot.var.jsonDomain + "/events/" + selectedEventID + "/favorite/",
                            beforeSend: function (request) {
                                request.setRequestHeader("authentication_token", $.cookie('token'));
                            },
                            success: function(data, textStatus, jqXHR) {
                                console.log("New favorite successfully saved");

                                var selectedFavoriteID = data.favorite.id;
                                // Swap the star
                                Artbot.favoriteStars.highlightStar($thisStarLink, selectedFavoriteID);
                                // If it exists on the page, reload the favorites slider with the new favorite
                                //if (($("#favorites-slider").length > 0) && (Artbot.footerSlider.vars.footSlideInstance !== "")) {
                                if ($("#favorites-slider").length > 0) {
                                    Artbot.footerSlider.addFavorite(data);
                                }
                            },
                            error: function (jqXHR, error, errorThrown) {
                                console.log("Error saving favorite");
                                Artbot.errors.logAjaxError(jqXHR, error, errorThrown);
                            },
                            complete: function() {
                                $.mobile.loading('hide');
                            }
                        });

                    } else {
                        // The user wishes to remove favorite status
                        $.mobile.loading('show');

                        // Capture the User Favorite ID from the data-attribute on the clicked link
                        var selectedUserEventID = $(this).attr("data-user-favorite-id");

                        console.log("ID to delete: " + selectedUserEventID);

                        $.ajax({
                            type: "POST",
                            url: Artbot.var.jsonDomain + "/favorites/" + selectedUserEventID,
                            data:  {
                                "_method":"delete"
                            },
                            beforeSend: function (request) {
                                request.setRequestHeader("authentication_token", $.cookie('token'));
                            },
                            success: function(data, textStatus, jqXHR) {
                                console.log("Favorite successfully deleted");
                                // Swap the star
                                Artbot.favoriteStars.unhighlightStar($thisStarLink);
                                // If favorites slider exists, remove favorite from slider
                                if (($("#favorites-slider").length > 0)) {
                                    Artbot.footerSlider.removeFavorite(selectedEventID);
                                }
                                // If we're on the Favorites page, remove the favorite from the page
                                /*
                                if ($("#target-favoritelist").length > 0) {
                                    Artbot.favoriteList.removeFavorite(selectedEventID);
                                }
                                */
                                // If we're on the History page, remove the favorite from the page
                                /*
                                if ($("#target-historylist").length > 0) {
                                    Artbot.historyList.removeFavorite(selectedEventID);
                                }
                                */
                            },
                            error: function (jqXHR, error, errorThrown) {
                                console.log("Error deleting favorite");
                                Artbot.errors.logAjaxError(jqXHR, error, errorThrown);
                            },
                            complete: function() {
                                $.mobile.loading('hide');
                            }
                        });
                    }
                }

                return false;
            });
        }
    },
    destroy : function() {
        if ($(".favorite-star").length > 0) {
            console.log("Destroying favorite star click events");
            $(".favorite-star").unbind("click");
        }
    },
    sync : function() {
        /* This function checks all favorite stars currently present in the page, and compares them against the current user's saved favorites (if logged in).  If there's a match, that star will be highlighted. */

        if (($(".favorite-star").length > 0) && ($.cookie('token') !== undefined)) {
            console.log("Syncing stars with user's favorites");

            // Fetch the list of user's favorites to check against.
            $.ajax({
                type: "GET",
                url: Artbot.var.jsonDomain + "/favorites/",
                data: {
                    page: 1,
                    per_page: 10000
                },
                beforeSend: function (request) {
                    request.setRequestHeader("authentication_token", $.cookie('token'));
                },
                success: function(data, textStatus, jqXHR) {
                    console.log("Successfully fetched Favorites data for syncing stars");
                    //console.log(JSON.stringify(data));

                    var userFavorites = data.favorites;

                    // We'll start by iterating through each favorite
                    $.each(userFavorites, function(i, value) {
                        var userFavorite = userFavorites[i];
                        var userFavoriteEventID = userFavorite.event.id;
                        var userFavoriteID = userFavorite.id;

                        // Then let's compare that favorite ID to the corresponding ones on the page
                        $(".favorite-star").each(function() {
                            var pageFavoriteEventID = $(this).attr("data-event-id");

                            // If they match, highlight the star
                            if (pageFavoriteEventID == userFavoriteEventID) {
                                Artbot.favoriteStars.highlightStar($(this), userFavoriteID);
                            }
                        });
                    });

                    // Now we have to do the same for History, because Favorites is now only future and present events, and our event might be in the past.
                    // Nested Ajax calls are ugly but necessary because of asynchronous scripting.

                    // Fetch the list of user's history to check against.
                    
                    $.ajax({
                        type: "GET",
                        url: Artbot.var.jsonDomain + "/favorites/history/",
                        beforeSend: function (request) {
                            request.setRequestHeader("authentication_token", $.cookie('token'));
                        },
                        data: {
                            page: 1,
                            per_page: 10000
                        },
                        success: function(data, textStatus, jqXHR) {
                            console.log("Successfully fetched History data for syncing stars");
                            //console.log(JSON.stringify(data));

                            var userHistories = data.favorites;

                            // We'll start by iterating through each history item
                            $.each(userHistories, function(i, value) {
                                var userHistory = userHistories[i];
                                var userHistoryEventID = userHistory.event.id;
                                var userHistoryID = userHistory.id;

                                // Then let's compare that favorite ID to the corresponding ones on the page
                                $(".favorite-star").each(function() {
                                    var pageHistoryEventID = $(this).attr("data-event-id");

                                    // If they match, highlight the star
                                    if (pageHistoryEventID == userHistoryEventID) {
                                        Artbot.favoriteStars.highlightStar($(this), userHistoryID);
                                    }
                                });
                            });
                        },
                        error: function (jqXHR, error, errorThrown) {
                            console.log("Error fetching History data to sync stars");
                            Artbot.errors.logAjaxError(jqXHR, error, errorThrown);
                        }
                    }); 
                },
                error: function (jqXHR, error, errorThrown) {
                    console.log("Error fetching Favorites data to sync stars");
                    Artbot.errors.logAjaxError(jqXHR, error, errorThrown);
                }
            });
        }
    },
    highlightStar : function(starLinkObj, userFavoriteID) {
        var $thisStarLink = $(starLinkObj);
        var $thisStarIcon = $thisStarLink.find(".icon");

        console.log("Highlighting a favorite star!  User favorite ID: " + userFavoriteID);

        // Swap the star icon
        $thisStarIcon.removeClass("icon-star").addClass("icon-star2");

        // Give the star link a user favorite ID to use in deletion
        $thisStarLink.attr("data-user-favorite-id", userFavoriteID);
    },
    unhighlightStar : function(starLinkObj) {
        var $thisStarLink = $(starLinkObj);
        var $thisStarIcon = $thisStarLink.find(".icon");

        $thisStarIcon.removeClass("icon-star2").addClass("icon-star");
        $thisStarLink.removeAttr("data-user-favorite-id");
    }
};

/* Set up Text Truncation
   ========================================================================== */
Artbot.setupTextTruncation = function() {
    console.log("Initializing text truncation");

    $(".truncate").trunk8({
        lines: 2,
        tooltip: false
    });

    // Set up a resize event for truncated text
    Artbot.el.win.resize(function() {
        $(".truncate").trunk8({
            lines: 2,
            tooltip: false
        });
    });
};

/* Set up Signup Modal
   ========================================================================== */
Artbot.signupModal = {
    vars: {
        returnToPage: ""
    },
    init: function() {
        console.log("Setting up Signup Modal window");

        // Set up some click events for the sign up links
        $(document).on("click", ".signup-trigger", function() {
            // Open modal
            Artbot.signupModal.open();
        });
    },
    ajaxSubmit: function() {
        $.mobile.loading('show');
        $.ajax({
            type: "POST",
            dataType: "json",
            url: Artbot.var.jsonDomain + "/registrations",
            data: {
                email: $("#email").val(),
                password:  $("#password").val(),
                password_confirmation: $("#confirmpassword").val(),
                zipcode:  $("#zipcode").val()
            },
            success: function( data ){
                console.log(data);
                $.cookie('token', data.user.authentication_token);
                $.cookie('currentuser', $("#email").val());
                $.cookie('signedup', true, { expires: 3650 });
                $.mobile.pageContainer.pagecontainer ("change", "interests.html", {reloadPage: true});
            },
            error: function (jqXHR, error, errorThrown) {
                console.log("User registration failed");
                Artbot.errors.logAjaxError(jqXHR, error, errorThrown);
                Artbot.errors.showFormError(jqXHR.responseText);
                $.mobile.loading('hide');
            }
        });
    },
    open: function() {
        // Record which page to return to after signup
        if ($(".ui-page-active").attr("data-url") != "/sign-in.html") {
            Artbot.signupModal.vars.returnToPage = $(".ui-page-active").attr("data-url");
        } else {
            Artbot.signupModal.vars.returnToPage = "/index.html";
        }
        
        console.log("Return to page: " + Artbot.signupModal.vars.returnToPage);

        // Load up the form into the modal window
        $.mobile.loading('show');
        $("#signup-form").load("/signup-form.html", function(jqXHR, error, errorThrown) {
            
            if (status == "error") {
                console.log("Failed to load the signup form into the modal");
                Artbot.errors.logAjaxError(jqXHR, error, errorThrown);
            } else {
                // Create the form for jQM
                $("#signup-form").trigger('create');
                // Open the popup
                $("#signup-popup").popup("open");

                // Set up form submit
                $("#signup-form").validate({
                    submitHandler: Artbot.signupModal.ajaxSubmit
                });
            }

            $.mobile.loading('hide');
        });
    },
    close: function() {
        // Remove the form fields so we won't have conflicts
        $("#signup-form").empty();
    }
};

/* Set up custom checkboxes
   ========================================================================== */
Artbot.customCheckboxes = {
    init: function(targetContainer) {
        var $checkboxes;

        if (targetContainer !== undefined && targetContainer !== null) {
            $checkboxes = $(targetContainer).find(".customize-checkbox");
        } else {
            $checkboxes = $(".customize-checkbox");
        }

        if ($checkboxes.length > 0) {
            console.log("Setting up custom checkboxes");
            $checkboxes.customInput();
        }
    },
    destroy: function(targetContainer) {
        var $checkboxes;

        if (targetContainer !== undefined && targetContainer !== null) {
            $checkboxes = $(targetContainer).find(".customize-checkbox");
        } else {
            $checkboxes = $(".customize-checkbox");
        }

        if ($checkboxes.length > 0) {
            console.log("Destroying custom checkboxes");
            $checkboxes.customInput("destroy");
        }
    }
};


/* Set up Event Detail
   ========================================================================== */

Artbot.eventdetail = {
    init: function() {
        if ($("#template-eventdetail").length > 0) {
            Artbot.eventdetail.initPage();
        }  
    },
    initPage : function() {
        $.mobile.loading('show');

        // Get the desired event ID from a querystring
        var qsEventID = Artbot.util.findQuerystring("eventid");
        //console.log("Event ID passed in via querystring: " + qsEventID);
        if (typeof qsEventID != 'undefined') {
            Artbot.var.eventDetailID = qsEventID;
        }
        
        // Fetch the data with the event ID
        $.ajax({
            type: "GET",
            dataType: "json",
            data: {
                related: true
            },
            url: Artbot.var.jsonDomain + "/events/" + Artbot.var.eventDetailID,
            success: function( data ){
                console.log("Event detail data fetch successful");
                
                //console.log(JSON.stringify(data));
                var eventArray = data;

                // Store the related interest information in a variable for the footer slider scripts
                Artbot.var.relatedInterests = data.event.related;

                Artbot.eventdetail.displayPage(eventArray);
            },
            error: function (jqXHR, error, errorThrown) {
                console.log("Event detail data fetch failed");
                Artbot.errors.logAjaxError(jqXHR, error, errorThrown);
            },
            complete: function() {
                $.mobile.loading('hide');
            }
        });
    },
    displayPage: function(jsonData) {
        console.log("Displaying event detail page content");
        var eventArray = jsonData;
        var eventTemplate = $('#template-eventdetail').html();

        //console.log("Event type: " + eventArray.event.event_type);

        if (eventArray.event.event_type == "event") {
            $("h1").find("a").text("Event");
        }

        $("#target-eventdetail").fadeOut(400, function() {
            $("#target-eventdetail").html(_.template(eventTemplate, {eventArray:eventArray}));
            Artbot.favoriteStars.init();
            $("#target-eventdetail").fadeIn(400);

            Artbot.footerSlider.init();
        });
    }
};

/* Set up Venue Detail
   ========================================================================== */

Artbot.venuedetail = {
    init: function() {
        if ($("#template-venuedetail").length > 0) {
            Artbot.venuedetail.initPage();
        }        
    },
    initPage : function() {
        $.mobile.loading('show');
        
        // Get the desired venue ID from a querystring
        var qsVenueID = Artbot.util.findQuerystring("venueid");
        //console.log("Venue ID passed in via querystring: " + qsVenueID);
        if (typeof qsVenueID != 'undefined') {
            Artbot.var.venueDetailID = qsVenueID;
        }

        $.ajax({
            type: "GET",
            dataType: "json",
            data: {
                related: true
            },
            url: Artbot.var.jsonDomain + "/locations/" + Artbot.var.venueDetailID,
            success: function( data ){
                console.log("Venue detail data fetch successful");
                
                //console.log(JSON.stringify(data));
                var venueArray = data;
                Artbot.venuedetail.displayPage(venueArray);
            },
            error: function (jqXHR, error, errorThrown) {
                console.log("Venue detail data fetch failed");
                Artbot.errors.logAjaxError(jqXHR, error, errorThrown);
            },
            complete: function() {
                $.mobile.loading('hide');
            }
        });
    },
    displayPage: function(jsonData) {
        console.log("Displaying venue detail page content");
        var venueArray = jsonData;
        var venueTemplate = $('#template-venuedetail').html();
        $("#target-venuedetail").fadeOut(400, function() {
            $("#target-venuedetail").html(_.template(venueTemplate, {venueArray:venueArray}));
            $("#target-venuedetail").fadeIn(400);
            console.log("Venue page content finished displaying");

            Artbot.footerSlider.init();
        });
    }
};

/* Set up By Date Event Calendar
   ========================================================================== */
Artbot.calendar = {
    getEvents: function(desiredMonth, desiredYear) {

        var jsonURL = Artbot.var.jsonDomain + "/events";

        $.mobile.loading('show');
        $.ajax({
            type: "GET",
            dataType: "json",
            data: {
                year: desiredYear,
                month: desiredMonth,
                per_page: 1000
            },
            url: jsonURL,
            success: function( data ){
                console.log("Initial calendar event fetch successful");

                //console.log(JSON.stringify(data));

                eventArray = data.events;
                //console.log("Number of events returned: " + data.events.length);

                // Create a Clndr and save the instance as myCalendar
                Artbot.el.eventCalendar = $("#event-calendar").clndr({
                    template: $('#template-calendar').html(),
                    events: eventArray,
                    dateParameter: 'start_date',
                    multiDayEvents: {
                        startDate: 'start_date',
                        endDate: 'end_date'
                    },
                    clickEvents: {
                        click: function(target) {
                            // if we click on a day
                            if ($(target.element).hasClass("day")) {
                                //console.log("Day clicked!");
                                // clear any existing selection states
                                $(".day").removeClass("day-selected");
                                // select the new day
                                $(target.element).addClass("day-selected");
                                // and display events for that day

                                // Check to see what the results are
                                var checkData = JSON.stringify(target.events);

                                if (checkData.length > 2) {
                                    // Event data returned, show the list
                                    Artbot.calendar.displayEventList(target);
                                } else {
                                    // No events, show error
                                    Artbot.calendar.showErrorMsg("noevents");
                                }
       
                            } else {
                                //console.log("Click target not a day.");
                            }
                        },
                        onMonthChange: function(month) {
                            var chosenMonth = month.format("MM");
                            //console.log("Month change!  New month: " + chosenMonth);
                            var chosenYear = month.format("YYYY");
                            var jsonURL = Artbot.var.jsonDomain + "/events";
                            var newEventArray = [];

                            $.mobile.loading('show');
                            $.ajax({
                                type: "GET",
                                dataType: "json",
                                url: jsonURL,
                                data: {
                                    year: chosenYear,
                                    month: chosenMonth,
                                    per_page: 1000
                                },
                                success: function( data ){
                                    console.log("Events for " + chosenMonth + " " + chosenYear + " retrieved successfully");

                                    //console.log(JSON.stringify(data));
                                    //console.log("Number of events returned: " + data.events.length);

                                    newEventArray = data.events;
                                    Artbot.el.eventCalendar.setEvents(newEventArray);
                                },
                                error: function (jqXHR, error, errorThrown) {
                                    console.log("Events for " + chosenMonth + " " + chosenYear + " failed");
                                    Artbot.errors.logAjaxError(jqXHR, error, errorThrown);
                                },
                                complete: function() {
                                    $.mobile.loading('hide');
                                }
                            });
                        }
                    },
                    doneRendering: function(){
                        var thisMonth = moment().format("MMMM");
                        var thisYear = moment().format("YYYY");
                        var thisDate = thisMonth + " " + thisYear;
                        var displayedMonth = $(".clndr-controls").find(".month").html();
                        //console.log("This date: " + thisDate);
                        //console.log("Displayed month: " + displayedMonth);
                        
                        if (thisDate == displayedMonth) {
                            // It's this month
                            // Show the events for today
                            $(".day.today").trigger("click");
                        } else {
                            // It's a month in the past or future
                            // Show the events for the first day of the month
                            if ($(".last-month").last().next().length > 0) {
                                $(".last-month").last().next().trigger("click");
                            } else {
                                $(".day").first().trigger("click");
                            }
                        }
                    }
                });
            },
            error: function (jqXHR, error, errorThrown) {
                console.log("Initial calendar event fetch failed");
                Artbot.errors.logAjaxError(jqXHR, error, errorThrown);
            },
            complete: function() {
                $.mobile.loading('hide');
            }
        });
    },
    displayEventList: function(target) {
        console.log("Displaying event list");

        // hide any current error messages
        $("#event-list-messages").find("p").fadeOut(400);

        var eventArray = target.events;
        var eventTemplate = $('#template-eventlist').html();
        $("#event-list").fadeOut(400, function() {
            $("#event-list").html(_.template(eventTemplate, {eventArray:eventArray}));
            Artbot.favoriteStars.init();
            $("#event-list").fadeIn(400, function() {
                // Re-do truncation once fade is complete
                Artbot.setupTextTruncation();
            });
        });
    },
    showErrorMsg: function(errorID) {
        // Hide event list
        $("#event-list").fadeOut( 400, function() {
            $("#event-list").empty().show();
        });
        $("#event-list-msg-"+errorID).fadeIn(400);
    },
    init: function() {
        if ($("#event-calendar").length > 0) {
            console.log("Setting up event calendar");

            var eventArray = [],
                thisMonth = moment().month(), // integer from 0 to 11
                thisYear = moment().year();   // 4-digit year, ex. 2014

            // Adjust the month value by one, to be an integer from 1 to 12
            thisMonth++;

            Artbot.calendar.getEvents(thisMonth, thisYear);
        }
    }
};


/* Set up Load More functionality
   ========================================================================== */
Artbot.loadMore = {
    vars: {
        loadMoreLink : $("#load-more"),
        nextPageJsonURL : "",
        itemContainer : "",
        itemTemplate : $("#item-template").html(),
        currentPage : 1,
        nextPage : 2
    },
    setupLoadMoreLink: function() {
        console.log("Setting up the Load More link click events");

        Artbot.loadMore.vars.loadMoreLink
            .removeClass("btn-hidden") // Show the Load More link
            .click(function() {
                $.mobile.loading('show');

                // Fade out the button, so that we don't get into a situation where a slow Ajax load
                // leaves the button there, and a frustrated user clicks a million times and you
                // get lots of multiple entries

                Artbot.loadMore.vars.loadMoreLink.fadeOut();

                var jsonArray;
                var $newResults;

                // Get the results from an Ajax call to the JSON data

                // Figure out which page to fetch

                /*  DEV NOTE: When this is hooked up to a real JSON feed,
                    we'll feed it the next page URL from the Load More link's data-feed attribute like this:

                    Artbot.loadMore.vars.nextPageJsonURL = Artbot.loadMore.vars.loadMoreLink.data("feed");
                    Artbot.loadMore.vars.nextPageJsonURL += "/" + Artbot.loadMore.vars.nextPage + "/" + Artbot.var.itemsPerPage;

                    But since this is a demo with static JSON files, we're putting in a temporary switch statement for it here: */

                var temporaryJsonURL = Artbot.loadMore.vars.loadMoreLink.data("feed");

                switch(temporaryJsonURL) {
                    case "/GetEventsByLocation/" :
                        Artbot.loadMore.vars.nextPageJsonURL = "/ui/js/json/getEventsByLocation-page" + Artbot.loadMore.vars.nextPage + ".json";
                        break;
                    case "/LoadFavorites/" :
                        Artbot.loadMore.vars.nextPageJsonURL = "/ui/js/json/loadFavorites-page" + Artbot.loadMore.vars.nextPage + ".json";
                        break;
                    default:
                        Artbot.loadMore.vars.nextPageJsonURL = "/ui/js/json/loadFavorites-page" + Artbot.loadMore.vars.nextPage + ".json";
                }

                $.getJSON(Artbot.loadMore.vars.nextPageJsonURL, function(data) {
                    jsonArray = data;

                    // Format results with underscore.js template
                    // Assign those results to a variable and chain .hide()
                    $newResults = $(_.template(Artbot.loadMore.vars.itemTemplate, {jsonArray:jsonArray})).hide();

                    // Append newResults to the list
                    $newResults.appendTo(Artbot.loadMore.vars.itemContainer);

                    // Fade in the new results
                    $newResults.fadeIn();

                    // Re-do truncation
                    Artbot.setupTextTruncation();

                    // Update the variables
                    Artbot.loadMore.vars.currentPage = Artbot.loadMore.vars.nextPage;
                    Artbot.loadMore.vars.nextPage = Artbot.loadMore.vars.nextPage + 1;

                    // Check to see if we still need to show the Load More link
                    // Hide if not needed anymore

                    var currentItemsCount = Artbot.util.getNumberOfChildItems(Artbot.loadMore.vars.itemContainer);

                    /*  DEV NOTE: When this is hooked up to a real JSON feed,
                        we'll feed it the next page URL from the Load More link's data-feed attribute like this:

                        Artbot.loadMore.vars.nextPageJsonURL = Artbot.loadMore.vars.loadMoreLink.data("feed");
                        Artbot.loadMore.vars.nextPageJsonURL += Artbot.loadMore.vars.nextPage;

                        But since this is a demo with static JSON files, we're putting in a temporary switch statement for it here: */

                    var temporaryJsonURL = Artbot.loadMore.vars.loadMoreLink.data("feed");

                    switch(temporaryJsonURL) {
                        case "/GetEventsByLocation/" :
                            Artbot.loadMore.vars.nextPageJsonURL = "/ui/js/json/getEventsByLocation-page" + Artbot.vars.nextPageJsonURL + ".json";
                            break;
                        case "/LoadFavorites/" :
                            Artbot.loadMore.vars.nextPageJsonURL = "/ui/js/json/loadFavorites-page" + Artbot.loadMore.vars.nextPage + ".json";
                            break;
                        default:
                            Artbot.loadMore.vars.nextPageJsonURL = "/ui/js/json/loadFavorites-page" + Artbot.loadMore.vars.nextPage + ".json";
                    }

                    // Check to see if there are more results to show
                    Artbot.dataService.getJsonFeed(Artbot.loadMore.vars.nextPageJsonURL, function(data) {
                            var isMoreResults = Artbot.util.isThereMore(data);
                            if (isMoreResults) {
                                // More results; we need to show the "Load More" link again
                                Artbot.loadMore.vars.loadMoreLink.fadeIn();
                            }
                        }
                    );

                    $.mobile.loading('hide');

                });
            });
    },
    init: function() {
        if (Artbot.loadMore.vars.loadMoreLink.length > 0) {
            console.log("Initializing Load More functionality");

            // We need to check to see how many items are currently being shown.
            // If the number of items equals our number-per-page variable,
            // check to see if there are more results to show.

            // First, let's get the item container and assign it to a variable
            // Assumption: the load more link is always directly preceded by the item container
            Artbot.loadMore.vars.itemContainer = Artbot.loadMore.vars.loadMoreLink.prev();

            var currentItemsCount = Artbot.util.getNumberOfChildItems(Artbot.loadMore.vars.itemContainer);

            if (currentItemsCount == Artbot.var.itemsPerPage) {
                // There's the same amount as our items per page,
                // so there might be more to pull down

                /*  DEV NOTE: When this is hooked up to a real JSON feed,
                    we'll feed it the page 2 URL from the Load More link's data-feed attribute like this:

                    Artbot.loadMore.vars.nextPageJsonURL = Artbot.loadMore.vars.loadMoreLink.data("feed");
                    Artbot.loadMore.vars.nextPageJsonURL += "2";

                    But since this is a demo with static JSON files, we're putting in a temporary switch statement for it here: */

                var temporaryJsonURL = Artbot.loadMore.vars.loadMoreLink.data("feed");

                switch(temporaryJsonURL) {
                    case "/GetEventsByLocation/" :
                        Artbot.loadMore.vars.nextPageJsonURL = "/ui/js/json/getEventsByLocation-page2.json";
                        break;
                    case "/LoadFavorites/" :
                        Artbot.loadMore.vars.nextPageJsonURL = "/ui/js/json/loadFavorites-page2.json";
                        break;
                    default:
                        Artbot.loadMore.vars.nextPageJsonURL = "/ui/js/json/loadFavorites-page2.json";
                }

                // Check to see if there are more results to show, and set up the Load More link if so
                Artbot.dataService.getJsonFeed(Artbot.loadMore.vars.nextPageJsonURL, function(data) {
                        var isMoreResults = Artbot.util.isThereMore(data);
                        if (isMoreResults) {
                            // More results; we need to show the "Load More" link again
                            Artbot.loadMore.setupLoadMoreLink();
                        }
                    }
                );
            }
        }
    }
};

/* Setting up My Settings Ajax functionality
   ========================================================================== */
Artbot.settings = {
    init: function() {
        if ($("#settings-form").length > 0) {

            if ($.cookie('token') !== undefined) {
                console.log("Initializing app settings");

                // Preload the field values from the back-end API
                Artbot.settings.fetchFieldValues();

                // Set up validation and Ajax submit
                $("#settings-form").validate({
                    rules: {
                        "password_confirmation": {
                            equalTo: "#password"
                        },
                        "email": "email",
                        "zipcode": "zipcode"
                    },
                    submitHandler: Artbot.settings.ajaxSubmit
                });
            } 
        }
    },
    fetchFieldValues: function() {
        $.ajax({
            type: "GET",
            url: Artbot.var.jsonDomain + "/preferences/",
            beforeSend: function (request) {
                request.setRequestHeader("authentication_token", $.cookie('token'));
            },
            success: function ( data, textStatus, jqXHR ) {
                console.log("User preferences retrieved successfully.");
                Artbot.settings.populateFieldValues(data);
            },
            error: function (jqXHR, error, errorThrown) {
                console.log("Error retrieving user preferences");
                Artbot.errors.logAjaxError(jqXHR, error, errorThrown);
            }
        });
    },
    populateFieldValues: function(data) {
        var userInfo = data.user;
        var $allInputs = $("#settings-form").find("input");

        $allInputs.each(function() {
            var key = $(this).attr("id");
            if (userInfo[key] !== undefined ) {
                console.log(key + ": " + userInfo[key]);

                if ($(this).attr("type") == "checkbox") {
                    if (userInfo[key] === true) {
                        $(this).attr("checked", "checked").flipswitch("refresh");
                    }
                } else {
                    $(this).val(userInfo[key]);
                }
            }
        });

        // Set up change event handling for the flip-switches
        var $ajaxInputs = $("#settings-form").find("input[type=checkbox]");
        $ajaxInputs.change(function() {
            Artbot.settings.toggleThisOption(this);
        });
    },
    toggleThisOption: function(checkboxObj) {
        console.log("Toggling checkbox value");

        $thisCheckbox = $(checkboxObj);
        var isCheckboxChecked = $thisCheckbox.prop("checked");
        var checkboxID = $(checkboxObj).prop("id");
        console.log("Value of property 'checked': " + isCheckboxChecked);

        var ajaxDataToSend = {};
        ajaxDataToSend[checkboxID] = isCheckboxChecked;

        $.mobile.loading('show');
        $.ajax({
            type: "PUT",
            url: Artbot.var.jsonDomain + "/preferences/",
            data: ajaxDataToSend,
            beforeSend: function (request) {
                request.setRequestHeader("authentication_token", $.cookie('token'));
            },
            success: function(data, textStatus, jqXHR) {
                console.log("Toggle change successfully saved");
            },
            error: function (jqXHR, error, errorThrown) {
                console.log("Error sending toggle Ajax call");
                Artbot.errors.logAjaxError(jqXHR, error, errorThrown);
            },
            complete: function() {
                $.mobile.loading('hide');
            }
        });
    },
    ajaxSubmit: function() {
        console.log("Submitting the changes to the Settings form");

        var $this = $("#settings-form"),
            viewArr = $this.serializeArray(),
            formData = {};

        for (var i in viewArr) {
            formData[viewArr[i].name] = viewArr[i].value;
        }

        $.mobile.loading('show');
        $.ajax({
            type: "PATCH",
            url: Artbot.var.jsonDomain + "/preferences/",
            data: formData,
            beforeSend: function (request) {
                request.setRequestHeader("authentication_token", $.cookie('token'));
            },
            success: function(data, textStatus, jqXHR) {
                console.log("All user preferences successfully saved");
            },
            error: function (jqXHR, error, errorThrown) {
                console.log("Error saving all user preferences");
                Artbot.errors.logAjaxError(jqXHR, error, errorThrown);
            },
            complete: function() {
                $.mobile.loading('hide');
            }
        });
    }
};


/* Setting up History list functionality
   ========================================================================== */
Artbot.historyList = {
    init: function() {
        if ($("#target-historylist").length > 0) {
            if ($.cookie('token') !== undefined) {
                console.log("Initializing History list");
                Artbot.historyList.fetchData();
            }
        }
    },
    fetchData: function() {
        $.mobile.loading('show');
        $.ajax({
            type: "GET",
            dataType: "json",
            url: Artbot.var.jsonDomain + "/favorites/history/",
            data: {
                page: 1,
                per_page:10000
            },
            beforeSend: function (request) {
                request.setRequestHeader("authentication_token", $.cookie('token'));
            },
            success: function( data ) {
                console.log("Successfully fetched History data");
                
                jsonDataString = JSON.stringify(data.favorites);

                //console.log(jsonDataString);

                if (jsonDataString.length > 2) {
                    // There are favorites, build the list
                    
                    Artbot.historyList.hideErrorMsg();

                    $("#target-historylist").fadeOut(400, function() {
                        Artbot.historyList.buildList(data);
                    });

                } else {
                    // Empty set, no favorites yet
                    Artbot.historyList.showErrorMsg();
                }
            },
            error: function (jqXHR, error, errorThrown) {
                console.log("Error fetching History data");
                Artbot.errors.logAjaxError(jqXHR, error, errorThrown);
            },
            complete: function() {
                $.mobile.loading('hide');
            }
        });
    },
    buildList: function(data) {
        console.log("Building history list");
        var jsonArray = data.favorites;

        //console.log(JSON.stringify(jsonArray));

        var itemTemplate = $("#template-historylist").html();
        var historyHtml;

        historyHtml = _.template(itemTemplate, {jsonArray:jsonArray});

        $(historyHtml).appendTo($("#target-historylist"));

        Artbot.historyList.addEventHandlers();
    },
    addEventHandlers: function() {
        // Initialize favorite stars and history checkbox selected states
        Artbot.favoriteStars.init();
        Artbot.historyList.syncAttended();
    },
    showList: function() {
        $("#target-historylist").fadeIn(400, function() {
            // Re-do truncation once fade is complete
            Artbot.setupTextTruncation();
        });
    },
    showErrorMsg: function() {
        $("#error-historylist").find("p").fadeIn(400);
    },
    hideErrorMsg: function() {
        $("#error-historylist").find("p").fadeOut(400);
    },
    removeFavorite: function(selectedEventID) {
        // Remove a favorite from the Favorites list, if the user unhighlights it there
        // The event ID to delete is passed into the function

        // No longer used, but left in case it's useful

        $("#target-historylist").fadeOut(400, function() {

            //Find the link with the matching event ID, grab the parent .item-block and .remove() it
            $("#target-historylist").find("a[data-event-id=" + selectedEventID + "]").parents(".item-block").remove();

            // Count how many items the now has
            var numberOfFavorites = $("#target-historylist").children(".item-block").length;
            console.log("Number of history items left: " + numberOfFavorites);

            if (numberOfFavorites === 0) {
                // We removed all the favorites; show the "no favorites yet" message
                Artbot.historyList.showErrorMsg();
            }

            Artbot.historyList.showList();

        });
    },
    bindAttendanceCheckboxes: function() {
        Artbot.historyList.unbindAttendanceCheckboxes();

        Artbot.customCheckboxes.init("#history-form");

        // Set up click event for History Attendance checkboxes
        $("#history-form").find("input[type=checkbox]").click(function() {
            Artbot.historyList.toggleAttended($(this));
        });
    },
    unbindAttendanceCheckboxes: function() {
        
        Artbot.customCheckboxes.destroy("#history-form");

        // Remove click event for History Attendance checkboxes
        $("#history-form").find("input[type=checkbox]").unbind("click");
    },
    toggleAttended: function(checkboxObj) {
        console.log("Toggling 'Attended?' checkbox value");

        $thisCheckbox = $(checkboxObj);
        var isCheckboxChecked = $thisCheckbox.prop("checked");
        console.log("Value of property 'checked': " + isCheckboxChecked);
        var eventID = $(checkboxObj).attr("data-event-id");
        var userFavoriteID = $(checkboxObj).attr("data-user-favorite-id");

        var ajaxDataToSend = {
            attended: isCheckboxChecked
        };

        $.mobile.loading('show');
        $.ajax({
            type: "PUT",
            url: Artbot.var.jsonDomain + "/favorites/" + userFavoriteID,
            data: ajaxDataToSend,
            beforeSend: function (request) {
                request.setRequestHeader("authentication_token", $.cookie('token'));
            },
            success: function(data, textStatus, jqXHR) {
                console.log("Attendance data successfully saved");
            },
            error: function (jqXHR, error, errorThrown) {
                console.log("Error sending Attendance Ajax call");
                Artbot.errors.logAjaxError(jqXHR, error, errorThrown);
            },
            complete: function() {
                $.mobile.loading('hide');
            }
        });
    },
    syncAttended : function() {
        /* This function checks all attended checkboxes currently present in the page, and compares them against the current user's saved favorites (if logged in).  If there's a match, that box will be checked. */

        if (($("#history-form").find("input[type=checkbox]").length > 0) && ($.cookie('token') !== undefined)) {
            console.log("Syncing attendance checkboxes with user's attended records");

            // Fetch the list of user's history to check against.
            $.ajax({
                type: "GET",
                dataType: "json",
                url: Artbot.var.jsonDomain + "/favorites/history/",
                beforeSend: function (request) {
                    request.setRequestHeader("authentication_token", $.cookie('token'));
                },
                success: function( data ) {
                    console.log("Successfully fetched History data for syncing");
                    
                    jsonDataString = JSON.stringify(data.favorites);

                    //console.log(jsonDataString);

                    if (jsonDataString.length > 2) {
                        // There are history items, so we may need to sync them up

                        var userHistoryItems = data.favorites;

                        // Iterate through each history item
                        $.each(userHistoryItems, function(i, value) {
                            var thisItem = userHistoryItems[i];
                            var thisEventAttended;
                            
                            if (thisItem.attended === true) {
                                thisEventAttended = true;
                            } else {
                                thisEventAttended = false;
                            }
                            //console.log("This event attended? " + thisEventAttended);

                            if (thisEventAttended) {
                                var userFavoriteID = thisItem.id;
                                //console.log("User favorite ID: " + userFavoriteID);

                                // Toggle the checkbox with the appropriate data attribute
                                var $thisCheckbox = $("#history-form").find("input[data-user-favorite-id=" + userFavoriteID + "]");

                                if (!$thisCheckbox.attr("checked")) {
                                    $thisCheckbox.trigger("click");
                                }
                            }

                        });

                        Artbot.historyList.bindAttendanceCheckboxes();

                    } 
                },
                error: function (jqXHR, error, errorThrown) {
                    console.log("Error fetching History data");
                    Artbot.errors.logAjaxError(jqXHR, error, errorThrown);
                },
                complete: function() {
                    Artbot.historyList.showList();
                    $.mobile.loading('hide');
                }
            });

            
        }
    },
};


/* Setting up Favorites list functionality
   ========================================================================== */
Artbot.favoriteList = {
    init: function() {
        if ($("#target-favoritelist").length > 0) {
            if ($.cookie('token') !== undefined) {
                console.log("Initializing Favorites list");
                Artbot.favoriteList.fetchData();
            }
        }
    },
    fetchData: function() {
        $.mobile.loading('show');
        $.ajax({
            type: "GET",
            dataType: "json",
            url: Artbot.var.jsonDomain + "/favorites/",
            data: {
                page: 1,
                per_page:10000
            },
            beforeSend: function (request) {
                request.setRequestHeader("authentication_token", $.cookie('token'));
            },
            success: function( data ) {
                console.log("Successfully fetched Favorites data");
                
                jsonDataString = JSON.stringify(data.favorites);

                //console.log(jsonDataString);

                if (jsonDataString.length > 2) {
                    // There are favorites, build the list
                    
                    Artbot.favoriteList.hideErrorMsg();

                    $("#target-favoritelist").fadeOut(400, function() {
                        Artbot.favoriteList.buildList(data);
                        Artbot.favoriteList.showList();
                    });

                } else {
                    // Empty set, no favorites yet
                    Artbot.favoriteList.showErrorMsg();
                }
            },
            error: function (jqXHR, error, errorThrown) {
                console.log("Error fetching Favorites data");
                Artbot.errors.logAjaxError(jqXHR, error, errorThrown);
            },
            complete: function() {
                $.mobile.loading('hide');
            }
        });
    },
    buildList: function(data) {
        console.log("Building favorites list");
        var jsonArray = data.favorites;

        //console.log(JSON.stringify(jsonArray));

        var itemTemplate = $("#template-favoritelist").html();
        var favoritesHtml;

        favoritesHtml = _.template(itemTemplate, {jsonArray:jsonArray});

        $(favoritesHtml).appendTo($("#target-favoritelist"));

        Artbot.favoriteList.addEventHandlers();
    },
    addEventHandlers: function() {
        // Initialize favorite stars
        Artbot.favoriteStars.init();
    },
    showList: function() {
        $("#target-favoritelist").fadeIn(400);
    },
    showErrorMsg: function() {
        $("#error-favoritelist").find("p").fadeIn(400);
    },
    hideErrorMsg: function() {
        $("#error-favoritelist").find("p").fadeOut(400);
    },
    removeFavorite: function(selectedEventID) {
        // Remove a favorite from the Favorites list, if the user unhighlights it there
        // The event ID to delete is passed into the function

        // No longer used, but leaving it here in case it's useful in future

        $("#target-favoritelist").fadeOut(400, function() {

            //Find the link with the matching event ID, grab the parent .item-block and .remove() it
            $("#target-favoritelist").find("a[data-event-id=" + selectedEventID + "]").parents(".item-block").remove();

            // Count how many items the now has
            var numberOfFavorites = $("#target-favoritelist").children(".item-block").length;
            console.log("Number of favorites left: " + numberOfFavorites);

            if (numberOfFavorites === 0) {
                // We removed all the favorites; show the "no favorites yet" message
                Artbot.favoriteList.showErrorMsg();
            }

            Artbot.favoriteList.showList();

        });
    }
};


/* Setting up Interests functionality
   ========================================================================== */
Artbot.interests = {
    vars: { // Defaults are set to get the full list of interests
        ajaxType : "GET",
        ajaxURL : Artbot.var.jsonDomain + "/possible_interests/",
        ajaxData : "",
        ajaxSuccessMsg : "Successfully retrieved full list of possible interests",
        ajaxErrorMsg : "Retrieval of full possible interest list failed",
        ajaxCallback : function() {
            // empty function for now, will define later in the script
        },
        interestIntro : "#interest-onboarding-intro"
    },
    init: function() {
        if ($("#interest-form").length > 0) {
            
            if ($.cookie('token') !== undefined) {

                console.log("Initializing functionality for My Interests");

                Artbot.interests.checkForInterests();

                var isCheckboxChecked = false;
                var checkboxID;
                var $thisCheckbox;

                // Set up click event for interest form checkboxes
                $("#interest-form-list").on("click", "input[type=checkbox]", function() {
                    isCheckboxChecked = $(this).prop("checked");
                    checkboxID = $(this).data("interest-id");
                    console.log("checkboxID: " + checkboxID);
                    checkboxValue = $(this).val();

                    $thisCheckbox = $(this);

                    if (isCheckboxChecked) {
                        // We're interested in this, send a POST request
                        Artbot.interests.vars.ajaxType = "POST";
                        Artbot.interests.vars.ajaxURL = Artbot.var.jsonDomain + "/interests/";
                        Artbot.interests.vars.ajaxData = {
                            "tag_id": checkboxID
                        };
                        Artbot.interests.vars.ajaxSuccessMsg = "Interest '" + checkboxValue + "' saved.";
                        Artbot.interests.vars.ajaxErrorMsg = "Saving interest '" + checkboxValue + "' failed!";

                        Artbot.interests.vars.ajaxCallback = function(checkboxObj, ajaxData) {
                            console.log("Callback for adding an interest");
                            var $myCheckbox = checkboxObj;
                            var userInterestID;
                            $.each(ajaxData, function(index, interest) {
                                userInterestID = interest.id;
                                console.log("Selected interest ID for this user: " + userInterestID);
                            });
                            $myCheckbox.attr("data-user-interest-id", userInterestID);
                        };
                    } else {
                        // We're not interested in this anymore, send a DELETE request
                        var userInterestID = $(this).data("user-interest-id");
                        console.log("userInterestID: " + userInterestID);

                        Artbot.interests.vars.ajaxType = "POST";
                        Artbot.interests.vars.ajaxURL = Artbot.var.jsonDomain + "/interests/" + userInterestID;
                        Artbot.interests.vars.ajaxData = {
                            "_method":"delete"
                        };
                        Artbot.interests.vars.ajaxSuccessMsg = "Interest '" + checkboxValue + "' deleted.";
                        Artbot.interests.vars.ajaxErrorMsg = "Deleting interest '" + checkboxValue + "' failed!";

                        Artbot.interests.vars.ajaxCallback = function(checkboxObj) {
                            console.log("Callback for deleting an interest");
                            var $myCheckbox = checkboxObj;
                            $myCheckbox.removeAttr("data-user-interest-id");
                        };
                    }

                    /* Make the actual Ajax request to handle the interest
                    TODO: add success/fail/error handling, etc.
                    No Load More functionality, possibly a future enhancement. */
                    $.mobile.loading('show');

                    $.ajax({
                        type: Artbot.interests.vars.ajaxType,
                        url: Artbot.interests.vars.ajaxURL,
                        data: Artbot.interests.vars.ajaxData,
                        beforeSend: function (request) {
                            request.setRequestHeader("authentication_token", $.cookie('token'));
                        },
                        success: function ( data, textStatus, jqXHR ) {
                            console.log(Artbot.interests.vars.ajaxSuccessMsg);
                            Artbot.interests.vars.ajaxCallback($thisCheckbox, data);
                        },
                        error: function (jqXHR, error, errorThrown) {
                            console.log(Artbot.interests.vars.ajaxErrorMsg);
                            Artbot.errors.logAjaxError(jqXHR, error, errorThrown);
                        },
                        complete: function() {
                            $.mobile.loading('hide');
                        }
                    });
                });
            }

        }
    },
    destroy: function() {
        if ($("#interest-form").length > 0) {
            console.log("Destroying interest checkbox click events");
            $("#interest-form-list").off("click");
        }
    },
    checkForInterests: function() {
        console.log("Checking for user interests");

        Artbot.interests.vars.ajaxType = "GET";
        Artbot.interests.vars.ajaxURL = Artbot.var.jsonDomain + "/interests/";
        Artbot.interests.vars.ajaxSuccessMsg = "Successfully checked list of user's interests";
        Artbot.interests.vars.ajaxErrorMsg = "Check of user's interest list failed";

        $.ajax({
            type: Artbot.interests.vars.ajaxType,
            url: Artbot.interests.vars.ajaxURL,
            beforeSend: function (request) {
                request.setRequestHeader("authentication_token", $.cookie('token'));
            },
            success: function ( data, textStatus, jqXHR ) {
                console.log(Artbot.interests.vars.ajaxSuccessMsg);
                //console.log("User interests: " + JSON.stringify(data));

                $.mobile.loading('show');

                if(data.interests && data.interests.length) {
                    console.log("User has interests!");

                    Artbot.interests.vars.interestIntro = "#interest-normal-intro";

                    // Display user's list
                    $("#interest-form-list").fadeOut(400, function() {
                        Artbot.interests.getUserInterests();
                    });

                } else {
                    console.log("User has no interests yet");

                    Artbot.interests.vars.interestIntro = "#interest-onboarding-intro";

                    // Display all interests
                    $("#interest-form-list").fadeOut(400, function() {
                        Artbot.interests.getAllInterests();
                    });
                }
            },
            error: function (jqXHR, error, errorThrown) {
                console.log(Artbot.interests.vars.ajaxErrorMsg);
                Artbot.errors.logAjaxError(jqXHR, error, errorThrown);
            }
        });
    },
    buildInterestList: function(data, isChecked) {
        console.log("Building interest list");

        var jsonArray = data;
        var interestHtml;

        // Format results with underscore.js template
        if (isChecked) {
            interestHtml = _.template($("#interests-user-template").html(), {jsonArray:jsonArray});
        } else {
            interestHtml = _.template($("#interests-template").html(), {jsonArray:jsonArray});
        }

        $(interestHtml).appendTo($("#interest-form-list"));
    },
    showList: function() {
        var $interestIntro = $(Artbot.interests.vars.interestIntro);

        console.log("Showing finished interest list");
        Artbot.customCheckboxes.init("#interest-form-list");

        $.mobile.loading('hide');
        $interestIntro.fadeIn(400);
        $("#interest-form-list").fadeIn(400);
    },
    getAllInterests: function() {

        $.ajax({
            type: "GET",
            url: Artbot.var.jsonDomain + "/possible_interests/",
            success: function( data ){
                console.log("Successfully retrieved full list of possible interests");
                Artbot.interests.buildInterestList(data, false);
                Artbot.interests.showList();
            },
            error: function (jqXHR, error, errorThrown) {
                console.log("Retrieval of full possible interest list failed");
                Artbot.errors.logAjaxError(jqXHR, error, errorThrown);
            }
        });
    },
    getUncheckedInterests: function() {

        var unchecked = {};
        unchecked.tags = [];

        var allTagsUrl = Artbot.var.jsonDomain + "/possible_interests/";

        // All interests Ajax call
        $.ajax({
            type: "GET",
            url: allTagsUrl,
            success: function ( allTagsData, textStatus, jqXHR ) {
                console.log("Successfully retrieved full list of interests for subsetting");
                allTags = allTagsData.tags;
                //console.log("Total number of tags: " + allTags.length);

                // User's interests Ajax call
                $.ajax({
                    type: "GET",
                    url: Artbot.var.jsonDomain + "/interests/",
                    beforeSend: function (request) {
                        request.setRequestHeader("authentication_token", $.cookie('token'));
                    },
                    success: function ( userTagsData, textStatus, jqXHR ) {
                        console.log("Successfully retrieved list of user's interests for subsetting");
                        //console.log("User interests: " + JSON.stringify(userTagsData));
                        selectedInterests = userTagsData.interests;

                        // Circle through all possible tags
                        for(i = 0; i < allTags.length; i++) {
                            tag = allTags[i];
                            unchecked.tags.push(tag);
                            //console.log("Number of unchecked tags after push: " + unchecked.tags.length);
                            //console.log("Comparing: " + tag.id);

                            // Check against selected tags
                            for(j = 0; j < selectedInterests.length; j++){
                                interest = selectedInterests[j];
                                //console.log("to " + interest.tag.id);

                                if (tag.id === interest.tag.id) {
                                    //console.log("Removing " + tag.id + " from list");
                                    unchecked.tags.pop();
                                    selectedInterests.splice(j, 1);
                                    //console.log("Number of unchecked tags after splice: " + unchecked.tags.length);
                                }

                            } //End loop over selected tags

                        } //End loop over all possible tags

                        // For testing: print results
                        // for(i = 0; i < unchecked.tags.length; i++) {
                        //    console.log(unchecked.tags[i].id);
                        //}

                        //console.log("Total number of unchecked tags: " + unchecked.tags.length);

                        Artbot.interests.buildInterestList(unchecked, false);
                        Artbot.interests.showList();

                    },
                    error: function (jqXHR, error, errorThrown) {
                        console.log("Failed retrieving selected interests feed for subsetting");
                        Artbot.errors.logAjaxError(jqXHR, error, errorThrown);
                    }
                }); //End selected tags JSON call
            },
            error: function (jqXHR, error, errorThrown) {
                console.log("Failed retrieving all tags feed for subsetting");
                Artbot.errors.logAjaxError(jqXHR, error, errorThrown);
            }
        }); //End all tags JSON call

        return unchecked;
    },
    getUserInterests: function() {
        $.ajax({
            type: "GET",
            url: Artbot.var.jsonDomain + "/interests/",
            beforeSend: function (request) {
                request.setRequestHeader("authentication_token", $.cookie('token'));
            },
            success: function ( data, textStatus, jqXHR ) {
                console.log("Successfully retrieved list of user's interests");
                Artbot.interests.buildInterestList(data, true);
                Artbot.interests.getUncheckedInterests();
            },
            error: function (jqXHR, error, errorThrown) {
                console.log("Retrieval of user's interest list failed");
                Artbot.errors.logAjaxError(jqXHR, error, errorThrown);
            }
        });

    }
};

/* Login functionality
   ========================================================================== */
Artbot.login = {
    init: function() {
        if ($("#signin-form").length > 0) {
            console.log("Initializing sign-in form");
            console.log("Value of token cookie: " + $.cookie('token'));

            $("#signin-form").validate({
                submitHandler: Artbot.login.ajaxSubmit
            });
        }

        // Record the page you're on when a signin link is clicked
        $(".signin-link").click(function() {
            //console.log("Clicking the sign in link!");
            Artbot.signupModal.vars.returnToPage = $(".ui-page-active").attr("data-url");
            //console.log("Artbot.signupModal.vars.returnToPage: " + Artbot.signupModal.vars.returnToPage);
        });
    },
    ajaxSubmit: function() {
        $.mobile.loading('show');
        $.ajax({
            type: "POST",
            dataType: "json",
            url: Artbot.var.jsonDomain + "/tokens/",
            data: {
                email: $("#signin-email").val(),
                password:  $("#signin-password").val()
            },
            success: function( data ){
                console.log("Login successful! Saving a cookie");
                $.cookie('token', data.authentication_token);
                $.cookie('currentuser', $("#email").val());
                $.cookie('currentuser', $("#signin-email").val());
                $.cookie('signedup', true, { expires: 3650 });
                if (!Artbot.el.html.hasClass("is-logged-in")) {
                    Artbot.el.html.addClass("is-logged-in");
                }
                console.log("Return to page value: " + Artbot.signupModal.vars.returnToPage);
                if ((Artbot.signupModal.vars.returnToPage !== undefined) && (Artbot.signupModal.vars.returnToPage !== "")) {
                    $.mobile.pageContainer.pagecontainer ("change", Artbot.signupModal.vars.returnToPage, {reloadPage: true});
                } else {
                    $.mobile.pageContainer.pagecontainer ("change", "index.html", {reloadPage: true});
                }
                
            },
            error: function (jqXHR, error, errorThrown) {
                console.log("User login submit failed");
                Artbot.errors.logAjaxError(jqXHR, error, errorThrown, true);

                /* If authentication fails with a 403 or 404 error, it will return a generic error payload and we can't run it through the usual showFormError because there's no form field ID provided */

                if ((jqXHR.status == 403) || (jqXHR.status == 404)) { 

                    // Get results from JSON error
                    var result = $.parseJSON(jqXHR.responseText);
                    var errorText;
                    var $errorSource;
                    var errorLabelHTML;
                    var $errorLabel;

                    $.each(result, function(k, v) {
                        errorText = v.capitalize();
                        //console.log("Error text: " + errorText);
                    });

                    if (jqXHR.status == 403) { // Password wrong
                        $errorLabel = $("<label>")
                            .attr("id", "signin-password-error")
                            .addClass("error")
                            .html(errorText)
                            .attr( "for", "signin-password");
                        $("#signin-password").addClass("error");
                        $errorLabel.insertAfter( $("#signin-password") );
                    } else if (jqXHR.status == 404) { // Email doesn't exist
                        $errorLabel = $("<label>")
                            .attr("id", "signin-email-error")
                            .addClass("error")
                            .html(errorText)
                            .attr( "for", "signin-email");
                        $("#signin-email").addClass("error");
                        $errorLabel.insertAfter( $("#signin-email") );
                    }

                } else {
                    Artbot.errors.showFormError(jqXHR.responseText);
                }

            },
            complete: function() {
                $.mobile.loading('hide');
            }
        });
    }
};

/* Logout functionality
   ========================================================================== */
Artbot.logout = {
    init: function() {
        $(".action-logout").click(function() {
            console.log("Log out link clicked!");
            // Remove any existing "remember last page" value for signup
            Artbot.signupModal.vars.returnToPage = "";
            // Remove the authorization token and username cookies
            $.removeCookie('token');
            $.removeCookie('currentuser');
            // Remove the "is-logged-in" class from the HTML element
            Artbot.el.html.removeClass("is-logged-in");
            // Send them back to the main Discover page
            $.mobile.pageContainer.pagecontainer ("change", "index.html", {reloadPage: true});
        });
    }
};

/* Geolocation helpers
   ========================================================================== */
Artbot.geolocation = {
    vars: {
        currentLatitude: "",
        currentLongitude: ""
    },
    successCallback: function() {
        // Placeholder for passed success function
    },
    failureCallback: function() {
        // Placeholder for passed failure function
    },
    getLocation: function(successCallback, failureCallback) {
        // Store the passed success/fail callbacks for later use
        Artbot.geolocation.successCallback = successCallback;
        Artbot.geolocation.failureCallback = failureCallback;
        if (navigator.geolocation) {
            $.mobile.loading('show');
            navigator.geolocation.getCurrentPosition(Artbot.geolocation.storePosition, Artbot.geolocation.showError);
        } else {
            console.log("Geolocation is not supported by this browser.");
            Artbot.geolocation.failureCallback();
        }
    },
    storePosition: function(position) {
        console.log("Storing latitude: " + position.coords.latitude + ", Longitude: " + position.coords.longitude);

        Artbot.geolocation.vars.currentLatitude = position.coords.latitude;
        Artbot.geolocation.vars.currentLongitude = position.coords.longitude;
        Artbot.geolocation.successCallback();
    },
    showError: function() {
        console.log("Geolocation error:");
        switch(error.code) {
            case error.PERMISSION_DENIED:
                console.log("User denied the request for Geolocation.");
                break;
            case error.POSITION_UNAVAILABLE:
                console.log("Location information is unavailable.");
                break;
            case error.TIMEOUT:
                console.log("The request to get user location timed out.");
                break;
            case error.UNKNOWN_ERROR:
                console.log("An unknown error occurred.");
                break;
        }
        Artbot.geolocation.failureCallback();
    }
};

/* By Location (map) functionality
   ========================================================================== */
Artbot.byLocation = {

    vars : {
        mapContainer : "event-map",
        locationData: {},
        openWithVenueID : "-1",
        accessToken: "pk.eyJ1IjoiYXRvc2NhIiwiYSI6IlFSSDhOU0EifQ.8j2CBSsaQQmn-Ic7Vjx1bw",
        mapInstance: "",
        boundsArray: [],
        markers: []
    },

    init : function() {
        if ($("#event-map").length > 0) {
            console.log( "Initializing map" );

            // Reset the openWithVenueID variable on page load, to start fresh
            Artbot.byLocation.vars.openWithVenueID = "-1";

            // Get the desired venue ID from a querystring
            var qsVenueID = Artbot.util.findQuerystring("venueid");
            //console.log("Venue ID passed in via querystring: " + qsVenueID);
            if (typeof qsVenueID != 'undefined') {
                Artbot.byLocation.vars.openWithVenueID = qsVenueID;
            }

            // Set up map
            L.mapbox.accessToken = Artbot.byLocation.vars.accessToken;
            Artbot.byLocation.vars.mapInstance = L.mapbox.map( Artbot.byLocation.vars.mapContainer, 'sherrialexander.jepo6la8' );

            Artbot.byLocation.fetchLocations();
        }
    },
    fetchLocations: function() {
        $.mobile.loading('show');
        $.ajax({
            type: "GET",
            dataType: "json",
            data: {
                "per_page": 1000
            },
            url: Artbot.var.jsonDomain + "/locations/",
            success: function( data ){
                console.log("Map data successfully fetched");
                //console.log(JSON.stringify(data));

                Artbot.byLocation.vars.locationData = data.locations;
                Artbot.byLocation.buildMap();
                Artbot.byLocation.showMap();
            },
            error: function (jqXHR, error, errorThrown) {
                console.log("User login submit failed");
                Artbot.errors.logAjaxError(jqXHR, error, errorThrown, true);
            },
            complete: function() {
                $.mobile.loading('hide');
            }
        });
    },
    fetchSingleLocation: function(locationID) {
        // Fetch the event data for this location
        $.mobile.loading('show');
        $.ajax({
            type: "GET",
            dataType: "json",
            data: {
                "per_page": 10
            },
            url: Artbot.var.jsonDomain + "/locations/" + locationID + "/events",
            success: function( data ){
                console.log("Event data successfully fetched");
                var eventData = JSON.stringify(data.events);
                //console.log(eventData);

                if (eventData.length > 2) {
                    console.log("This venue has events");
                    Artbot.byLocation.showEventList(data.events);
                } else {
                    // No events returned, show the "no events" message
                    console.log("No events at this venue");
                    Artbot.byLocation.showErrorMsg("noevents");
                }
            },
            error: function (jqXHR, error, errorThrown) {
                console.log("Fetch of event data failed");
                Artbot.errors.logAjaxError(jqXHR, error, errorThrown, true);
            },
            complete: function() {
                $.mobile.loading('hide');
            }
        });
    },
    buildMap: function() {

        $.each( Artbot.byLocation.vars.locationData , function(locationIndex){

            //Create a marker for each location

            var name = this.name;
            var locationID = this.id;
            //console.log("This location's name: " + name);
            //console.log("This location's ID: " + locationID);

            Artbot.byLocation.vars.boundsArray.push([ this.latitude, this.longitude ]);

            Artbot.byLocation.vars.markers[locationID] = L.marker( [ this.latitude, this.longitude ], {
                icon : L.mapbox.marker.icon({
                    'marker-color': '#20a9b3'
                })
            });

            Artbot.byLocation.vars.markers[locationID].bindPopup( name ).openPopup();

            // Fetch event data when marker is clicked
            Artbot.byLocation.vars.markers[locationID].on( "click", function( e ){

                //console.log("LatLong: " + this.getLatLng());

                Artbot.byLocation.fetchSingleLocation(locationID);

                // Zoom the map on this marker
                // Artbot.byLocation.vars.mapInstance.setView(this.getLatLng(), 16, {animate: true});

            }); //End click handler

            Artbot.byLocation.vars.markers[locationID].addTo( Artbot.byLocation.vars.mapInstance );

        }); //End each location
    },
    showErrorMsg: function(errorID) {
        // Hide event list
        $("#event-list").fadeOut( 400, function() {
            $("#event-list").empty().show();
        });
        $("#event-list-msg-"+errorID).fadeIn(400);
    },
    showEventList: function(eventArray) {
        // Hide any current error messages
        $("#event-list-messages").find("p").fadeOut(400);

        //Refresh event list
        $("#event-list").fadeOut( 400, function() {
            $("#event-list").empty().html(_.template($('#template-eventlist').html(), {eventArray:eventArray}));
            
            Artbot.byLocation.addEventHandlers();

            $("#event-list").fadeIn(400, function() {
                Artbot.setupTextTruncation();
            });
        }); //End fade out
    },
    addEventHandlers: function() {
        Artbot.favoriteStars.init();
        //Artbot.loadMore.init();
    },
    showMap: function() {
        // After locations are all loaded, we either need to display a specifically-requested venue + its list of events, or all venues.
        
        if (Artbot.byLocation.vars.openWithVenueID != -1) {
            // Specific location map
            console.log("Show a map for venue ID " + Artbot.byLocation.vars.openWithVenueID);

            // Set some fallback lat/long coordinates in case anything goes wrong getting the real ones
            var myVenueLatitude = 42.3581;
            var myVenueLongitude = -71.0636;

            // Get the corresponding lat/long data by matching up the ID
            $.each( Artbot.byLocation.vars.locationData , function(index, location){
                if (location.id == Artbot.byLocation.vars.openWithVenueID) {
                    myVenueLatitude = location.latitude;
                    myVenueLongitude = location.longitude;
                }
            });

            // Set the map view to this location, zoomed in
            Artbot.byLocation.vars.mapInstance.setView([myVenueLatitude, myVenueLongitude], 16, {animate: true});

            // Trigger the popup
            Artbot.byLocation.vars.markers[Artbot.byLocation.vars.openWithVenueID].openPopup();
            
            // Build and show the event list
            Artbot.byLocation.fetchSingleLocation(Artbot.byLocation.vars.openWithVenueID);

        } else {
            // Multi-location map
            console.log("Show map zoomed to show all locations");
            Artbot.byLocation.vars.mapInstance.setView([42.3581, -71.0636], 12);
            
            var bounds = L.latLngBounds(Artbot.byLocation.vars.boundsArray);
            //console.log(bounds);
            Artbot.byLocation.vars.mapInstance.fitBounds(bounds, { padding: [10, 10]});
        }

        Artbot.footerSlider.init();
    }
};

/* Initialize/Fire
   ========================================================================== */
Artbot.startup = {
    init : function () {
        console.log("**Beginning of scripts initializing");

        $('a[href="#"]').click(function(e){e.preventDefault();});

        Artbot.discoverSlider.init();
        Artbot.login.init();
        Artbot.logout.init();
        Artbot.interests.init();
        Artbot.calendar.init();
        Artbot.settings.init();
        Artbot.byLocation.init();
        Artbot.eventdetail.init();
        Artbot.venuedetail.init();
        Artbot.favoriteList.init();
        Artbot.historyList.init();

        Artbot.loadMore.init();
        Artbot.customCheckboxes.init();
        Artbot.setupTextTruncation();
        Artbot.favoriteStars.init();

        console.log("**End of scripts initializing");
    },
    finalize : function() {
        console.log("**Beginning of scripts finalizing");

        // Initialize FastClick on certain items, to remove the 300ms delay on touch events
        FastClick.attach(document.body);

        // If it's the Discover page, we need to pop the signup modal every visit but only if not logged in and haven't signed up yet
        if ($("#discover-slider").length > 0) {
            if (($.cookie('token') === undefined) && ($.cookie('signedup') === undefined)) {
                console.log("Popping the new visitor sign up window");
                setTimeout(function(){
                    Artbot.signupModal.open();
                },1000);
            }
        } else {
            // If they're a new visitor, pop the Sign Up window
            if (($.cookie('token') === undefined) && (Artbot.var.hasVisitedBefore !== true) && ($(".ui-page-active").attr("data-url") != "/sign-in.html")) {

                console.log("Popping the new visitor sign up window");
                setTimeout(function(){
                    Artbot.signupModal.open();
                },1000);

                // Plant the cookie for next time
                $.cookie('priorvisit', 'yes', { expires: 365 * 10, path: '/' });
                // Set the variable to true as well
                Artbot.var.hasVisitedBefore = true;
            }
        }

        // If they're already logged in, let's add the CSS class for that
        if ($.cookie('token') !== undefined) {
            if (!Artbot.el.html.hasClass("is-logged-in")) {
                Artbot.el.html.addClass("is-logged-in");
            }
        }

        console.log("**End of scripts finalizing");
    }
};

$(document).ready(function() {
    console.log("****jQuery DOM Ready event firing");
    handleAppCache();

    // Since the modal Signup popup is outside jQM's "pages", we need to instantiate it separately and only once
    $("#signup-popup").enhanceWithin().popup({
        history: false,
        positionTo: "window",
        afterclose: Artbot.signupModal.close
    });

    Artbot.signupModal.init();
});

/*
 * ------------------------------------------------------
 * jQuery Mobile events (in the order in which they fire)
 * (reference: http://jqmtricks.wordpress.com/2014/03/26/jquery-mobile-page-events/)
 * ------------------------------------------------------
 */

$(document).on( "mobileinit", function( event ) {
    console.log("****JQM mobileinit event firing");
    $.mobile.popup.prototype.options.history = false;
});

$(document).on( "pagecontainerbeforechange", function( event, ui ) {
    console.log("****JQM pagecontainerbeforechange event firing");
});


$(document).on( "pagecontainerbeforeload", function( event ) {
    console.log("****JQM pagecontainerbeforeload event firing");
});


$(document).on( "pagecontainerload", function( event ) {
    console.log("****JQM pagecontainerload event firing");
});


$(document).on( "pagebeforecreate", function( event ) {
    console.log("****JQM pagebeforecreate event firing");
});


$(document).on( "pagecreate", function( event ) {
    console.log("****JQM pagecreate event firing");
});


$(document).on( "pagebeforehide", function( event ) {
    console.log("****JQM pagebeforehide event firing");

    /* Destroying sliders before hiding a page */
    Artbot.footerSlider.destroy();

    /* Destroying interest checkbox bindings before hiding a page */
    Artbot.interests.destroy();

    // Setting the initial load variable to false, as we're moving to another page
    Artbot.var.isInitialLoad = false;
});


$(document).on("pagehide", "div[data-role=page]", function(event){
    console.log("****JQM pagehide event firing");

    /* Removing the prior page on page hide, so that we don't have multiple versions of pages cluttering the DOM */
    console.log("Hiding the previous page");
    $(event.target).remove();
});


$(document).on( "pagecontainerbeforeshow", function( event ) {
    console.log("****JQM pagecontainerbeforeshow event firing");
});


$(document).on( "pagecontainershow", function( event ) {

    console.log("****JQM pagecontainershow event firing");

    console.log("***Beginning of new page load scripts");

    /* Fire based on document context
    ========================================================================== */

    var namespace  = Artbot.startup;
    if (typeof namespace.init === 'function') {
        namespace.init();
    }

    console.log("Cookie value: " + $.cookie('priorvisit'));

    // Check for a cookie that says that they've visited before.
    if ($.cookie('priorvisit') === undefined) {
        console.log("Checking cookie -- new visitor");
    } else {
        console.log("Checking cookie -- they've been here before");
        Artbot.var.hasVisitedBefore = true;
    }

    if (typeof namespace.finalize === 'function') {
        namespace.finalize();
    }

    console.log("***End of new page load scripts");

});


$(document).on( "pagecontainertransition", function( event ) {
    console.log("****JQM pagecontainertransition event firing");
});
