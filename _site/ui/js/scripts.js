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
        beforeSend: function (request) {
            request.setRequestHeader("accept", "application/json");
        },
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
        //hu = window.location.search.substring(1);
        url = $("[data-role=page].ui-page-active").attr("data-url");
        hu = url.substring(url.indexOf('?') + 1);
        //console.log("Querystring URL: " + hu);
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
    },
    getAuthToken: function() {
        // First, try to load up the variable from sessionStorage
        authtoken = sessionStorage.authentication_token;

        // If it doesn't exist in sessionStorage, use localStorage
        if (typeof authtoken == "undefined") {
            authtoken = localStorage.authentication_token;
            if (typeof authtoken != "undefined") {
                console.log("Auth token is in localStorage");
            }
        } else {
            console.log("Auth token is in sessionStorage");
        }
        return authtoken;
    },
    getCurrentUser: function() {
        // First, try to load up the variables from sessionStorage
        currentuser = sessionStorage.current_user;

        // If it doesn't exist in sessionStorage, use localStorage
        if (typeof currentuser == "undefined") {
            currentuser = localStorage.current_user;

            if (typeof currentuser != "undefined") {
                console.log("Current user is in localStorage");
            }
        } else {
            console.log("Current user is in sessionStorage");
        }
        return currentuser;
    }
};

/* Logging Ajax errors */
Artbot.errors = {
    logAjaxError: function (jqXHR, error, errorThrown, isErrorAjaxResponse) {
        console.log("Error: " + errorThrown);
        console.log("jqXHR status: " + jqXHR.status + " " + jqXHR.statusText);
        //alert("jqXHR status: " + jqXHR.status + " " + jqXHR.statusText);
        if (isErrorAjaxResponse) {
            console.log("jqXHR response: " + jqXHR.responseText);
        }
    },
    showFormError: function (jsonError, formID) {
        // Get results from JSON returned
        var result = $.parseJSON(jsonError);
        console.log("Error JSON: " + JSON.stringify(result));
        var errorText;
        var $errorSource;
        var errorLabelHTML;
        var $formWithError = $("#" + formID);
        
        // Remove any existing appended div labels before we start, to avoid stacking
        $formWithError.find("div.error").remove();

        $.each(result, function(k, v) {
            errorText = k.capitalize() + ' ' + v;
            console.log("Error text: " + errorText);

            $errorSource = $("#" + k);

            if ($errorSource.length > 0) {
                // there's a corresponding form field, add an error message to it
                if ($("#"+k+"-error").length > 0) {
                    // An error label already exists, alter it
                    $errorLabel = $("#"+k+"-error");
                    $errorLabel.html(errorText).show();
                } else {
                    // No error label exists, create a new one and insert
                    $errorLabel = $("<label>")
                        .attr("id", k+"-error")
                        .addClass("error")
                        .html(errorText)
                        .attr( "for", k);
                    $errorLabel.insertAfter( $errorSource );
                }

                // Alter the form field to show as invalid as well, mimicking jquery.validation functionality
                $errorSource
                    .removeClass("valid")
                    .addClass("error")
                    .attr( "aria-invalid", true );

            } else {
                // No corresponding form label
                // Append a new error message to the end of the form
                $errorDiv = $("<div>")
                    .attr("id", k+"-error")
                    .addClass("error")
                    .html(errorText)
                    .appendTo($formWithError);
            }
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
    //jsonDomain: "http://artbot-api.herokuapp.com",
    jsonDomain: "http://0.0.0.0:3000",
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
            console.log("Discover slider initializing");
            Artbot.discoverSlider.populateSlider();
        }
    },
    populateSlider: function() {

        var beforeSendFunction = function() {}; // blank function for now
        var authtoken = Artbot.util.getAuthToken();

        if (typeof authtoken !== "undefined") {
            beforeSendFunction = function(request) {
                request.setRequestHeader("authentication_token", authtoken);
                request.setRequestHeader("accept", "application/json");
            };
        } else {
            beforeSendFunction = function (request) {
                request.setRequestHeader("accept", "application/json");
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
                //console.log("Discover slider data successfully fetched");
                //console.log(JSON.stringify(data.events));
                //console.log("Number of discover events fetched: " + data.events.length);
                Artbot.discoverSlider.buildSlider(data);
            },
            error: function (jqXHR, error, errorThrown) {
                console.log("Error fetching Discover slider data");
                console.log("jqXHR status: " + jqXHR.status + " " + jqXHR.statusText);
                console.log("jqXHR response: " + jqXHR.responseText);
                Artbot.discoverSlider.showErrorMsg("ajax");

            },
            complete: function() {
                $.mobile.loading('hide');
            }
        });
    },
    buildSlider: function(data) {
        //console.log("Building discover slider");
        var eventArray = data.events;
        var slideTemplate = $('#template-discoverslider').html();
        //console.log(_.template(slideTemplate, {eventArray:eventArray}));
        
        $("#discover-slider").find("ul").html(_.template(slideTemplate, {eventArray:eventArray}));

        var numberOfSlides = $("#discover-slider").find("ul").children().length;
        console.log("How many pages do we have right now? " + $("div[data-role=page]").length);

        if (numberOfSlides > 1) { // there's more than one slide to show
            Artbot.discoverSlider.initSlider();
        }

        // Initialize favorite stars
        Artbot.favoriteStars.init();

        Artbot.footerSlider.init();
    },
    initSlider: function() {
        //console.log("More than one slide -- initializing Discover slider functionality");
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
    },
    showErrorMsg: function(errorID) {
        $("#discover-slider").fadeOut( 400, function() {
            $("#discover-slider-msg-"+errorID).fadeIn(400);
            $("#discover-slider").show();
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
            maxSlides:30,
            //slideWidth:86,
            slideWidth:140,
            slideMargin:10,
            oneToOneTouch:false,
            pager:false,
            infiniteLoop: false,
            nextSelector: '#footer-slider-next',
            nextText: '<i class="icon icon-fast-forward"></i><span class="visuallyhidden">Next</span>',
            prevSelector: '#footer-slider-previous',
            prevText: '<i class="icon icon-rewind"></i><span class="visuallyhidden">Previous</span>',
            hideControlOnEnd: true,
            onSliderLoad: function() {
                $("#footer-slider-previous").find("a").addClass("btn").addClass("btn-round").attr("title", "Previous");
                $("#footer-slider-next").find("a").addClass("btn").addClass("btn-round").attr("title", "Next");
            }
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

            //console.log("Initializing Favorites slider");
            
            // Check if the user is logged in
            var authtoken = Artbot.util.getAuthToken();

            if (typeof authtoken !== "undefined") {
                // User is logged in, so we can fetch the favorites

                $.ajax({
                    type: "GET",
                    dataType: "json",
                    data: {
                        "per_page": Artbot.footerSlider.vars.pageSize
                    },
                    url: Artbot.var.jsonDomain + "/favorites/",
                    beforeSend: function(request) {
                        request.setRequestHeader("authentication_token", authtoken);
                        request.setRequestHeader("accept", "application/json");
                    },
                    success: function( data ) {
                        //console.log("Footer slider data successfully fetched");
                        
                        var jsonString = JSON.stringify(data.favorites);

                        //console.log(jsonString);

                        // Hide any existing messages
                        $(".footer-slider-msg").hide();

                        if (jsonString.length > 2) {
                            // Favorites were returned, make the slider
                            // console.log(jsonString);
                            Artbot.footerSlider.buildSlider(data);
                            Artbot.footerSlider.initSlider();
                        } else {
                            // No favorites returned, show the "no favorites yet" message
                            Artbot.footerSlider.showErrorMsg("nofavorites");
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
                Artbot.footerSlider.showErrorMsg("favoritesignup");

            }
        } else if ($("#venue-events-slider").length > 0) {
            /* Related Events slider for Venue pages */

            //console.log("Initializing Related Events slider");

            // Get the Venue ID from the .venue-detail div
            //var venueID = $(".venue-detail").attr("data-venue-id");
            var venueID = Artbot.var.venueDetailID;
            //console.log("Venue ID: " + venueID);

            $.ajax({
                type: "GET",
                dataType: "json",
                data: {
                    "per_page": Artbot.footerSlider.vars.pageSize
                },
                url: Artbot.var.jsonDomain + "/locations/" + venueID + "/events",
                beforeSend: function (request) {
                    request.setRequestHeader("accept", "application/json");
                },
                success: function( data ) {
                    //console.log("Footer slider data successfully fetched");
                    
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
                        Artbot.footerSlider.showErrorMsg("noevents");
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

            //console.log("Initializing Related Interest slider");

            var jsonString = JSON.stringify(Artbot.var.relatedInterests);

            //console.log(jsonString);

            if (jsonString.length > 2) {
                // There are related interests

                var numberOfTags = 0;

                $.each(Artbot.var.relatedInterests, function (key, value) {
                    numberOfTags++;
                });

                Artbot.footerSlider.vars.totalRelatedInterests = numberOfTags - 1; // zero-based index

                if (numberOfTags > 1) {
                    // Create click event to trigger cycleRelatedInterests
                    $("#cycle-relatedinterest").click(function(){
                        Artbot.footerSlider.cycleRelatedInterests(Artbot.var.relatedInterests);
                        return false;
                    }).addClass("is-visible");
                } else {
                    $("#cycle-relatedinterest").removeClass("is-visible");
                }
                
                // Trigger cycleRelatedInterests
                Artbot.footerSlider.cycleRelatedInterests(Artbot.var.relatedInterests);

            } else {
                Artbot.footerSlider.showErrorMsg("noevents");
            }

        } else if ($("#near-you-slider").length > 0) {
            /* Near You slider for map page */

            //console.log("Initializing Near You slider");

            // First, we have to try to get the user's current position.
            Artbot.geolocation.getLocation(Artbot.footerSlider.processNearbyEvents, Artbot.footerSlider.showGeolocationError);

        }
    },
    processNearbyEvents: function() {
        // Check if we were successful
        //console.log("Location call made, checking if values are correct");

        if ((Artbot.geolocation.vars.currentLatitude !== "") && (Artbot.geolocation.vars.currentLongitude !== "")) {
            
            //console.log("My latitude: " + Artbot.geolocation.vars.currentLatitude);

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
                beforeSend: function (request) {
                    request.setRequestHeader("accept", "application/json");
                },
                success: function( data ) {
                    //console.log("Footer slider data successfully fetched");
                    
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
                        Artbot.footerSlider.showErrorMsg("noeventsnearby");
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
            // Couldn't get a position; show error message
            Artbot.footerSlider.showErrorMsg("nogeolocation");
            $.mobile.loading('hide');
        }
    },
    hideFooter: function() {
        //console.log("Hiding the footer");
        $(".content.layout-footer").removeClass("layout-footer");
        $(".footer").hide();
    },
    cycleRelatedInterests: function(data) {
        var currentInterest = data[Artbot.footerSlider.vars.relatedInterestCounter];

        //console.log("Interest counter going into the function: " + Artbot.footerSlider.vars.relatedInterestCounter);
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

        //console.log("Building footer slider");
        var itemArray;
        var slideTemplate;

        if ($("#favorites-slider").length > 0) {
            /* Favorites slider */
            
            //console.log("Initializing Favorites slider");
            itemArray = data.favorites;  

        } else if ($("#related-interest-slider").length > 0) {
            /* Related Interest slider for Event Detail pages */

            //console.log("Initializing Related Interest slider");
            itemArray = data; // TODO: Get the correct data structure
        } else {
            /* Events slider for Venue and By Location pages */

            //console.log("Initializing Events slider");
            itemArray = data.events;

        }

        $("#footer-slider").html(_.template(Artbot.footerSlider.vars.slideTemplate, {itemArray:itemArray}));
        
    },
    initSlider: function() {
        Artbot.footerSlider.vars.footSlideInstance = $("#footer-slider").bxSlider(Artbot.footerSlider.vars.footSlideOptions);
        //Artbot.footerSlider.initSliderNav();
    },
    initSliderNav: function() {
        $(".footer-slider").removeClass("not-enough-slides");

        var numberOfSlides = $("#footer-slider").children("li:not(.bx-clone)").length;
        //console.log("Number of footer slides: " + numberOfSlides);

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
        //console.log("Adding a new favorite to the footer slider");   

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
        //console.log("Number of non-cloned children: " + numberOfSlides);

        if (numberOfSlides > 0) {
            // Reload the slider
            Artbot.footerSlider.reload();

        } else {
            // We removed all the favorites; show the "no favorites yet" message
            Artbot.footerSlider.showErrorMsg("nofavorites");
        }
    },
    reload: function() {
        if (($("#footer-slider").length > 0) && (Artbot.footerSlider.vars.footSlideInstance !== "")) {
            
            //console.log("Reloading footer slider");
  
            Artbot.footerSlider.vars.footSlideInstance.reloadSlider(Artbot.footerSlider.vars.footSlideOptions);
            Artbot.footerSlider.initSliderNav();

        }
    },
    showErrorMsg: function(errorID) {
        $("#footer-slider").fadeOut( 400, function() {
            $("#footer-slider-msg-"+errorID).fadeIn(400);
            $("#footer-slider").show();
        });  
    },
    showGeolocationError: function() {
        Artbot.footerSlider.showErrorMsg("nogeolocation");
    },
    destroy: function() {
        if (($("#footer-slider").length > 0) && (Artbot.footerSlider.vars.footSlideInstance !== "")) {
            //console.log("Destroying footer slider");
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
            //console.log("Initializing favorite stars");

            // First, destroy any current star bindings so that we can call this
            // wherever we want, without duplicating events
            Artbot.favoriteStars.destroy();

            Artbot.favoriteStars.sync();

            $(".favorite-star").click(function() {

                var authtoken = Artbot.util.getAuthToken();

                if (typeof authtoken !== "undefined") {
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
                                request.setRequestHeader("authentication_token", authtoken);
                                request.setRequestHeader("accept", "application/json");
                            },
                            success: function(data, textStatus, jqXHR) {
                                //console.log("New favorite successfully saved");

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
                                $thisStarLink.blur();
                            }
                        });

                    } else {
                        // The user wishes to remove favorite status
                        $.mobile.loading('show');

                        // Capture the User Favorite ID from the data-attribute on the clicked link
                        var selectedUserEventID = $(this).attr("data-user-favorite-id");

                        //console.log("ID to delete: " + selectedUserEventID);

                        $.ajax({
                            type: "POST",
                            url: Artbot.var.jsonDomain + "/favorites/" + selectedUserEventID,
                            data:  {
                                "_method":"delete"
                            },
                            beforeSend: function (request) {
                                request.setRequestHeader("authentication_token", authtoken);
                                request.setRequestHeader("accept", "application/json");
                            },
                            success: function(data, textStatus, jqXHR) {
                                //console.log("Favorite successfully deleted");
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
                                $thisStarLink.blur();
                            }
                        });
                    }

                } else {
                    // The user is not logged in, we can't save a favorite
                    //console.log("We can't toggle a favorite because the user is not logged in.");
                    Artbot.signupModal.open();
                }

                return false;
            });
        }
    },
    destroy : function() {
        if ($(".favorite-star").length > 0) {
            //console.log("Destroying favorite star click events");
            $(".favorite-star").unbind("click");
        }
    },
    sync : function() {
        /* This function checks all favorite stars currently present in the page, and compares them against the current user's saved favorites (if logged in).  If there's a match, that star will be highlighted. */
        var authtoken = Artbot.util.getAuthToken();
        
        if (($(".favorite-star").length > 0) && (typeof authtoken !== "undefined")) {
            //console.log("Syncing stars with user's favorites");

            // Fetch the list of user's favorites to check against.
            $.ajax({
                type: "GET",
                url: Artbot.var.jsonDomain + "/favorites/",
                data: {
                    page: 1,
                    per_page: 10000
                },
                beforeSend: function (request) {
                    request.setRequestHeader("authentication_token", authtoken);
                    request.setRequestHeader("accept", "application/json");
                },
                success: function(data, textStatus, jqXHR) {
                    //console.log("Successfully fetched Favorites data for syncing stars");
                    //console.log(JSON.stringify(data));

                    var userFavorites = data.favorites;

                    // We'll start by iterating through each favorite
                    $.each(userFavorites, function(i, value) {
                        
                        var userFavorite = userFavorites[i];
                        var userFavoriteID = userFavorite.id;

                        if (userFavoriteID != -1) {

                            var userFavoriteEventID = userFavorite.event.id;

                            // Then let's compare that favorite ID to the corresponding ones on the page
                            $(".favorite-star").each(function() {
                                var pageFavoriteEventID = $(this).attr("data-event-id");

                                // If they match, highlight the star
                                if (pageFavoriteEventID == userFavoriteEventID) {
                                    Artbot.favoriteStars.highlightStar($(this), userFavoriteID);
                                }
                            });
                        }
                    });

                    // Now we have to do the same for History, because Favorites is now only future and present events, and our event might be in the past.
                    // Nested Ajax calls are ugly but necessary because of asynchronous scripting.

                    // Fetch the list of user's history to check against.
                    
                    $.ajax({
                        type: "GET",
                        url: Artbot.var.jsonDomain + "/favorites/history/",
                        data: {
                            page: 1,
                            per_page: 10000
                        },
                        beforeSend: function (request) {
                            request.setRequestHeader("authentication_token", authtoken);
                            request.setRequestHeader("accept", "application/json");
                        },
                        success: function(data, textStatus, jqXHR) {
                            //console.log("Successfully fetched History data for syncing stars");
                            //console.log(JSON.stringify(data));

                            var userHistories = data.favorites;

                            // We'll start by iterating through each history item
                            $.each(userHistories, function(i, value) {
                                var userHistory = userHistories[i];
                                var userHistoryID = userHistory.id;

                                if (userHistoryID != -1) {
                                    var userHistoryEventID = userHistory.event.id;

                                    // Then let's compare that favorite ID to the corresponding ones on the page
                                    $(".favorite-star").each(function() {
                                        var pageHistoryEventID = $(this).attr("data-event-id");

                                        // If they match, highlight the star
                                        if (pageHistoryEventID == userHistoryEventID) {
                                            Artbot.favoriteStars.highlightStar($(this), userHistoryID);
                                        }
                                    });
                                }
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

        //console.log("Highlighting a favorite star!  User favorite ID: " + userFavoriteID);

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
    //console.log("Initializing text truncation");

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
        //console.log("Setting up Signup Modal window");

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
            beforeSend: function (request) {
                request.setRequestHeader("accept", "application/json");
            },
            success: function( data ){
                //console.log(data);

                // On signup, we're always using localStorage because "Remember Me" is assumed to be true.
                localStorage.authentication_token = data.user.authentication_token;
                localStorage.current_user = $("#email").val();
                localStorage.signed_up = true;
                
                $.mobile.pageContainer.pagecontainer ("change", "interests.html", {reloadPage: true});
            },
            error: function (jqXHR, error, errorThrown) {
                console.log("User registration failed");
                Artbot.errors.logAjaxError(jqXHR, error, errorThrown);
                Artbot.errors.showFormError(jqXHR.responseText, "signup-form");
                $.mobile.loading('hide');
            }
        });
    },
    open: function() {
        // Record which page to return to after signup
        if ($(".ui-page-active").attr("data-url") != "/sign-in.html") {
            Artbot.signupModal.vars.returnToPage = $(".ui-page-active").attr("data-url");
        } else {
            Artbot.signupModal.vars.returnToPage = "/";
        }
        
        //console.log("Return to page: " + Artbot.signupModal.vars.returnToPage);

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
            beforeSend: function (request) {
                request.setRequestHeader("accept", "application/json");
            },
            success: function( data ){
                //console.log("Event detail data fetch successful");
                
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
        //console.log("Displaying event detail page content");
        var eventArray = jsonData;
        var eventTemplate = $('#template-eventdetail').html();

        //console.log("Event type: " + eventArray.event.event_type);

        $("h1").find("a").text(eventArray.event.event_type.capitalize());

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
            beforeSend: function (request) {
                request.setRequestHeader("accept", "application/json");
            },
            success: function( data ){
                //console.log("Venue detail data fetch successful");
                
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
        //console.log("Displaying venue detail page content");
        var venueArray = jsonData;
        var venueTemplate = $('#template-venuedetail').html();
        $("#target-venuedetail").fadeOut(400, function() {
            $("#target-venuedetail").html(_.template(venueTemplate, {venueArray:venueArray}));
            $("#target-venuedetail").fadeIn(400);
            //console.log("Venue page content finished displaying");

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
            beforeSend: function (request) {
                request.setRequestHeader("accept", "application/json");
            },
            success: function( data ){
                //console.log("Initial calendar event fetch successful");

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
                                beforeSend: function (request) {
                                    request.setRequestHeader("accept", "application/json");
                                },
                                success: function( data ){
                                    //console.log("Events for " + chosenMonth + " " + chosenYear + " retrieved successfully");

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
        //console.log("Displaying event list");

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
            //console.log("Setting up event calendar");

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
        //console.log("Setting up the Load More link click events");

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
        // On every page load, define a Remember Me default for the current user if it doesn't exist yet
        
        if ((typeof localStorage.remember_me == "undefined") && (typeof localStorage.current_user != "undefined")) {

            // Remember Me variable doesn't exist at all yet, set up a default value
            Artbot.settings.setRememberMe(localStorage.current_user, true);

        } else if ((typeof localStorage.remember_me != "undefined") && (typeof localStorage.current_user != "undefined")) {
            
            // Remember Me variable exists and we have a logged-in user
            // Check to see if we already have a Remember Me setting for this user
            var userSetting = Artbot.settings.getRememberMe(localStorage.current_user);

            console.log("User setting: " + userSetting);
            if (typeof userSetting == "undefined") {
                console.log("Setting a default Remember Me value for " + localStorage.current_user);
                Artbot.settings.setRememberMe(localStorage.current_user, true);
            }
        }
        

        // If it's the Settings page, more setup is needed
        if ($("#settings-form").length > 0) {

            var authtoken = Artbot.util.getAuthToken();

            if (typeof authtoken !== "undefined") {
                //console.log("Initializing app settings");

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
    setRememberMe: function(remembermeuser, remembermevalue) {
        var rememberMeValue = remembermevalue;
        var rememberMeUser = remembermeuser;

        /*
        We want the remember me data to look something like this:
        rememberme = {
            sma@clearbold.com: true,
            user2@example.com: true,
            user3@example.com: false
        }
        */

        // Get any current data from the remember me variable
        var rememberMeData = JSON.parse(localStorage.getItem("remember_me"));
        if (rememberMeData === null) {
            rememberMeData = {};
        }
        console.log("Existing Remember Me data: " + JSON.stringify(rememberMeData));

        rememberMeData[rememberMeUser] = rememberMeValue;
        console.log("New Remember Me data: " + JSON.stringify(rememberMeData));

        localStorage.remember_me = JSON.stringify(rememberMeData);
    },
    getRememberMe: function(remembermeuser) {
        var rememberMeValue,
        rememberMeUser = remembermeuser;
    
        var rememberMeData = JSON.parse(localStorage.getItem("remember_me"));
        if (rememberMeData === null) {
            rememberMeData = {};
        }

        rememberMeValue = rememberMeData[rememberMeUser];
        return rememberMeValue;
    },
    swapLocalAndSession: function(rememberme) {
        var rememberMeValue = rememberme;
        // Switch Remember Me if needed
        if ((rememberMeValue === false) && (typeof localStorage.authentication_token != "undefined")) {
            console.log("Switching to sessionStorage");
            sessionStorage.authentication_token = localStorage.authentication_token;
            sessionStorage.current_user = $("#email").val();
            localStorage.removeItem("authentication_token");
            localStorage.removeItem("current_user");

            Artbot.settings.setRememberMe(sessionStorage.current_user, false);
        } else if ((rememberMeValue === true) && (typeof sessionStorage.authentication_token != "undefined")) {
            console.log("Switching to localStorage");
            localStorage.authentication_token = sessionStorage.authentication_token;
            localStorage.current_user = $("#email").val();
            sessionStorage.removeItem("authentication_token");
            sessionStorage.removeItem("current_user");

            Artbot.settings.setRememberMe(localStorage.current_user, true);
        }
    },
    bindCustomCheckboxes: function() {
        Artbot.customCheckboxes.init("#settings-form");
    },
    unbindCustomCheckboxes: function() {
        Artbot.customCheckboxes.destroy("#settings-form");
    },
    fetchFieldValues: function() {
        var authtoken = Artbot.util.getAuthToken();
        $.ajax({
            type: "GET",
            url: Artbot.var.jsonDomain + "/preferences/",
            beforeSend: function (request) {
                request.setRequestHeader("authentication_token", authtoken);
                request.setRequestHeader("accept", "application/json");
            },
            success: function ( data, textStatus, jqXHR ) {
                //console.log("User preferences retrieved successfully.");
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
        //console.log(JSON.stringify(data.user));
        var $allInputs = $("#settings-form").find("input");

        // Reset the form, in case of caching (we want a fresh copy)
        document.getElementById("settings-form").reset();

        // Unbind the custom checkboxes, just in case
        Artbot.settings.unbindCustomCheckboxes();

        $allInputs.each(function() {
            var key = $(this).attr("id");
            if (userInfo[key] !== undefined ) {
                //console.log(key + ": " + userInfo[key]);

                if ($(this).attr("data-role") == "flipswitch") {
                    if (userInfo[key] === true) {
                        $(this).attr("checked", "checked").flipswitch("refresh");
                    }
                } else {
                    $(this).val(userInfo[key]);
                }
            }

        });

        // Sync up the custom checkbox for Remember Me
        var rememberMeDate = userInfo.remember_created_at;
        var $thisCheckbox = $("#remember_me");
        var rememberMeValue;
        console.log("Remember Me Date: " + rememberMeDate);

        if (rememberMeDate !== null) {
            //console.log("Remember Me should be set to true");
            rememberMeValue = true;
            if ($thisCheckbox.prop("checked") !== true) {
                $thisCheckbox.prop("checked", true);
            }
        } else {
            //console.log("Remember Me should be set to false");
            rememberMeValue = false;
            if ($thisCheckbox.prop("checked") === true) {
                $thisCheckbox.prop("checked", false);
            }
        }
        Artbot.settings.bindCustomCheckboxes();

        // Switch local/session storage if needed
        Artbot.settings.swapLocalAndSession(rememberMeValue);


        // Set up change event handling for the flip-switches
        var $ajaxInputs = $("#settings-form").find("input[data-role=flipswitch]");
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

        var authtoken = Artbot.util.getAuthToken();

        $.mobile.loading('show');
        $.ajax({
            type: "PUT",
            url: Artbot.var.jsonDomain + "/preferences/",
            data: ajaxDataToSend,
            beforeSend: function (request) {
                request.setRequestHeader("authentication_token", authtoken);
                request.setRequestHeader("accept", "application/json");
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
        //console.log("Submitting the changes to the Settings form");

        var $this = $("#settings-form"),
            viewArr = $this.serializeArray(),
            formData = {},
            rememberMeValue;

        for (var i in viewArr) {
            if (viewArr[i].name != "remember_me") { // Remember Me has to be handled separately
                formData[viewArr[i].name] = viewArr[i].value;
            }
        }

        // Add Remember Me
        var $thisCheckbox = $("#remember_me");
        if ($thisCheckbox.prop("checked") === true) {
            rememberMeValue = true;
        } else {
            rememberMeValue = false;
        }

        formData.remember_me = rememberMeValue;

        $.mobile.loading('show');

        var authtoken = Artbot.util.getAuthToken();

        $.ajax({
            type: "PATCH",
            url: Artbot.var.jsonDomain + "/preferences/",
            data: formData,
            beforeSend: function (request) {
                request.setRequestHeader("authentication_token", authtoken);
                request.setRequestHeader("accept", "application/json");
            },
            success: function(data, textStatus, jqXHR) {
                console.log("All user preferences successfully saved");

                // Switch local/session storage if needed
                Artbot.settings.swapLocalAndSession(rememberMeValue);
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
    vars: {
        historyData: []
    },
    init: function() {
        if ($("#target-historylist").length > 0) {
            var authtoken = Artbot.util.getAuthToken();

            if (typeof authtoken !== undefined) {
                console.log("Initializing History list");
                Artbot.historyList.fetchData();
            }
        }
    },
    fetchData: function() {
        $.mobile.loading('show');

        var authtoken = Artbot.util.getAuthToken();

        $.ajax({
            type: "GET",
            dataType: "json",
            url: Artbot.var.jsonDomain + "/favorites/history/",
            data: {
                page: 1,
                per_page:10000
            },
            beforeSend: function (request) {
                request.setRequestHeader("authentication_token", authtoken);
                request.setRequestHeader("accept", "application/json");
            },
            success: function( data ) {
                console.log("Successfully fetched History data");
                
                Artbot.historyList.vars.historyData = data;

                jsonDataString = JSON.stringify(Artbot.historyList.vars.historyData.favorites);

                //console.log(jsonDataString);

                if (jsonDataString.length > 2) {
                    // There are favorites, build the list
                    
                    Artbot.historyList.hideErrorMsg();

                    $("#target-historylist").fadeOut(400, function() {
                        Artbot.historyList.buildList(Artbot.historyList.vars.historyData);
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

        Artbot.historyList.unbindAttendanceCheckboxes();
        Artbot.historyList.addEventHandlers();
        Artbot.historyList.showList();
    },
    addEventHandlers: function() {
        // Initialize favorite stars and history checkbox selected states
        Artbot.historyList.syncAttended();
        Artbot.favoriteStars.init();
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
        var eventID = $(checkboxObj).attr("data-event-id");
        var userFavoriteID = $(checkboxObj).attr("data-user-favorite-id");
        console.log("User favorite: " + userFavoriteID + ", Value of property 'checked': " + isCheckboxChecked);
        

        var ajaxDataToSend = {
            attended: isCheckboxChecked
        };

        $.mobile.loading('show');

        var authtoken = Artbot.util.getAuthToken();

        $.ajax({
            type: "PUT",
            url: Artbot.var.jsonDomain + "/favorites/" + userFavoriteID,
            data: ajaxDataToSend,
            beforeSend: function (request) {
                request.setRequestHeader("authentication_token", authtoken);
                request.setRequestHeader("accept", "application/json");
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

        if (($("#history-form").find("input[type=checkbox]").length > 0)) {
            console.log("Syncing attendance checkboxes with user's attended records");

            // Reset the form, in case of caching (we want a fresh copy)
            document.getElementById("history-form").reset();

            
            jsonDataString = JSON.stringify(Artbot.historyList.vars.historyData.favorites);

            if (jsonDataString.length > 2) {
                // There are history items, so we may need to sync them up

                var userHistoryItems = Artbot.historyList.vars.historyData.favorites;

                // Iterate through each history item
                $.each(userHistoryItems, function(i, value) {
                    var thisItem = userHistoryItems[i];
                    var thisEventAttended;
                    
                    console.log("Checking user favorite " + thisItem.id + "; This event attended? " + thisItem.attended);

                    if (thisItem.attended === true) {
                        thisEventAttended = true;
                    } else {
                        thisEventAttended = false;
                    }
                    

                    if (thisEventAttended) {
                        console.log("Since this event is attended, toggle the checkbox to be checked.");
                        var userFavoriteID = thisItem.id;
                        //console.log("User favorite ID: " + userFavoriteID);

                        // Toggle the checkbox with the appropriate data attribute
                        var $thisCheckbox = $("#history-form").find("input[data-user-favorite-id=" + userFavoriteID + "]");

                        if ($thisCheckbox.prop("checked") !== true) {
                            $thisCheckbox.prop("checked", true).trigger("updateState");
                            console.log("Double-checking: is the checkbox checked as expected after the click event? " + $thisCheckbox.prop("checked"));
                        }
                    }
                });

                // Debugging: Quick check to list out which are checked after sync
                var allCheckboxes = $("#history-form").find(".customize-checkbox");
                console.log("Double-checking all the checkbox values now that things are synched:");
                $.each(allCheckboxes, function(i, value) {
                    var tempIsCheckboxChecked = $(this).prop("checked");
                    var tempUserFavoriteID = $(this).attr("data-user-favorite-id");
                    console.log("User favorite: " + tempUserFavoriteID + ", Value of property 'checked' after syncing: " + tempIsCheckboxChecked);
                });
                
                Artbot.historyList.bindAttendanceCheckboxes();

            }  
        }
    },
};


/* Setting up Favorites list functionality
   ========================================================================== */
Artbot.favoriteList = {
    init: function() {
        if ($("#target-favoritelist").length > 0) {
            var authtoken = Artbot.util.getAuthToken();

            if (typeof authtoken !== undefined) {
                //console.log("Initializing Favorites list");
                Artbot.favoriteList.fetchData();
            }
        }
    },
    fetchData: function() {
        var authtoken = Artbot.util.getAuthToken();

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
                request.setRequestHeader("authentication_token", authtoken);
                request.setRequestHeader("accept", "application/json");
            },
            success: function( data ) {
                //console.log("Successfully fetched Favorites data");
                
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
        //console.log("Building favorites list");
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
            //console.log("Number of favorites left: " + numberOfFavorites);

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

            var authtoken = Artbot.util.getAuthToken();

            if (typeof authtoken !== undefined) {

                console.log("Initializing functionality for My Interests");

                Artbot.interests.checkForInterests();

                var isCheckboxChecked = false;
                var checkboxID;
                var $thisCheckbox;

                // Set up click event for interest form checkboxes
                $("#interest-form-list").on("click", "input[type=checkbox]", function() {
                    isCheckboxChecked = $(this).prop("checked");
                    checkboxID = $(this).data("interest-id");
                    //console.log("checkboxID: " + checkboxID);
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
                    No Load More functionality, possibly a future enhancement. */
                    $.mobile.loading('show');

                    $.ajax({
                        type: Artbot.interests.vars.ajaxType,
                        url: Artbot.interests.vars.ajaxURL,
                        data: Artbot.interests.vars.ajaxData,
                        beforeSend: function (request) {
                            request.setRequestHeader("authentication_token", authtoken);
                            request.setRequestHeader("accept", "application/json");
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

        var authtoken = Artbot.util.getAuthToken();

        $.ajax({
            type: Artbot.interests.vars.ajaxType,
            url: Artbot.interests.vars.ajaxURL,
            beforeSend: function (request) {
                request.setRequestHeader("authentication_token", authtoken);
                request.setRequestHeader("accept", "application/json");
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
            beforeSend: function (request) {
                request.setRequestHeader("accept", "application/json");
                request.setRequestHeader("accept", "application/json");
            },
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
            beforeSend: function (request) {
                request.setRequestHeader("accept", "application/json");
            },
            success: function ( allTagsData, textStatus, jqXHR ) {
                console.log("Successfully retrieved full list of interests for subsetting");
                allTags = allTagsData.tags;
                //console.log("Total number of tags: " + allTags.length);

                var authtoken = Artbot.util.getAuthToken();

                // User's interests Ajax call
                $.ajax({
                    type: "GET",
                    url: Artbot.var.jsonDomain + "/interests/",
                    beforeSend: function (request) {
                        request.setRequestHeader("authentication_token", authtoken);
                        request.setRequestHeader("accept", "application/json");
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
        var authtoken = Artbot.util.getAuthToken();

        $.ajax({
            type: "GET",
            url: Artbot.var.jsonDomain + "/interests/",
            beforeSend: function (request) {
                request.setRequestHeader("authentication_token", authtoken);
                request.setRequestHeader("accept", "application/json");
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

            $("#signin-form").validate({
                submitHandler: Artbot.login.ajaxSubmit
            });
        }

        // Record the page you're on when a signin link is clicked
        $(".signin-link").click(function() {
            //console.log("Clicking the sign in link!");
            
            Artbot.signupModal.vars.returnToPage = $(".ui-page-active").attr("data-url");

            // If that page was one of the Forgot Password pages, redirect to Discover
            if (Artbot.signupModal.vars.returnToPage.substring(0, 7) == "/forgot") {
                
                Artbot.signupModal.vars.returnToPage = "/";
            }

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
            beforeSend: function (request) {
                request.setRequestHeader("accept", "application/json");
            },
            success: function( data ){
                console.log("Login successful! Saving our signin info");

                var emailAddress = $("#signin-email").val();
                var rememberMe = Artbot.settings.getRememberMe(emailAddress);
                
                if (rememberMe === false) {
                    console.log("Remember Me: false; using sessionStorage");
                    sessionStorage.authentication_token = data.authentication_token;
                    sessionStorage.current_user = $("#signin-email").val();
                } else {
                    console.log("Remember Me: true; using localStorage");
                    localStorage.authentication_token = data.authentication_token;
                    localStorage.current_user = $("#signin-email").val();
                }

                // If it's a pre-existing user without a signed_up variable, create one now
                if (typeof localStorage.signed_up == "undefined") {
                    console.log("Adding a 'signed_up' localStorage variable");
                    localStorage.signed_up = true;
                }
        

                if (!Artbot.el.html.hasClass("is-logged-in")) {
                    Artbot.el.html.addClass("is-logged-in");
                }
                console.log("Return to page value: " + Artbot.signupModal.vars.returnToPage);
                if ((Artbot.signupModal.vars.returnToPage !== undefined) && (Artbot.signupModal.vars.returnToPage !== "")) {
                    $.mobile.pageContainer.pagecontainer ("change", Artbot.signupModal.vars.returnToPage, {reloadPage: true});
                } else {
                    $.mobile.pageContainer.pagecontainer ("change", "/", {reloadPage: true});
                }
                
            },
            error: function (jqXHR, error, errorThrown) {
                console.log("User login submit failed");
                Artbot.errors.logAjaxError(jqXHR, error, errorThrown, true);


                /* If authentication fails, it will return a generic error payload and we can't run it through the usual showFormError because there's no form field ID provided */

                if ((jqXHR.status == 403) || (jqXHR.status == 404) || (jqXHR.status == 422)) { 

                    // Get results from JSON error
                    var result = $.parseJSON(jqXHR.responseText);
                    var errorText;
                    var $errorSource;
                    var errorSourceId;
                    var errorLabelHTML;
                    var $errorLabel;

                    $.each(result, function(k, v) {
                        
                        errorText = k.capitalize() + " " + v.toString();
                        console.log("Error text: " + errorText);

                        if (k == "email") {
                            $errorSource = $("#signin-email");
                            errorSourceId = "signin-email";
                        } else if (k == "password") {
                            $errorSource = $("#signin-password");
                            errorSourceId = "signin-password";
                        }

                        if ($("#" + errorSourceId + "-error").length > 0) {
                            console.log("Error already exists");
                            $errorLabel = $("#signin-password-error");
                            $errorLabel.html(errorText).show();
                        } else {
                            console.log("Error is new");
                            $errorLabel = $("<label>")
                                .attr("id", "#" + errorSourceId + "-error")
                                .addClass("error")
                                .html(errorText)
                                .attr( "for", errorSourceId);
                            $errorLabel.insertAfter( $errorSource );
                        }

                        $errorSource
                            .removeClass("valid")
                            .addClass("error")
                            .attr( "aria-invalid", true );
                    });

                } else {
                    Artbot.errors.showFormError(jqXHR.responseText, "signin-form");
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
            
            // Remove the authorization token and username variables
            localStorage.removeItem("authentication_token");
            localStorage.removeItem("current_user");
            sessionStorage.removeItem("authentication_token");
            sessionStorage.removeItem("current_user");

            // Remove the "is-logged-in" class from the HTML element
            Artbot.el.html.removeClass("is-logged-in");
            // Send them back to the main Discover page
            $.mobile.pageContainer.pagecontainer ("change", "/", {reloadPage: true});
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
    showError: function(error) {
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
            beforeSend: function (request) {
                request.setRequestHeader("accept", "application/json");
            },
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
            beforeSend: function (request) {
                request.setRequestHeader("accept", "application/json");
            },
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
            
            // If we wanted to limit the map so that it contained all pins:
            //var bounds = L.latLngBounds(Artbot.byLocation.vars.boundsArray);
            //console.log(bounds);
            //Artbot.byLocation.vars.mapInstance.fitBounds(bounds, { padding: [10, 10]});
        }

        Artbot.footerSlider.init();
    }
};

/* Standalone status bar fixes
   ========================================================================== */
Artbot.webAppStatusBar = {
    init: function() {
        // We only want to apply style changes if it's a standalone app.
        // The only meta tag that works for iOS 8 is black-translucent, but there's a bug which makes it not take up any space.
        // We're combating that with certain styles and media queries in the CSS.  We need a hook for them.
        if (window.navigator.standalone) { 
            $("html").addClass("standalone-app");
        }

        // We need to aim an additional fix at iOS7, where the status bar has no background
        if (navigator.userAgent.match(/(iPad|iPhone|iPod touch);.*CPU.*OS 7_\d/i)) {
            $("html").addClass("ios7");
        }
    }
};

/* Forgot Password functionality
   ========================================================================== */
Artbot.forgotPassword = {
    init: function() {
        if ($("#forgotpassword-form").length > 0) {
            // Set up validation and Ajax submit
            $("#forgotpassword-form").validate({
                submitHandler: Artbot.forgotPassword.ajaxSubmit
            });
        }
    },
    ajaxSubmit: function() {
        $.mobile.loading('show');
        $.ajax({
            type: "PATCH",
            url: Artbot.var.jsonDomain + "/registrations/",
            data: {
                email: $("#email").val()
            },
            beforeSend: function (request) {
                request.setRequestHeader("accept", "application/json");
            },
            success: function(data, textStatus, jqXHR) {
                console.log("Password reset request sent");
                $.mobile.pageContainer.pagecontainer ("change", "forgot-password-confirm.html", {reloadPage: true});
            },
            error: function (jqXHR, error, errorThrown) {
                console.log("Error sending password reset request");
                Artbot.errors.logAjaxError(jqXHR, error, errorThrown);

                /* If the request fails with a 404 error, it will return a generic error payload and we can't run it through the usual showFormError because there's no form field ID provided */

                if (jqXHR.status == 404) { 
                    var errorText;
                    var $errorLabel;

                    errorText = "Email address not found in our system.";

                    if ($("#email-error").length > 0) {
                        $errorLabel = $("#email-error");
                        $errorLabel.addClass("error").html(errorText).show();
                    } else {
                        $errorLabel = $("<label>")
                            .attr("id", "email-error")
                            .addClass("error")
                            .html(errorText)
                            .attr( "for", "email");
                        $errorLabel.insertAfter( $("#email") );
                    }
                    $("#email").addClass("error");
                }
            },
            complete: function() {
                $.mobile.loading('hide');
            }
        });
    }
};

/* Reset Password functionality
   ========================================================================== */
Artbot.resetPassword = {
    token: "",
    init: function() {
        if ($("#passwordreset-form").length > 0) {
            console.log("Initializing Reset Password form");

            // Get the password change token from a querystring
            Artbot.resetPassword.token = Artbot.util.findQuerystring("reset_password_token");
            
            if (typeof Artbot.resetPassword.token != 'undefined') {
                console.log("Reset password token passed in via querystring: " + Artbot.resetPassword.token);

                // Set up validation and Ajax submit
                $("#passwordreset-form").validate({
                    submitHandler: Artbot.resetPassword.ajaxSubmit
                });
            } else {
                // What should we do if the token is not present for any reason?
            }
        }
    },
    ajaxSubmit: function() {
        // Testing
        //console.log("New password: " + $("#password").val());
        //console.log("New password confirmed: " + $("#password_confirmation").val());
        //console.log("Password reset token from querystring: " + Artbot.resetPassword.token);

        $.mobile.loading('show');
        $.ajax({
            type: "PUT",
            url: Artbot.var.jsonDomain + "/registrations",
            data: {
                password: $("#password").val(),
                password_confirmation: $("#password_confirmation").val()
            },
            beforeSend: function (request) {
                request.setRequestHeader("reset_password_token", Artbot.resetPassword.token);
                request.setRequestHeader("accept", "application/json");
            },
            success: function(data, textStatus, jqXHR) {
                console.log("Password reset successful");
                $.mobile.pageContainer.pagecontainer ("change", "forgot-password-reset-confirm.html", {reloadPage: true});
            },
            error: function (jqXHR, error, errorThrown) {
                console.log("Error resetting password");
                //Artbot.errors.logAjaxError(jqXHR, error, errorThrown);
                Artbot.errors.showFormError(jqXHR.responseText, "passwordreset-form");
            },
            complete: function() {
                $.mobile.loading('hide');
            }
        });
    }
};


/* Initialize/Fire
   ========================================================================== */
Artbot.startup = {
    init : function () {
        //console.log("**Beginning of scripts initializing");

        $('a[href="#"]').click(function(e){e.preventDefault();});

        Artbot.webAppStatusBar.init();

        Artbot.discoverSlider.init();
        Artbot.login.init();
        Artbot.logout.init();
        Artbot.forgotPassword.init();
        Artbot.resetPassword.init();
        Artbot.interests.init();
        Artbot.calendar.init();
        Artbot.settings.init();
        Artbot.byLocation.init();
        Artbot.eventdetail.init();
        Artbot.venuedetail.init();
        Artbot.favoriteList.init();
        Artbot.historyList.init();

        Artbot.loadMore.init();
        Artbot.setupTextTruncation();
        Artbot.favoriteStars.init();

        //console.log("**End of scripts initializing");
    },
    finalize : function() {
        //console.log("**Beginning of scripts finalizing");

        // Initialize FastClick on certain items, to remove the 300ms delay on touch events
        FastClick.attach(document.body);

        var authtoken = Artbot.util.getAuthToken(),
            currentuser = Artbot.util.getCurrentUser(),
            signedup = localStorage.signed_up,
            priorvisit = localStorage.prior_visit;

        console.log("Auth token: " + authtoken);
        console.log("Current user: " + currentuser);
        console.log("Signed up: " + signedup);
        console.log("Prior visit: " + priorvisit);
        //console.log("Remember Me: " + rememberme);

        // If they aren't logged in and haven't signed up and it's not a login-related page...
        if ((typeof authtoken == "undefined") && (typeof signedup == "undefined")  && ($(".ui-page-active").attr("data-url") != "/sign-in.html") && ($(".ui-page-active").attr("data-url").substring(0, 7) != "/forgot")) {

            if ($("#discover-slider").length > 0) {
                // If it's the Discover page, always pop the modal.
                console.log("Popping the new visitor sign up window");
                setTimeout(function(){
                    Artbot.signupModal.open();
                },1000);

            } else {
                // If it's not the Discover page,
                // Check for priorvisit
                if ((typeof priorvisit === "undefined")) {
                    console.log("Popping the new visitor sign up window");
                    setTimeout(function(){
                        Artbot.signupModal.open();
                    },1000);
                } 
            }
        }

        // If they're already logged in, let's add the CSS class for that
        if (typeof authtoken !== "undefined") {
            if (!Artbot.el.html.hasClass("is-logged-in")) {
                Artbot.el.html.addClass("is-logged-in");
            }
            // Add in any dynamic usernames
            if ($(".dynamic-username").length > 0) {
                $(".dynamic-username").html(currentuser);
            }
        }

        /*
        alert("My Number of page divs: " + $("[data-role=page]").length);
        $("[data-role=page]").each(function() {
            alert("Data url: " + $(this).attr("data-url"));
        }); */

        //console.log("**End of scripts finalizing");
    }
};

$(document).ready(function() {
    //console.log("****jQuery DOM Ready event firing");
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

/*
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
*/


$(document).on( "pagebeforehide", function( event ) {
    //console.log("****JQM pagebeforehide event firing");

    /* Destroying sliders before hiding a page */
    Artbot.footerSlider.destroy();

    /* Destroying interest checkbox bindings before hiding a page */
    Artbot.interests.destroy();

    // Setting the Prior Visit variable if it doesn't already exist
    if (typeof localStorage.prior_visit == "undefined") {
        localStorage.prior_visit = true;
    }
});


$(document).on("pagehide", "div[data-role=page]", function(event){
    //console.log("****JQM pagehide event firing");

    /* Removing the prior page on page hide, so that we don't have multiple versions of pages cluttering the DOM */
    //console.log("Hiding the previous page");
    $(event.target).remove();
});

/*
$(document).on( "pagecontainerbeforeshow", function( event ) {
    console.log("****JQM pagecontainerbeforeshow event firing");
});
*/


$(document).on( "pagecontainershow", function( event ) {

    //console.log("****JQM pagecontainershow event firing");

    //console.log("***Beginning of new page load scripts");

    /* Fire based on document context
    ========================================================================== */

    var namespace  = Artbot.startup;
    if (typeof namespace.init === 'function') {
        namespace.init();
    }

    if (typeof namespace.finalize === 'function') {
        namespace.finalize();
    }

    // Check for a localStorage value that says that they've visited before 
    // (in case they only hit one page and the pagehide event never fires)
    if (typeof localStorage.prior_visit == "undefined") {
        localStorage.prior_visit = true;
    }

    //console.log("***End of new page load scripts");

});

/*
$(document).on( "pagecontainertransition", function( event ) {
    console.log("****JQM pagecontainertransition event firing");
});
*/
