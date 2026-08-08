# ---
# jupyter:
#   jupytext:
#     text_representation:
#       extension: .py
#       format_name: percent
#       format_version: '1.3'
#       jupytext_version: 1.19.5
#   kernelspec:
#     display_name: Python 3
#     language: python
#     name: python3
# ---

# %% [markdown]
# # **Smart Travel Assistant - Professional Project Overview**
# ----
#
# # **Project Description**
#
# I've developed an intelligent travel assistant using Natural Language Processing (NLP) that understands travel-related queries in English and provides helpful responses. This AI-powered assistant can handle various travel inquiries including hotel bookings, flight information, destination recommendations, visa requirements, and more.
#
# ----
# # **Key Features**
#
# · Natural Language Understanding: Processes English travel queries using advanced NLP techniques
# · Intent Classification: Accurately identifies user intent (booking, inquiry, recommendation)
# · Entity Recognition: Extracts key information like locations, dates, budgets, and preferences
# · Personalized Responses: Generates context-aware responses based on user queries
# · Multi-functional: Handles hotels, flights, attractions, transportation, and travel planning
#
# -----
# # **Technical Implementation**
#
# **Core Technologies**
#
# · Python with scikit-learn for machine learning
# · NLTK for text processing and tokenization
# · TF-IDF Vectorization for feature extraction
# · Naive Bayes Classifier for intent recognition
# · Rule-based entity extraction for travel-specific information
# · Gradio for user interface
#
# **Model Architecture**
#
# 1. Text preprocessing (tokenization, stopword removal, lemmatization)
# 2. Feature extraction using TF-IDF
# 3. Intent classification with Multinomial Naive Bayes
# 4. Entity recognition using pattern matching and keyword extraction
# 5. Response generation using template-based approach
# ------
#
# # **Project Roadmap**
#
# **Phase 1: Foundation (Completed)**
#
# · Basic intent classification system
# · Entity recognition for common travel concepts
# · Simple response generation
# · Local deployment and testing
#
# **Phase 2: Enhancement (Current)**
#
# · Integration with Hugging Face Spaces for public access
# · Improved entity recognition with spaCy
# · Enhanced response templates
# · Expanded training dataset
#
# **Phase 3: Advanced Features (Future)**
#
# · Integration with real travel APIs (flights, hotels, weather)
# · Multi-language support
# · Voice interface capability
# · Personalization through user profiles
# · Recommendation engine based on user preferences
# · Mobile application development
#
# **Phase 4: Expansion (Future)**
#
# · Group travel planning features
# · Real-time travel alerts and notifications
# · Integration with booking systems
# · AI-powered travel itinerary generation
# · Social features for travel recommendations
#
# -----
#
# # **Experience the Live Demo**
#
# You can interact with the live version of the Smart Travel Assistant here: 🔗https://huggingface.co/spaces/SaraZahran212/smart-travel-assistant
#
# **Try asking questions like:**
#
# · "I want to book a hotel in Dubai for 4 people"
# · "What are the best restaurants in Paris?"
# · "How much does a flight to New York cost?"
# · "I need a visa for Turkey"
# · "What's the weather like in London?"
#
# -----
# # **Technical Challenges & Solutions**
#
# 1. Intent Classification Accuracy
#    · Challenge: Distinguishing between similar travel intents
#    · Solution: Enhanced feature engineering and expanded training data
# 2. Entity Recognition
#    · Challenge: Extracting specific details from user queries
#    · Solution: Combined rule-based and statistical approaches
# 3. Response Generation
#    · Challenge: Creating natural, helpful responses
#    · Solution: Template-based approach with dynamic slot filling
#
# ------
# This project demonstrates the practical application of NLP techniques to solve real-world problems in the travel industry, providing users with an intelligent assistant to simplify travel planning and booking processes.

# %% [markdown]
# # **Environment Setup and Imports**

# %%
# ===== Setup environment in Kaggle =====

# Force reinstall with compatible versions
# !pip install --upgrade --force-reinstall numpy==1.25.2
# !pip install --upgrade --force-reinstall pandas==1.5.3
# !pip install --upgrade --force-reinstall scikit-learn==1.2.2
# !pip install --upgrade --force-reinstall scipy==1.9.3

# Other libraries
# !pip install torch==2.0.1
# !pip install transformers==4.30.2
# !pip install nltk==3.8.1
# !pip install spacy==3.5.3
# !pip install geopy==2.3.0

# Download spaCy English model
# !python -m spacy download en_core_web_sm

# ===== Test all imports =====
import numpy as np
import pandas as pd
import torch
import sklearn
import spacy
import nltk
from transformers import pipeline

print(" NumPy version:", np.__version__)
print(" Pandas version:", pd.__version__)
print(" Torch version:", torch.__version__)
print(" Sklearn version:", sklearn.__version__)
print(" SpaCy version:", spacy.__version__)

# Simple NumPy test
a = np.array([1,2,3])
b = np.array([4,5,6])
print("Sum test:", a+b)

# Simple Torch test
x = torch.tensor([1.0, 2.0])
y = torch.tensor([3.0, 4.0])
print("Torch test:", x+y)

# %%


# ===============================
# Imports
# ===============================
import numpy as np
import pandas as pd
import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import torch
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import spacy
from geopy.geocoders import Nominatim
from datetime import datetime, timedelta
import json
import random

# ===============================
# Download NLTK data
# ===============================
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')
nltk.download('omw-1.4')

# ===============================
# Random seed for reproducibility
# ===============================
np.random.seed(42)
torch.manual_seed(42)

print(" All libraries imported successfully and ready on Kaggle!")

# %% [markdown]
# # **Data Collection and Preparation**

# %%
# Create sample travel-related dataset in English
data = {
    'text': [
        'I want to book a hotel in Cairo',
        'What are the best hotels in Dubai',
        'I am looking for cheap flight tickets to Riyadh',
        'I want to travel to Sharm El Sheikh',
        'How much does a flight ticket to Istanbul cost',
        'I need a visa to enter Saudi Arabia',
        'What are the best restaurants in Dubai',
        'I need to rent a car in Dubai',
        'What are the tourist attractions in Jordan',
        'I want to book a trip to Bahrain',
        'How many days do I need to visit UAE',
        'What is the best time to visit Oman',
        'I need a hotel near the airport',
        'What is the best transportation in Qatar',
        'I am looking for tour guides in Morocco',
        'I want to know the weather in Lebanon',
        'Are there any discounts on flight tickets',
        'I need a hotel with a pool in Turkey',
        'What are the visa requirements',
        'I am looking for special offers for families'
    ],
    'intent': [
        'hotel_booking',
        'hotel_inquiry',
        'flight_booking',
        'trip_planning',
        'flight_inquiry',
        'visa_inquiry',
        'restaurant_inquiry',
        'car_rental',
        'attraction_inquiry',
        'trip_booking',
        'trip_duration',
        'best_time_travel',
        'hotel_nearby',
        'transport_inquiry',
        'tour_inquiry',
        'weather_inquiry',
        'flight_deals',
        'hotel_amenity',
        'visa_requirements',
        'special_offers'
    ]
}

# Create DataFrame
df = pd.DataFrame(data)

# Add more samples for better training
more_data = {
    'text': [
        'I want to visit historical sites in Egypt',
        'How much does accommodation in a five-star hotel cost',
        'How can I get a tour guide',
        'I am looking for child-friendly hotels',
        'What are the transportation options from the airport to the city',
        'I need to rent a yacht in Dubai',
        'What are the best places for photography',
        'I want to book a round-trip ticket',
        'How many days are enough to visit Dubai',
        'What are the best beaches in Saudi Arabia',
        'I am looking for cruises in the Gulf',
        'What are the traditional dishes in UAE',
        'I want to know museum visiting hours',
        'How much does a tour in Egypt cost',
        'What are the best shopping areas in Dubai',
        'I need a hotel with a sea view',
        'What activities are available at night',
        'I am looking for honeymoon offers',
        'What cultural festivals are happening this month',
        'I want to book a room for two people'
    ],
    'intent': [
        'attraction_inquiry',
        'cost_inquiry',
        'guide_inquiry',
        'family_hotel',
        'airport_transport',
        'special_rental',
        'photo_spots',
        'round_trip',
        'trip_duration',
        'attraction_inquiry',
        'cruise_inquiry',
        'food_inquiry',
        'attraction_hours',
        'cost_inquiry',
        'shopping_inquiry',
        'hotel_amenity',
        'activities_inquiry',
        'special_offers',
        'events_inquiry',
        'hotel_booking'
    ]
}

# Append to the DataFrame
more_df = pd.DataFrame(more_data)
df = pd.concat([df, more_df], ignore_index=True)

# Display the dataset
print("Dataset sample:")
print(df.head())
print(f"\nDataset size: {len(df)}")

# %% [markdown]
# # **Text Preprocessing**

# %%
# Initialize lemmatizer
lemmatizer = WordNetLemmatizer()

# English text preprocessing function
def preprocess_english_text(text):
    """
    Preprocess English text by converting to lowercase, removing special characters,
    and lemmatizing words
    """
    # Convert to lowercase
    text = text.lower()
    
    # Remove special characters and digits
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    
    # Tokenize
    tokens = word_tokenize(text)
    
    # Remove stopwords and lemmatize
    stop_words = set(stopwords.words('english'))
    processed_tokens = [lemmatizer.lemmatize(token) for token in tokens if token not in stop_words]
    
    # Join back to string
    processed_text = ' '.join(processed_tokens)
    
    return processed_text

# Apply preprocessing
df['processed_text'] = df['text'].apply(preprocess_english_text)

# Display processed text
print("Original vs Processed Text:")
for i in range(3):
    print(f"Original: {df['text'].iloc[i]}")
    print(f"Processed: {df['processed_text'].iloc[i]}")
    print()

# %% [markdown]
# # **Intent Classification Model**

# %%
# Split the data
X_train, X_test, y_train, y_test = train_test_split(
    df['processed_text'], df['intent'], test_size=0.2, random_state=42
)

# Create a pipeline with TF-IDF and Naive Bayes
text_clf = Pipeline([
    ('tfidf', TfidfVectorizer()),
    ('clf', MultinomialNB()),
])

# Train the model
text_clf.fit(X_train, y_train)

# Evaluate the model
y_pred = text_clf.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Model Accuracy: {accuracy:.2f}")

# Test with a sample query
sample_query = "I want to book a hotel in Dubai"
processed_query = preprocess_english_text(sample_query)
predicted_intent = text_clf.predict([processed_query])[0]
print(f"Query: {sample_query}")
print(f"Predicted Intent: {predicted_intent}")

# %% [markdown]
# # **Entity Recognition**

# %%
# Load spaCy English model
nlp = spacy.load("en_core_web_sm")

# Enhanced entity extraction function
def extract_entities(text):
    """
    Extract entities from English travel queries using spaCy
    """
    entities = {
        'location': [],
        'date': [],
        'budget': [],
        'people': [],
        'amenities': []
    }
    
    # Process text with spaCy
    doc = nlp(text)
    
    # Extract entities
    for ent in doc.ents:
        if ent.label_ == 'GPE' or ent.label_ == 'LOC':  # Geographical entities
            entities['location'].append(ent.text)
        elif ent.label_ == 'DATE':  # Date entities
            entities['date'].append(ent.text)
        elif ent.label_ == 'CARDINAL' or ent.label_ == 'MONEY':  # Numbers and money
            if any(word in text for word in ['dollar', 'price', 'cost', '$']):
                entities['budget'].append(ent.text)
            elif any(word in text for word in ['people', 'person', 'guests']):
                entities['people'].append(ent.text)
    
    # Extract amenities using keyword matching
    amenities_keywords = {
        'pool': ['pool', 'swimming'],
        'wifi': ['wifi', 'internet'],
        'breakfast': ['breakfast'],
        'gym': ['gym', 'fitness'],
        'spa': ['spa'],
        'sea_view': ['sea view', 'ocean view'],
        'airport': ['airport', 'near airport']
    }
    
    for amenity, keywords in amenities_keywords.items():
        if any(keyword in text.lower() for keyword in keywords):
            entities['amenities'].append(amenity)
    
    # Extract number of people using regex patterns
    people_patterns = [
        r'for\s+(\d+)\s+(people|persons|guests)',
        r'(\d+)\s+(people|persons|guests)',
        r'for\s+(a\s+family|family)',
        r'for\s+(two|three|four|five|six|seven|eight|nine|ten)'
    ]
    
    for pattern in people_patterns:
        matches = re.findall(pattern, text.lower())
        for match in matches:
            if isinstance(match, tuple):
                entities['people'].append(' '.join(match))
            else:
                entities['people'].append(match)
    
    # Extract budget information
    budget_patterns = [
        r'\$(\d+)',
        r'(\d+)\s*(dollars|usd)',
        r'budget of\s*(\d+)',
        r'cheap|affordable|expensive|luxury'
    ]
    
    for pattern in budget_patterns:
        matches = re.findall(pattern, text.lower())
        for match in matches:
            if isinstance(match, tuple):
                entities['budget'].append(' '.join(match))
            else:
                entities['budget'].append(match)
    
    return entities

# Test entity extraction
test_query = "I want to book a hotel in Dubai for 3 people with a pool and wifi for $200 per night"
entities = extract_entities(test_query)
print(f"Query: {test_query}")
print("Extracted Entities:")
print(json.dumps(entities, ensure_ascii=False, indent=2))

# %% [markdown]
# # **Response Generation**

# %%
# Create response templates based on intents
response_templates = {
    'hotel_booking': "I'll help you book a hotel in {location} for {people} with a budget of {budget}. I'll make sure it has {amenities}.",
    'hotel_inquiry': "The best hotels in {location} are: 1. Luxury Resort ($$$) 2. Business Hotel ($$) 3. Budget Inn ($). Would you like more details?",
    'flight_booking': "I'll find flight tickets to {location}. When would you like to travel?",
    'trip_planning': "I'll plan a trip to {location} for {date}. What kind of activities are you interested in?",
    'flight_inquiry': "Flight tickets to {location} typically cost between ${budget}. Prices vary based on season.",
    'visa_inquiry': "For visa requirements to {location}, you'll typically need: 1. Passport 2. Application form 3. Photos. Processing takes about {date}.",
    'restaurant_inquiry': "The best restaurants in {location} are: 1. Local Cuisine 2. International Food 3. Seafood Specialties.",
    'car_rental': "Car rental options in {location} start from ${budget} per day. Would you like a compact car or SUV?",
    'attraction_inquiry': "Top attractions in {location} include: 1. Historical Sites 2. Museums 3. Natural Wonders. Would you like more details?",
    'trip_booking': "I'll book a trip to {location} for {people}. What's your preferred travel date?",
    'trip_duration': "The ideal duration to visit {location} is {date}. This allows you to see all major attractions.",
    'best_time_travel': "The best time to visit {location} is during {date} when the weather is pleasant.",
    'hotel_nearby': "Hotels near the airport in {location} include: 1. Airport Hotel 2. Transit Inn 3. QuickStay.",
    'transport_inquiry': "The best transportation options in {location} are: 1. Taxis 2. Public Transit 3. Rental Cars.",
    'tour_inquiry': "Available tours in {location} include: 1. City Sightseeing 2. Cultural Experiences 3. Adventure Activities.",
    'weather_inquiry': "The weather in {location} is currently {date}. The forecast for your travel dates is sunny.",
    'flight_deals': "I found these flight deals to {location}: 1. 30% off on round trips 2. Special weekend fares 3. Early bird discounts.",
    'hotel_amenity': "Hotels in {location} with {amenities} include: 1. Luxury Resort 2. Business Hotel 3. Beachside Villa.",
    'visa_requirements': "Visa requirements for {location} include: 1. Valid passport 2. Completed application 3. Proof of accommodation.",
    'special_offers': "Special offers for {people} to {location} include: 1. Family packages 2. Honeymoon deals 3. Group discounts."
}

def generate_response(intent, entities):
    """
    Generate a response based on intent and extracted entities
    """
    response = response_templates.get(intent, "I'm sorry, I didn't understand your request. Could you please provide more details?")
    
    # Fill in the template with extracted entities
    for entity_type, values in entities.items():
        if values:
            # Use the first value for each entity type
            placeholder = "{" + entity_type + "}"
            if placeholder in response:
                if entity_type == 'amenities' and len(values) > 1:
                    # Format amenities list nicely
                    amenities_str = ', '.join(values[:-1]) + ' and ' + values[-1]
                    response = response.replace(placeholder, amenities_str)
                else:
                    response = response.replace(placeholder, values[0])
    
    # Remove any remaining placeholders
    response = re.sub(r'\{[^}]+\}', 'the destination', response)
    
    return response

# Test response generation
test_intent = "hotel_booking"
test_entities = {
    'location': ['Dubai'],
    'people': ['3 people'],
    'budget': ['$200'],
    'amenities': ['pool', 'wifi']
}

response = generate_response(test_intent, test_entities)
print("Generated Response:")
print(response)


# %% [markdown]
# # **Integration**

# %%
class TravelAssistant:
    def __init__(self):
        self.intent_classifier = text_clf
        self.preprocess_func = preprocess_english_text
        self.entity_extractor = extract_entities
        self.response_generator = generate_response
        
    def process_query(self, query):
        """
        Process a user query and return a response
        """
        # Preprocess the query
        processed_query = self.preprocess_func(query)
        
        # Classify intent
        intent = self.intent_classifier.predict([processed_query])[0]
        
        # Extract entities
        entities = self.entity_extractor(query)
        
        # Generate response
        response = self.response_generator(intent, entities)
        
        return {
            'query': query,
            'intent': intent,
            'entities': entities,
            'response': response
        }

# Initialize the travel assistant
assistant = TravelAssistant()

# Test with sample queries
test_queries = [
    "I want to book a hotel in Dubai for 4 people",
    "What are the best hotels in Cairo",
    "I'm looking for cheap flight tickets to Riyadh",
    "How much does a trip to Istanbul cost for a week"
]

print("Travel Assistant Demo:")
print("=" * 50)

for query in test_queries:
    result = assistant.process_query(query)
    print(f"Query: {query}")
    print(f"Intent: {result['intent']}")
    print(f"Response: {result['response']}")
    print("-" * 50)

# %% [markdown]
# # **Advanced Features with Transformers**

# %%
# Use a pre-trained transformer model for better understanding
try:
    # Load pre-trained sentiment analysis model
    sentiment_analyzer = pipeline(
        'sentiment-analysis',
        model='distilbert-base-uncased-finetuned-sst-2-english'
    )
    
    # Test sentiment analysis
    def analyze_sentiment(text):
        try:
            result = sentiment_analyzer(text)
            return result[0]['label'], result[0]['score']
        except:
            return "NEUTRAL", 0.0
    
    # Test with sample queries
    sample_reviews = [
        "The hotel was amazing and the service was excellent",
        "Very bad, I didn't like the hotel at all",
        "Average experience, nothing special"
    ]
    
    print("Sentiment Analysis:")
    print("=" * 30)
    for review in sample_reviews:
        label, score = analyze_sentiment(review)
        print(f"Review: {review}")
        print(f"Sentiment: {label}, Confidence: {score:.2f}")
        print()
        
except Exception as e:
    print(f"Could not load transformer model: {e}")
    print("Using fallback sentiment analysis")
    
    # Fallback simple sentiment analysis
    def analyze_sentiment(text):
        positive_words = ['good', 'great', 'excellent', 'amazing', 'wonderful']
        negative_words = ['bad', 'terrible', 'awful', 'horrible', 'disappointing']
        
        positive_count = sum(1 for word in positive_words if word in text.lower())
        negative_count = sum(1 for word in negative_words if word in text.lower())
        
        if positive_count > negative_count:
            return "POSITIVE", 0.8
        elif negative_count > positive_count:
            return "NEGATIVE", 0.8
        else:
            return "NEUTRAL", 0.5
    
    # Test with sample queries
    sample_reviews = [
        "The hotel was amazing and the service was excellent",
        "Very bad, I didn't like the hotel at all",
        "Average experience, nothing special"
    ]
    
    print("Sentiment Analysis (Fallback):")
    print("=" * 40)
    for review in sample_reviews:
        label, score = analyze_sentiment(review)
        print(f"Review: {review}")
        print(f"Sentiment: {label}, Confidence: {score:.2f}")
        print()

# %% [markdown]
# # **Saving and Loading the Model**

# %%
# Save the model for future use
import joblib

# Save the intent classification model
joblib.dump(text_clf, 'travel_intent_classifier.joblib')

print("Model saved successfully")

# Load the model (for demonstration)
try:
    loaded_model = joblib.load('travel_intent_classifier.joblib')
    test_query = "I want to book a hotel"
    processed_test = preprocess_english_text(test_query)
    prediction = loaded_model.predict([processed_test])
    print(f"Test query: {test_query}")
    print(f"Predicted intent: {prediction[0]}")
except Exception as e:
    print(f"Error loading model: {e}")


# %% [markdown]
# # **Complete Example Usage**

# %%
# Final demonstration of the travel assistant
def demo_travel_assistant():
    assistant = TravelAssistant()
    
    print("Welcome to the Smart Travel Assistant!")
    print("You can ask about hotel bookings, flights, and travel inquiries.")
    print("=" * 60)
    
    sample_queries = [
        "I want to book a hotel in Paris",
        "Find me a flight to New York",
        "What’s the best travel insurance?",
        "exit"
    ]
    
    for user_input in sample_queries:
        print(f"You: {user_input}")
        if user_input.lower() in ['exit', 'quit', 'bye']:
            print("Travel Assistant: Thank you for using the Travel Assistant. Have a great trip!")
            break
        
        result = assistant.process_query(user_input)
        print(f"Travel Assistant: {result['response']}")
        print()
        
# Run the demo
demo_travel_assistant()


# %% [markdown]
# # **Additional Utility Functions**

# %%
# Additional utility functions for a more comprehensive travel assistant
def get_current_weather(location):
    """Mock function to get weather information"""
    # In a real implementation, this would connect to a weather API
    weather_conditions = ["sunny", "cloudy", "rainy", "windy"]
    temperatures = {
        "Dubai": "35°C",
        "Cairo": "28°C",
        "Istanbul": "22°C",
        "Riyadh": "38°C",
        "default": "25°C"
    }
    
    condition = random.choice(weather_conditions)
    temperature = temperatures.get(location, temperatures["default"])
    
    return f"The weather in {location} is currently {condition} with a temperature of {temperature}."

def get_flight_prices(origin, destination):
    """Mock function to get flight prices"""
    # In a real implementation, this would connect to a flight API
    prices = {
        ("New York", "Dubai"): "$850",
        ("London", "Dubai"): "$600",
        ("Paris", "Dubai"): "$550",
        ("default"): "$700"
    }
    
    price = prices.get((origin, destination), prices["default"])
    return f"Flight from {origin} to {destination} starts from {price}."

# Add these utilities to the Travel Assistant class
class EnhancedTravelAssistant(TravelAssistant):
    def _init_(self):
        super()._init_()
        
    def process_query(self, query):
        result = super().process_query(query)
        
        # Enhance with additional utilities based on intent
        if 'weather' in result['intent'] and result['entities']['location']:
            location = result['entities']['location'][0]
            weather_info = get_current_weather(location)
            result['response'] += f" By the way, {weather_info}"
            
        elif 'flight' in result['intent'] and result['entities']['location']:
            # Mock origin - in a real app, this would be extracted or provided by user
            origin = "New York"
            destination = result['entities']['location'][0]
            flight_info = get_flight_prices(origin, destination)
            result['response'] += f" {flight_info}"
            
        return result

# Test the enhanced assistant
print("Enhanced Travel Assistant Demo:")
print("=" * 40)
enhanced_assistant = EnhancedTravelAssistant()
test_queries = [
    "What's the weather in Dubai?",
    "I need flight tickets to Istanbul"
]

for query in test_queries:
    result = enhanced_assistant.process_query(query)
    print(f"Query: {query}")
    print(f"Response: {result['response']}")
    print("-" * 50)
