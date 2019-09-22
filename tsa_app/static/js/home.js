
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
    $("#index-label").hide();
    $('#not-found').hide();
    $("#result").hide();
    console.log($("#searchinput-id").val());
    console.log($("input:radio[name='option']:checked").val());
    getdata();
});


/* give color to the row */

function sentiment_to_color(sentiment) {
    if (sentiment == 'positive') return 'tr-positive';
    else if (sentiment == 'negative') return 'tr-negative';
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
            $('#table-head').empty();
            $('#chart-container').empty();

            console.log("inside success");

            if (json['user not found'] == 'user not found') {
                $("#loading").hide();
                $("#not-found").show();
            }
            else {
                var len = json.length;

                if (json[len - 1]['option'] == 1) {
                    $("#table-head").append('<tr><th scope="col">Timestamp</th>' + '<th scope="col">Tweets</th>'
                        + '<th scope="col">Username</th></tr>');

                    for (var i = 0; i < len - 2; i++) {
                        var username = json[i]['username'];
                        var id = json[i]['id'];
                        var url = "https://twitter.com/" + username + "/status/" + id

                        $("#table-result").append("<tr id=" + id + " class=" + sentiment_to_color(json[i]['sentiment'])
                            + "> <td>" + json[i]['timestamp'] + "</td>" + "<td>" + json[i]['tidy_tweet'] + "</td>" + "<td>" + json[i]['username'] + "</td>" + "</tr>");

                        $("tr").addClass("table-row");

                        $("#" + id).attr("data-href", url);
                    }
                } else {
                    $("#table-head").append('<tr><th scope="col">Timestamp</th>' + '<th scope="col">Tweets</th></tr>');

                    for (var i = 0; i < len - 2; i++) {
                        var username = json[i]['username'];
                        var id = json[i]['id'];
                        var url = "https://twitter.com/" + username + "/status/" + id

                        $("#table-result").append("<tr id=" + id + " class=" + sentiment_to_color(json[i]['sentiment']) + "> <td>" + json[i]['timestamp'] + "</td>" + "<td>" + json[i]['tidy_tweet'] + "</td>" + "</td> </tr>");
                        $("tr").addClass("table-row");

                        $("#" + id).attr("data-href", url);
                    }
                }

                if (json[len - 1]['option'] == 1) {
                    $("#display-count").append('<center> <h4 class="alert-heading">' + "Fetched " + json[len - 2]['total_count'] + " tweets on \"" + json[len - 1]['keywords'] + "\"" + "</h4>");
                } else {
                    $("#display-count").append('<center> <h4 class="alert-heading">' + "Fetched " + json[len - 2]['total_count'] + " tweets from " + json[len - 1]['username'] + "</h4>");
                }

                /* chart code */
                var positive = ((json[len - 2]['positive_count'] / json[len - 2]['total_count']) * 100).toFixed(2);
                var negative = ((json[len - 2]['negative_count'] / json[len - 2]['total_count']) * 100).toFixed(2);
                var neutral = ((json[len - 2]['neutral_count'] / json[len - 2]['total_count']) * 100).toFixed(2);

                var poslabel = 'Positive (' + positive + '%)';
                var neglabel = 'Negative (' + negative + '%)';
                var neulabel = 'Neutral (' + neutral + '%)';

                console.log(positive);

                $('#chart-container').append('<canvas id="myChart"></canvas>')

                var ctx = document.getElementById('myChart');
                var myChart = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: [poslabel, neglabel, neulabel],
                        datasets: [{
                            label: ' ',
                            data: [positive, negative, neutral],
                            backgroundColor: [
                                '#a1f0b0',
                                '#ff9c9c',
                                '#99ceff'
                            ],
                            borderColor: [],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        cutoutPercentage: 50
                    }
                });

                $("#loading").hide();
                $("#result").show();
                $("#display-count").show();
                $("#index-label").show();
            }

            console.log("success");
        },
    });
};
