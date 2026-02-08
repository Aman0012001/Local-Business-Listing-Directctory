output "public_ip" {
  description = "Public IP of the server"
  value       = aws_eip.app_eip.public_ip
}

output "instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.app_server.id
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}
