import json
import requests
from requests_toolbelt import MultipartEncoder
# add your get-obituaries function here
# Set the AWS endpoint URL
aws_endpoint_url = 'https://dynamodb.ca-central-1.amazonaws.com'
table_name = 'obituaries-30145805'

def get_obituaries(event):
    # Extract the email and access token from the event
    query = event['queryStringParameters']

    # Query the DynamoDB table to get the obituaries for the specified email
    payload = {'TableName': table_name}
    response = requests.post(f'{aws_endpoint_url}/', json=payload)
    if response.status_code != 200:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': 'Error getting obituaries'})
        }

    # Extract the obituaries from the DynamoDB response
    obituaries = []
    for item in response.json()['Items']:
        obituaries.append({'name': item['name']['S'], 'date_of_birth': item['date_of_birth']['S'], 'date_of_death': item['date_of_death']['S']})

    # Return the obituaries as a JSON response
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json'
        },
        'body': json.dumps(obituaries)
    }