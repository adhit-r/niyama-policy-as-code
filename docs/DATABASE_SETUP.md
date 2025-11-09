# Database Setup Guide

This guide covers setting up PostgreSQL for the Niyama platform, including both local development and cloud deployment options.

## 🚀 Quick Start

### Option 1: Cloud Database (Recommended for Production)

#### Neon (Recommended)
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Update your `.env` file:

```bash
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
DB_HOST=your-neon-host.com
DB_PORT=5432
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=your-database
DB_SSL_MODE=require
```

#### Supabase
1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string
5. Update your `.env` file with the connection details

#### Railway
1. Sign up at [railway.app](https://railway.app)
2. Create a new PostgreSQL service
3. Copy the connection string
4. Update your `.env` file

#### AWS RDS
1. Create an RDS PostgreSQL instance
2. Configure security groups
3. Get the connection details
4. Update your `.env` file

### Option 2: Local Development

#### Using Docker
```bash
# Start PostgreSQL with Docker
docker run --name niyama-postgres \
  -e POSTGRES_DB=niyama \
  -e POSTGRES_USER=niyama \
  -e POSTGRES_PASSWORD=niyama \
  -p 5432:5432 \
  -d postgres:15
```

#### Using Homebrew (macOS)
```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL
brew services start postgresql@15

# Create database
createdb niyama
```

## 🔧 Database Setup

### 1. Configure Environment Variables

Copy the example environment file:
```bash
cp env.example .env
```

Update the database configuration in `.env`:
```bash
# For cloud database
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
DB_HOST=your-cloud-host.com
DB_PORT=5432
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=your-database
DB_SSL_MODE=require

# For local development
DATABASE_URL=postgresql://niyama:niyama@localhost:5432/niyama
DB_HOST=localhost
DB_PORT=5432
DB_USER=niyama
DB_PASSWORD=niyama
DB_NAME=niyama
DB_SSL_MODE=disable
```

### 2. Run Database Migrations

```bash
cd backend-go
go run main.go -migrate
```

### 3. Seed Initial Data

```bash
cd backend-go
go run main.go -seed
```

### 4. Start the Backend

```bash
cd backend-go
go run main.go
```

## 📊 Database Schema

The Niyama platform uses the following main entities:

### Core Entities
- **Users**: System users with global roles
- **Organizations**: Multi-tenant organizations
- **UserOrganizationRole**: User roles within organizations
- **Policies**: Policy as Code definitions
- **PolicyTemplates**: Reusable policy templates
- **PolicyEvaluations**: Policy execution results

### Compliance Entities
- **ComplianceFrameworks**: SOC2, HIPAA, GDPR, etc.
- **ComplianceControls**: Individual compliance controls
- **PolicyComplianceMapping**: Policy-to-control mappings
- **ComplianceReports**: Generated compliance reports

## 🔒 Security Considerations

### Production Security
1. **Use SSL/TLS**: Always use `sslmode=require` in production
2. **Strong Passwords**: Use complex, unique passwords
3. **Connection Pooling**: Configure appropriate connection limits
4. **Network Security**: Use VPCs and security groups
5. **Backup Strategy**: Implement regular backups
6. **Monitoring**: Set up database monitoring and alerts

### Environment Variables
```bash
# Production settings
DB_MAX_CONNS=25
DB_MIN_CONNS=5
DB_SSL_MODE=require
```

## 🚀 Cloud Database Providers

### Neon (Recommended)
- **Pros**: Serverless, auto-scaling, great for development
- **Pricing**: Generous free tier, pay-as-you-scale
- **Setup**: 5 minutes
- **Best for**: Development and small production

### Supabase
- **Pros**: Full-stack platform, real-time features
- **Pricing**: Free tier available, reasonable pricing
- **Setup**: 10 minutes
- **Best for**: Full-stack applications

### Railway
- **Pros**: Simple deployment, good for startups
- **Pricing**: Usage-based pricing
- **Setup**: 5 minutes
- **Best for**: Rapid prototyping

### AWS RDS
- **Pros**: Enterprise-grade, highly available
- **Pricing**: More expensive but feature-rich
- **Setup**: 30 minutes
- **Best for**: Enterprise production

## 🔧 Troubleshooting

### Connection Issues
```bash
# Test database connection
psql $DATABASE_URL

# Check if database is running
pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER
```

### Migration Issues
```bash
# Reset database (development only)
dropdb niyama
createdb niyama
go run main.go -migrate
go run main.go -seed
```

### Performance Issues
```bash
# Check connection pool settings
echo $DB_MAX_CONNS
echo $DB_MIN_CONNS

# Monitor database connections
SELECT * FROM pg_stat_activity;
```

## 📈 Monitoring

### Database Metrics to Monitor
- Connection count
- Query performance
- Storage usage
- Backup status
- SSL certificate expiry

### Recommended Tools
- **Neon**: Built-in monitoring dashboard
- **Supabase**: Built-in analytics
- **AWS RDS**: CloudWatch metrics
- **Custom**: Prometheus + Grafana

## 🎯 Next Steps

1. **Set up monitoring** for your database
2. **Configure backups** for production
3. **Set up connection pooling** for high traffic
4. **Implement database migrations** in CI/CD
5. **Set up database alerts** for issues

---

**Need help?** Check the [troubleshooting guide](TROUBLESHOOTING.md) or open an issue on GitHub.

