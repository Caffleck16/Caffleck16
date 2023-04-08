import boto3
import json
import requests
import requests_toolbelt.multipart as multipart
import base64
from boto3.session import Session
from botocore.exceptions import BotoCoreError, ClientError

ssm = boto3.client('ssm')
response = ssm.get_parameters(
    Names=[
        'chatgpt_api_key',
        'cloudinary_api_key',
        'accessKey',
        'secretAccessKey'
    ],
    WithDecryption=True
)

params = response['Parameters']

chatgpt_api_key = next(p['Value'] for p in params if p['Name'] == 'chatgpt_api_key')
cloudinary_api_key = next(p['Value'] for p in params if p['Name'] == 'cloudinary_api_key')
aws_access_key_id = next(p['Value'] for p in params if p['Name'] == 'accessKey')
aws_secret_access_key = next(p['Value'] for p in params if p['Name'] == 'secretAccessKey')
region_name = 'ca-central-1'

polly_client = boto3.client('polly')

def lambda_handler(event, context):
    try:
        # read the data from the request body
        data = multipart.decoder.MultipartDecoder(event['body'], event['headers']['Content-Type']).parts[0]
        decoded_data = base64.b64decode(data.content).decode('utf-8')
        print(decoded_data)
        obituary_data = json.loads(decoded_data)
        print(obituary_data)

        # parse the obituary data
        name = obituary_data['name']
        born_year = obituary_data['born_year']
        died_year = obituary_data['died_year']
        image_url = obituary_data['image_url']

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
        chatgpt_response = requests.post(chatgpt_url, headers=chatgpt_headers, json=chatgpt_data)
        chatgpt_obituary = chatgpt_response.json()['choices'][0]['text']
        
        # convert the obituary text to speech using Amazon Polly
        response = polly_client.synthesize_speech(VoiceId='Joanna', OutputFormat='mp3', Text=chatgpt_obituary)
        audio_stream = response['AudioStream'].read()

        # upload the audio to Cloudinary
        cloudinary_url = 'https://api.cloudinary.com/v1_1/deiepuv9m/video/upload'
        cloudinary_params = {
            'api_key': cloudinary_api_key,
            'upload_preset': 'obituaries_preset',
            'e_art:zorro': '',
            'resource_type': 'video'
        }
        cloudinary_headers = {
            'Content-Type': 'application/octet-stream',
            'X-Requested-With': 'XMLHttpRequest'
        }
        session = Session(aws_access_key_id=aws_access_key_id, aws_secret_access_key=aws_secret_access_key, region_name=region_name)
        s3 = session.client('s3')
        # save audio file to S3
        s3.upload_fileobj(response['AudioStream'], 'terraform-20230407223808852200000001')
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
        cloudinary_signature = ssm.get_parameter(Name='/cloudinary_signature', WithDecryption=True)['Parameter']['Value']
        cloudinary_payload = {
            "file": (name + '.mp3', speech_content, 'audio/mp3'),
            "upload_preset": "obituaries",
            "signature": cloudinary_signature
        }
        cloudinary_response = requests.post(cloudinary_url, files=cloudinary_payload)

        # get the public URL of the uploaded speech mp3 file
        speech_url = cloudinary_response.json()['secure_url']

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
