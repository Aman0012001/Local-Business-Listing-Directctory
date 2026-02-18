variable "aws_region" {
  description = "AWS region"
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name"
  default     = "aura"
}

variable "environment" {
  description = "Deployment environment"
  default     = "production"
}

variable "instance_type" {
  description = "EC2 instance type"
  default     = "t3.medium"
}

variable "ami_id" {
  description = "Ubuntu 22.04 AMI ID (Check for your region)"
}

variable "ssh_key_name" {
  description = "Name of the existing AWS SSH key pair"
}

variable "allowed_ssh_ips" {
  description = "List of allowed IPs for SSH access"
  type        = list(string)
  default     = ["0.0.0.0/0"] # Recommendation: Change to your specific IP
}
