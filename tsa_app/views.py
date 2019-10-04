from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from tsa_app.tweetanalyzer import tweet_analyzer, word_cloud
from tsa_app.form import SearchForm
import json

# Create your views here.

def home(request):
    if request.method == "POST":
        form = SearchForm(request.POST)

        searchinput = request.POST.get('searchinput')
        option = int(request.POST.get('option'))

        if option == 1:
            result = tweet_analyzer(searchinput, '', 1)
        else:
            result = tweet_analyzer('', searchinput, 2)  # option is not 1

        if result == 'user not found':
            return JsonResponse({'user not found': 'user not found'})

        if result == 'try again':
            return JsonResponse({'try again': 'try again'})

        # get total count
        total_count = result[-2]['total_count']

        if total_count == 0:
            return JsonResponse({'no data': 'no data'})
        else:
            return JsonResponse(result, safe=False)
    else:
        form = SearchForm()
        return render(request, 'home.html', {'form': form})

def image(request):
    return "static/images/wordcloud.png"
