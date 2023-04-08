import json
import requests
import boto3
from requests_toolbelt import MultipartEncoder
# add your get-obituaries function here
# Set the AWS endpoint URL
dynamodb_resource = boto3.resource("dynamodb")
table = dynamodb_resource.Table("obituaries-30145805")
aws_endpoint_url = 'https://dynamodb.ca-central-1.amazonaws.com'

def lambda_handler(event, context):

    http_method = event["requestContext"]["http"]["method"].lower()
    if http_method == "get":
        # Query the DynamoDB table to get the obituaries for the specified email
        response = table.scan()

        # Return the obituaries as a JSON response
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json'
            },
            'body': json.dumps(response['Items'])
        }
    
    else:
        # Return a 404 error if the request was not a get
        return {
            "statusCode": 404,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": json.dumps({
                "error": "Item not found"
            })
    }