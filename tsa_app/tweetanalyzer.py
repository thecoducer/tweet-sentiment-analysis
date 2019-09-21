from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import tweepy
from decouple import config
from datetime import datetime
import re

# ================================================================

def tidify_tweets(raw_tweet):
    return ' '.join(re.sub("(RT @[\w]*:)|(@[A-Za-z0-9]+)|(\w+:\/\/\S+)", " ", raw_tweet).split())

# ================================================================

def prepare_output_data(tweets):
    output_data = {}

    positive_count = negative_count = neutral_count = 0

    for tweet in tweets:
        tweet_id = str(tweet.id)
        output_data[tweet_id] = []

        # fetch username and add it
        output_data[tweet_id].append(tweet.author._json['screen_name'])

        # fetch date and time and add it
        timestamp = tweet.created_at.strftime("%d-%b-%Y, %H:%M")
        output_data[tweet_id].append(timestamp)

        try:
            # add the fetched tweet (raw tweet)
            output_data[tweet_id].append(tweet.retweeted_status.full_text)
            # tidify tweet 
            tidy_tweet = tidify_tweets(tweet.retweeted_status.full_text)
        except AttributeError:  # Not a Retweet
            # add the fetched tweet (raw tweet)
            output_data[tweet_id].append(tweet.full_text)
            # tidify tweet 
            tidy_tweet = tidify_tweets(tweet.full_text)

        # add tidified tweet
        output_data[tweet_id].append(tidy_tweet)
        # get sentiment score
        score = sentiment_score(tidy_tweet)

        # add score
        output_data[tweet_id].append(score)

        # getting score counts
        if score == 'positive':
            positive_count += 1
        elif score == 'negative':
            negative_count += 1
        else:
            neutral_count += 1

    # adding score counts
    output_data['positive_count'] = positive_count
    output_data['negative_count'] = negative_count
    output_data['neutral_count'] = neutral_count

    return output_data

# ================================================================

def sentiment_score(tidy_tweet):
    getScore = SentimentIntensityAnalyzer()
    
    scores = getScore.polarity_scores(tidy_tweet)
    compound_score = scores['compound']
    if compound_score >= 0.05:
        return 'positive'
    elif (compound_score > -0.05) and (compound_score < 0.05):
        return 'neutral'
    else:
        return 'negative'

# ================================================================

def tweet_analyzer(keywords='', username='', option=1):
    consumer_key = config('consumer_key')
    consumer_secret = config('consumer_secret')

    access_token = config('access_token')
    access_token_secret = config('access_token_secret')

    auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
    auth.set_access_token(access_token, access_token_secret)

    api = tweepy.API(auth)

    if option == 1:
        # fetch tweets that contains the keyword
        tweets = api.search(keywords, count=150, tweet_mode='extended')
    else:
        # fetch tweets from a user
        username = '@' + username
        try:
            tweets = api.user_timeline(username, count=500, tweet_mode='extended')
        except Exception:
            return 'user not found'

    output_data = prepare_output_data(tweets)
    return output_data

# ================================================================