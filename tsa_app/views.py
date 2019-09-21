from django.shortcuts import render
from tsa_app.tweetanalyzer import tweet_analyzer

# Create your views here.

def home(request):
    return render(request, 'home.html')