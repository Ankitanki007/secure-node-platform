locals {
  project_name = "secure-node"
  environment  = "dev"

  common_tags = {
    Project     = "secure-node-platform"
    Environment = local.environment
    ManagedBy   = "Terraform"
  }

  # Select two available Availability Zones.
  selected_azs = slice(
    sort(data.aws_availability_zones.available.names),
    0,
    2
  )

  # Stable keys keep Terraform resource addresses predictable.
  subnet_layout = {
    a = {
      az           = local.selected_azs[0]
      public_cidr  = "10.20.1.0/24"
      private_cidr = "10.20.11.0/24"
    }
    b = {
      az           = local.selected_azs[1]
      public_cidr  = "10.20.2.0/24"
      private_cidr = "10.20.12.0/24"
    }
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = merge(local.common_tags, {
    Name = "${local.project_name}-dev-igw"
  })
}

resource "aws_subnet" "public" {
  for_each = local.subnet_layout

  vpc_id                  = aws_vpc.main.id
  cidr_block              = each.value.public_cidr
  availability_zone       = each.value.az
  map_public_ip_on_launch = false

  tags = merge(local.common_tags, {
    Name = "${local.project_name}-dev-public-${each.key}"
  })
}

resource "aws_subnet" "private" {
  for_each = local.subnet_layout

  vpc_id                  = aws_vpc.main.id
  cidr_block              = each.value.private_cidr
  availability_zone       = each.value.az
  map_public_ip_on_launch = false

  tags = merge(local.common_tags, {
    Name = "${local.project_name}-dev-private-${each.key}"
  })
}

resource "aws_eip" "nat" {
  domain = "vpc"

  tags = merge(local.common_tags, {
    Name = "${local.project_name}-dev-nat-ip"
  })
}

resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public["a"].id

  depends_on = [aws_internet_gateway.main]

  tags = merge(local.common_tags, {
    Name = "${local.project_name}-dev-nat"
  })
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = merge(local.common_tags, {
    Name = "${local.project_name}-dev-public-routes"
  })
}

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main.id
  }

  tags = merge(local.common_tags, {
    Name = "${local.project_name}-dev-private-routes"
  })
}

resource "aws_route_table_association" "public" {
  for_each = local.subnet_layout

  subnet_id      = aws_subnet.public[each.key].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  for_each = local.subnet_layout

  subnet_id      = aws_subnet.private[each.key].id
  route_table_id = aws_route_table.private.id
}
