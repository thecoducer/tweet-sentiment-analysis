from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import tweepy
from decouple import config
from datetime import datetime
import re
import numpy as np 


def tweet_analyzer(query):
    consumer_key = config('consumer_key')
    consumer_secret = config('consumer_secret')

    access_token = config('access_token')
    access_token_secret = config('access_token_secret')

    auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
    auth.set_access_token(access_token, access_token_secret)

    api = tweepy.API(auth)

    # fetching tweets that contains the query
    tweets = api.search(query, count=150, tweet_mode='extended')

    tweet_analyzer = SentimentIntensityAnalyzer()

    output_data = {}

    for tweet in tweets:
        output_data['tweet.id'] = []

        # fetch username and add it
        output_data['tweet.id'].append(tweet.author._json['screen_name'])

        # fetch date and time and add it
        timestamp = tweet.created_at.strftime("%d-%b-%Y, %H:%M")
        output_data['tweet.id'].append(timestamp)

        # add the fetched tweet (raw tweet)
        try:
            output_data['tweet.id'].append(tweet.retweeted_status.full_text)
        except AttributeError:  # Not a Retweet
            output_data['tweet.id'].append(tweet.full_text)

    # tidify tweet data
    # then send for sentiment analysis


        score = tweet_analyzer.polarity_scores(query)
        compound_score = score['compound']
        if compound_score >= 0.05:
            return 'positive'
        elif (compound_score > -0.05) and (compound_score < 0.05):
            return 'neutral'
        else:
            return 'negative'
