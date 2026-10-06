terraform {
  required_version = ">= 1.3"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Latest Ubuntu 22.04 LTS AMI published by Canonical
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

data "aws_vpc" "default" {
  default = true
}

# No inbound rules by default. SSH opens only if you set ssh_cidr.
resource "aws_security_group" "runner" {
  name_prefix = "video-chat-runner-"
  description = "Self-hosted GitHub runner: outbound only, optional SSH"
  vpc_id      = data.aws_vpc.default.id

  dynamic "ingress" {
    for_each = var.ssh_cidr == "" ? [] : [var.ssh_cidr]
    content {
      description = "SSH from my IP"
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = [ingress.value]
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "runner" {
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = var.instance_type
  key_name                    = var.key_name == "" ? null : var.key_name
  vpc_security_group_ids      = [aws_security_group.runner.id]
  associate_public_ip_address = true

  user_data = templatefile("${path.module}/user_data.sh.tpl", {
    repo_url      = var.repo_url
    runner_token  = var.runner_token
    runner_labels = var.runner_labels
  })

  metadata_options {
    http_tokens = "required"
  }

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
    encrypted   = true
  }

  tags = {
    Name = "video-chat-runner"
  }

  lifecycle {
    ignore_changes = [user_data]
  }
}