
// ===== Scroll to Top ==== 
$(window).scroll(function () {
    if ($(this).scrollTop() >= 50) {        // If page is scrolled more than 50px
        $('#return-to-top').fadeIn(200);    // Fade in the arrow
    } else {
        $('#return-to-top').fadeOut(200);   // Else fade out the arrow
    }
});
$('#return-to-top').click(function () {      // When arrow is clicked
    $('body,html').animate({
        scrollTop: 0                       // Scroll to top of body
    }, 500);
});




/* search form on submit */
$('#search-form').on('submit', function (event) {
    event.preventDefault();
    console.log("form submitted!")
    $("#welcome").hide();
    $("#loading").show();
    $("#display-count").hide();
    $("#result").hide();
    console.log($("#searchinput-id").val());
    console.log($("input:radio[name='option']:checked").val());
    getdata();
});


/* give color to the row */

function sentiment_to_color(sentiment){
    if(sentiment == 'positive') return 'tr-positive';
    else if(sentiment == 'negative') return 'tr-negative';
    else return 'tr-neutral';
}


/* AJAX for posting search form data */
function getdata() {

    console.log("search is working!")
    $.ajax({
        url: "", // the endpoint
        type: "POST", // http method
        data: {
            'searchinput': $("#searchinput-id").val(),
            'option': $("input:radio[name='option']:checked").val(),
            'csrfmiddlewaretoken': $("input[name='csrfmiddlewaretoken']").val()
        },// data sent with the post request

        // handle a successful response
        success: function (json) {
            $('#searchinput-id').val('');
            $('#option-id').val('');

            $('#display-count').empty();
            $('#table-result').empty();

            console.log("inside success");

            var len = json.length;

            for (var i = 0; i < len - 2; i++) {
                var username = json[i]['username'];
                var id = json[i]['id'];
                var url = "https://twitter.com/" + username + "/status/" + id

                $("#table-result").append("<tr id=" + id + " class=" + sentiment_to_color(json[i]['sentiment']) + "> <td>" + json[i]['timestamp'] + "</td>" + "<td>" + json[i]['tidy_tweet'] + "</td>" + "</td> </tr>");
                $("tr").addClass("table-row");
                
                $("#"+id).attr("data-href", url);
            }

            if(json[len-1]['option'] == 1){
                $("#display-count").append('<center> <h4 class="alert-heading">' + "Fetched " + json[len-2]['total_count'] + " tweets on \"" + json[len-1]['keywords']  + "\"" + "</h4>");
            }else{
                $("#display-count").append('<center> <h4 class="alert-heading">' + "Fetched " + json[len-2]['total_count'] + " tweets from " + json[len-1]['username'] + "</h4>");
            }

            /* sentiment_to_color(json[i]['sentiment']) */

            $("#loading").hide();

            $("#result").show();
            $("#display-count").show();

            console.log("success");
        },
    });
};
