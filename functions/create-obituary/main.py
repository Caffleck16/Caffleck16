import boto3
import json
import requests
from requests_toolbelt.multipart import decoder
import base64
from boto3.session import Session
import os
import hmac
import time
import hashlib

ssm = boto3.client('ssm')
response = ssm.get_parameters(
    Names=[
        'chatgpt_api_key',
        'cloudinary_api_key',
        'cloudinary_secret_key',
        'accessKey',
        'secretAccessKey'
    ],
    WithDecryption=True
)

params = response['Parameters']

chatgpt_api_key = next(p['Value'] for p in params if p['Name'] == 'chatgpt_api_key')
cloudinary_api_key = next(p['Value'] for p in params if p['Name'] == 'cloudinary_api_key')
cloudinary_secret_key = next(p['Value'] for p in params if p['Name'] == 'cloudinary_secret_key')
aws_access_key_id = next(p['Value'] for p in params if p['Name'] == 'accessKey')
aws_secret_access_key = next(p['Value'] for p in params if p['Name'] == 'secretAccessKey')
region_name = 'ca-central-1'

polly_client = boto3.client('polly')

def generate_cloudinary_signature(params):
    sorted_params = sorted(params.items())
    to_sign = '&'.join(['='.join(kv) for kv in sorted_params])
    to_sign += cloudinary_secret_key
    signature = hmac.new(cloudinary_secret_key.encode('utf-8'), to_sign.encode('utf-8'), hashlib.sha256).hexdigest()
    return signature

def lambda_handler(event, context):
    try:
        # read the data from the request body
        body = event['body']
        if event['isBase64Encoded']:
            body = base64.b64decode(body)
        content_type = event["headers"]["Content-Type"]
        data = decoder.MultipartDecoder(body, content_type)
        obituary_data = [part.content for part in data.parts]
        print(obituary_data)

        # parse the obituary data
        name = obituary_data[1].decode()
        born_year = obituary_data[2].decode()
        died_year = obituary_data[3].decode()
        key = name + ".png"
        file_name = os.path.join("/tmp", key)
        with open(key, "wb") as f:
                f.write(obituary_data[0])

        # generate the obituary text using ChatGPT
        chatgpt_url = 'https://api.openai.com/v1/completions'
        chatgpt_prompt = f'write an obituary about a fictional character named {name} who was born on {born_year} and died on {died_year}.'
        chatgpt_data = {
            "prompt": chatgpt_prompt,
            "max_tokens": 600,
            "model": "text-curie-001"
        }
        chatgpt_headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {chatgpt_api_key}"
        }
        chatgpt_response = requests.post(chatgpt_url, data=json.dumps(chatgpt_data), headers=chatgpt_headers)
        chatgpt_obituary = chatgpt_response.json()['choices'][0]['text'].strip()

        # convert the obituary text to speech using Amazon Polly
        polly = boto3.client('polly')
        speech_response = polly.synthesize_speech(
            Text=chatgpt_obituary,
            OutputFormat='mp3',
            VoiceId='Joanna'
        )
        speech_content = speech_response['AudioStream'].read()

        # upload the speech mp3 file to Cloudinary
        cloudinary_url = f"https://api.cloudinary.com/v1_1/{cloudinary_api_key}/upload"
        cloudinary_signature = generate_cloudinary_signature({"public_id" : name, "timestamp" : str(int(time.time()))})
        cloudinary_payload = {
            "file": (name + '.mp3', speech_content, 'audio/mp3'),
            "upload_preset": "obituaries",
            "signature": cloudinary_signature
        }
        cloudinary_audio_response = requests.post(cloudinary_url, files=cloudinary_payload)

        # Upload image to cloudinary
        with open(key, "rb") as f:
            cloudinary_payload = {
                "file": (file_name, f),
                "upload_preset": "obituaries",
                "signature": cloudinary_signature
            }
        cloudinary_image_response = requests.post(cloudinary_url, files=cloudinary_payload)
        image_url = cloudinary_image_response.json()['secure_url']

        # get the public URL of the uploaded speech mp3 file
        speech_url = cloudinary_audio_response.json()['secure_url']

        # add the e_art:zorro enhancement to the image URL
        image_url = image_url.replace('/upload/', '/upload/e_art:zorro/')
        
        # create a new item in the DynamoDB table
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table('obituaries-30145805')
        table.put_item(
            Item={
                'name': name,
                'born_year': born_year,
                'died_year': died_year,
                'obituary': chatgpt_obituary,
                'speech_url': speech_url,
                'image_url': image_url
            }
        )

        # return a success response
        response_body = {
            "message": "Obituary created successfully"
        }
        response = {
            "statusCode": 200,
            "body": json.dumps(response_body),
            "headers": {
                "Content-Type": "application/json"
            }
        }
        return response

    except Exception as e:
        # return an error response
        response_body = {
            "message": "Error creating obituary",
            "error": str(e)
        }
        response = {
            "statusCode": 500,
            "body": json.dumps(response_body),
            "headers": {
                "Content-Type": "application/json"
            }
        }
        return response
