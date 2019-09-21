from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from tsa_app.tweetanalyzer import tweet_analyzer
from tsa_app.form import SearchForm
import json 

# Create your views here.

def home(request):
    if request.method == "POST":
        form = SearchForm(request.POST)
        if form.is_valid():
            print("Helloooooooooo")
            search_input = request.POST['search_input']
            option = int(request.POST['option'])
            
            if option == 1:
                result = tweet_analyzer(search_input, '', 1)
            else:
                result = tweet_analyzer('', search_input, 2) # option is not 1

            # calculate total count
            total_count = result['positive_count'] + result['negative_count'] + result['neutral_count']
                
            if total_count == 0:
                return JsonResponse({'no data': 'no data'})
            elif result == 'user not found':
                return JsonResponse({'user not found': 'user not found'})
            else:
                #print(result)    
                #d = [{'title': t, 'date': d} for t, d in zip(data['title'], data['date'])]
                return JsonResponse(result)
    else:
        form = SearchForm()
        return render(request, 'home.html', {'form': form})