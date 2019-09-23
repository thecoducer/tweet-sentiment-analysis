
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

function downloadCSV(csv, filename) {
    var csvFile;
    var downloadLink;

    // CSV file
    csvFile = new Blob([csv], { type: "text/csv" });

    // Download link
    downloadLink = document.createElement("a");

    // File name
    downloadLink.download = filename;

    // Create a link to the file
    downloadLink.href = window.URL.createObjectURL(csvFile);

    // Hide download link
    downloadLink.style.display = "none";

    // Add the link to DOM
    document.body.appendChild(downloadLink);

    // Click download link
    downloadLink.click();
}

function exportTableToCSV() {
    var filename = "tweesen.csv";
    var csv = [];
    var rows = document.querySelectorAll("table tr");

    for (var i = 0; i < rows.length; i++) {
        var row = [], cols = rows[i].querySelectorAll("td, th");

        for (var j = 0; j < cols.length; j++)
            row.push(cols[j].innerText);

        csv.push(row.join(","));
    }

    // Download CSV file
    downloadCSV(csv.join("\n"), filename);
}

/* search form on submit */
$('#search-form').on('submit', function (event) {
    event.preventDefault();
    console.log("form submitted!")
    $("#welcome").hide();
    $("#loading").show();
    $("#display-count").hide();
    $("#index-label").hide();
    $('#not-found').hide();
    $('#no-data').hide();
    $("try-again").hide();
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
            /* $('#searchinput-id').val(''); */
            $('#option-id').val('');

            $('#display-count').empty();
            $('#table-result').empty();
            $('#table-head').empty();
            $('#chart-container').empty();
            $("#index-label-content").empty();

            console.log("inside success");

            if (json['user not found'] == 'user not found') {
                $("#loading").hide();
                $("#not-found").show();
            }
            else if (json['no data'] == 'no data') {
                $("#loading").hide();
                $("#no-data").show();
            }
            else if (json['try again'] == 'try again') {
                $("#loading").hide();
                $("#try-again").show();
            }
            else {
                var len = json.length;

                if (json[len - 1]['option'] == 1) {
                    $("#table-head").append('<tr><th scope="col">Timestamp</th>' + '<th scope="col">Tweets</th>'
                        + '<th scope="col">Username</th>' + '<th class="hidden" scope="col">Sentiment</th></tr>');

                    for (var i = 0; i < len - 2; i++) {
                        var username = json[i]['username'];
                        var id = json[i]['id'];
                        var url = "https://twitter.com/" + username + "/status/" + id
                        var profile = "https://twitter.com/" + username

                        $("#table-result").append("<tr class=" + sentiment_to_color(json[i]['sentiment']) + '> <td>' + json[i]['timestamp'] + "</td>" + "<td>" + '<a href="' + url + '" target="_blank">' + json[i]['tidy_tweet'] + "</a></td>" + "<td>" + '<a href="' + profile + '" target="_blank">' + json[i]['username'] + "</a></td>" + '<td class="hidden">' + json[i]['sentiment'] + "</td></tr>");
                       
                    }
                } else {
                    $("#table-head").append('<tr><th scope="col">Timestamp</th>' + '<th scope="col">Tweets</th>' + '<th class="hidden" scope="col">Sentiment</th></tr>');

                    for (var i = 0; i < len - 2; i++) {
                        var username = json[i]['username'];
                        var id = json[i]['id'];
                        var url = "https://twitter.com/" + username + "/status/" + id

                        $("#table-result").append("<tr class=" + sentiment_to_color(json[i]['sentiment']) + "> <td>" + json[i]['timestamp'] + "</td>" + "<td>" + '<a href="' + url + '" target="_blank">' + json[i]['tidy_tweet'] + "</a></td>" + '<td class="hidden">' + json[i]['sentiment'] + "</td> </tr>");
                      
                    }
                }

                if (json[len - 1]['option'] == 1) {
                    $("#display-count").append('<center> <h4 class="alert-heading">' + "Fetched " + json[len - 2]['total_count'] + " tweets on \"" + json[len - 1]['keywords'] + "\"" + "</h4>");

                    $("#index-label").append("<center><p>Click any tweet or username to open it in Twitter.</p></center>");
                } else {
                    $("#display-count").append('<center> <h4 class="alert-heading">' + "Fetched " + json[len - 2]['total_count'] + " tweets from " + json[len - 1]['username'] + "</h4>");

                    $("#index-label").append("<center><p>Click any tweet to open it in Twitter.</p></center>");
                }

                var tt = '<div class="text-center"><button onclick="exportTableToCSV()" class="btn btn-primary btn-md">Download as CSV</button></div>';

                $("#display-count").append(tt);

                /* chart code */
                var positive = Math.round((json[len - 2]['positive_count'] / json[len - 2]['total_count']) * 100);
                var negative = Math.round((json[len - 2]['negative_count'] / json[len - 2]['total_count']) * 100);
                var neutral = Math.round((json[len - 2]['neutral_count'] / json[len - 2]['total_count']) * 100);

                var poslabel = 'Positive (' + positive + '%)';
                var neglabel = 'Negative (' + negative + '%)';
                var neulabel = 'Neutral (' + neutral + '%)';

                $("#index-label-content").append('<span class="badge tr-positive">' + poslabel + '</span><span class="badge tr-negative">' + neglabel + '</span><span class="badge tr-neutral">' + neulabel + '</span>');

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