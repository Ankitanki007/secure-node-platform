resource "aws_vpc" "main" {
  cidr_block           = "10.20.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name        = "secure-node-dev-vpc"
    Project     = "secure-node-platform"
    Environment = "dev"
    ManagedBy   = "Terraform"
  }
}

output "vpc_id" {
  description = "ID of the project VPC"
  value       = aws_vpc.main.id
}
