terraform {
  required_providers {
    aws = {
      version = ">= 4.0.0"
      source  = "hashicorp/aws"
    }
  }
}

provider "aws" {
  region = "ca-central-1"
}

resource "aws_s3_bucket" "lambda" {}

# two lambda functions w/ function url
# one dynamodb table
# roles and policies as needed
# step functions (if you're going for the bonus marks)

locals {
  lambda_handler = "main.lambda_handler"
  get_name = "get-obituaries-30139961"
  create_name = "create-obituary-30139961"
}

resource "aws_iam_role" "get-lambda" {
  name                = "iam-for-lambda-${local.get_name}"
  assume_role_policy  = <<EOF
  {
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
  }
EOF
}

resource "aws_iam_role" "create-lambda" {
  name                = "iam-for-lambda-${local.create_name}"
  assume_role_policy  = <<EOF
  {
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
  }
EOF
}


resource "aws_iam_policy" "dynamo" {
  name = "obituary_dynamo"
  description = "Interaction with lambda and dynamo"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:BatchGetItem",
				"dynamodb:GetItem",
				"dynamodb:Query",
				"dynamodb:Scan",
				"dynamodb:BatchWriteItem",
				"dynamodb:PutItem",
				"dynamodb:UpdateItem",
        "dynamodb:DeleteItem"
      ],
      "Resource": "arn:aws:dynamodb:ca-central-1:455720929055:table/obituaries-30145805"
    }
  ]
}
EOF
}

resource "aws_iam_policy" "logs" {
  name        = "obituary-logging"
  description = "IAM policy for logging from a lambda"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*",
      "Effect": "Allow"
    }
  ]
}
EOF
}

resource "aws_iam_policy" "ssm" {
  name        = "ssm-lambda"
  description = "For accessing ssm parameters"

  policy = <<EOF
{
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Effect" : "Allow",
        "Action" : [
          "ssm:GetParameter",
          "ssm:GetParameters",
          "ssm:GetParametersByPath"
        ],
        "Resource" : "*"
      }
    ]
  }
  EOF
}

resource "aws_lambda_function" "get-obituaries-30139961" {
  s3_bucket     = aws_s3_bucket.lambda.bucket
  s3_key        = "get-obituaries/get-obituaries.zip"
  role          = aws_iam_role.get-lambda.arn
  function_name = local.get_name
  handler       = local.lambda_handler


  runtime = "python3.7"
}

resource "aws_lambda_function" "create-obituary-30139961" {
  s3_bucket     = aws_s3_bucket.lambda.bucket
  s3_key        = "create-obituary/create-obituary.zip"
  role          = aws_iam_role.create-lambda.arn
  function_name = local.create_name
  handler       = local.lambda_handler
  timeout       = 300


  runtime = "python3.7"
}

resource "aws_dynamodb_table" "obituaries-30145805" {
  name           = "obituaries-30145805"
  billing_mode   = "PROVISIONED"
  read_capacity  = 1
  write_capacity = 1

  attribute {
    name = "id"
    type = "S"
  }

  hash_key       = "id"

}


resource "aws_iam_role_policy_attachment" "get-lambda_logs" {
  role       = aws_iam_role.get-lambda.name
  policy_arn = aws_iam_policy.logs.arn
}

resource "aws_iam_role_policy_attachment" "create-lambda_logs" {
  role       = aws_iam_role.create-lambda.name
  policy_arn = aws_iam_policy.logs.arn
}

resource "aws_iam_role_policy_attachment" "create-lambda_dynamo" {
  role       = aws_iam_role.create-lambda.name
  policy_arn = aws_iam_policy.dynamo.arn
}

resource "aws_iam_role_policy_attachment" "get-lambda_dynamo" {
  role       = aws_iam_role.get-lambda.name
  policy_arn = aws_iam_policy.dynamo.arn
}

resource "aws_iam_role_policy_attachment" "create-lambda_ssm" {
  role       = aws_iam_role.create-lambda.name
  policy_arn = aws_iam_policy.ssm.arn
}

resource "aws_iam_role_policy_attachment" "create-lambda_polly" {
  role       = aws_iam_role.create-lambda.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonPollyFullAccess"
}


resource "aws_lambda_function_url" "get-url" {
  function_name      = aws_lambda_function.get-obituaries-30139961.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["GET"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
  }
}

resource "aws_lambda_function_url" "create-url" {
  function_name      = aws_lambda_function.create-obituary-30139961.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["POST"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
  }
}


output "bucket_name" {
  value = aws_s3_bucket.lambda.bucket
}

output "create-lambda_url" {
  value = aws_lambda_function_url.create-url.function_url
}

output "get-lambda_url" {
  value = aws_lambda_function_url.get-url.function_url
}