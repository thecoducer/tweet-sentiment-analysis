
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


/* table row link script */
$(document).ready(function ($) {
    $(".table-row").click(function () {
        /* window.document.location = $(this).data("href"); */
        var url = $(this).data("href");
        window.open(url, '_blank');
    });
});

/* search form on submit */
$('#search-form').on('submit', function (event) {
    event.preventDefault();
    console.log("form submitted!")
    $("#welcome").hide();
    $("#loading").show();
    console.log($("#searchinput-id").val());
    console.log($("input:radio[name='option']:checked").val());
    getdata();
});


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

            console.log("inside success");

            for (var i = 0; i < json.length - 1; i++) {
                $("#table-result").append("<tr> <td>" + json[i]['timestamp'] + "</td>" + "<td>" + json[i]['tidy_tweet'] + "</td>" + "</td> </tr>");
            }

            $("#loading").hide();

            $("#result").show();
            $("#display-count").show();

            console.log("success");
        },
    });
};
