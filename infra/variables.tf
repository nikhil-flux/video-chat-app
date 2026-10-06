variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "instance_type" {
  type    = string
  default = "t3.micro"
}

variable "repo_url" {
  type    = string
  default = "https://github.com/nikhil-flux/video-chat-app"
}

variable "runner_token" {
  type      = string
  sensitive = true
}

variable "runner_labels" {
  type    = string
  default = "aws"
}

variable "ssh_cidr" {
  type    = string
  default = ""
}

variable "key_name" {
  type    = string
  default = ""
}