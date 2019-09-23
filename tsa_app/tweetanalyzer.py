from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import tweepy
from decouple import config
from datetime import datetime
import re
from googletrans import Translator
from wordcloud import WordCloud, STOPWORDS 
import matplotlib.pyplot as plt
import seaborn as sns

# ================================================================

def tidify_tweets(raw_tweet):
    return ' '.join(re.sub("(RT @[\w]*:)|(@[A-Za-z0-9]+)|(\w+:\/\/\S+)", " ", raw_tweet).split())

# ================================================================

def translate_tweet(tidy_tweet):
    return Translator().translate(tidy_tweet).text

# ================================================================

def word_cloud(tweet_list):
    stopwords = sns.set(STOPWORDS)
    all_words = ' '.join([text for text in tweet_list])
    wordcloud = WordCloud(
        background_color='white',
        stopwords=stopwords,
        width=1600,
        height=800,
        random_state=21,
        colormap='jet',
        max_words=50,
        max_font_size=200).generate(all_words)
    plt.figure(figsize=(12, 10))
    plt.axis('off')
    plt.imshow(wordcloud, interpolation="bilinear")

# ================================================================

def prepare_output_data(tweets):
    output_data = []

    positive_count = negative_count = neutral_count = 0

    for tweet in tweets:
        #output_data[tweet_id] = []
        data = {}

        # add tweet id
        data['id'] = str(tweet.id)

        # fetch username and add it
        data['username'] = tweet.author._json['screen_name']

        # fetch date and time and add it
        timestamp = tweet.created_at.strftime("%d-%b-%Y, %H:%M")
        data['timestamp'] = timestamp

        try:
            # add the fetched tweet (raw tweet)
            data['raw_tweet'] = tweet.retweeted_status.full_text
            # tidify tweet 
            tidy_tweet = tidify_tweets(tweet.retweeted_status.full_text)
        except AttributeError:  # Not a Retweet
            # add the fetched tweet (raw tweet)
            data['raw_tweet'] = tweet.full_text
            # tidify tweet 
            tidy_tweet = tidify_tweets(tweet.full_text)

        # translate the tidy tweet
        #tidy_tweet = translate_tweet(tidy_tweet)

        # add tidy tweet
        data['tidy_tweet'] = str(tidy_tweet)
        
        # get sentiment score
        score = sentiment_score(tidy_tweet)

        # add score
        data['sentiment'] = score

        output_data.append(data)

        # getting score counts
        if score == 'positive':
            positive_count += 1
        elif score == 'negative':
            negative_count += 1
        else:
            neutral_count += 1

    # adding score counts
    count = {}
    count['positive_count'] = positive_count
    count['negative_count'] = negative_count
    count['neutral_count'] = neutral_count
    count['total_count'] = positive_count + negative_count + neutral_count

    output_data.append(count)

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

    # for adding search input data
    input = {}

    input['option'] = option

    if option == 1:
        # fetch tweets that contains the keyword
        try:
            tweets = api.search(keywords, count=150, tweet_mode='extended')
            input['keywords'] = keywords
        except Exception:
            return 'try again'
    else:
        # fetch tweets from a user
        username = '@' + username
        try:
            tweets = api.user_timeline(username, count=500, tweet_mode='extended')
            input['username'] = username
        except Exception:
            return 'user not found'

    output_data = prepare_output_data(tweets)

    output_data.append(input)

    return output_data

# ================================================================