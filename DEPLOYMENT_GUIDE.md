# LSREMS Deployment Guide

Complete guide for deploying the Land Surveying & Real Estate Management System.

## 🎯 Quick Start (Development)

### Backend Setup

```bash
# 1. Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set environment variable for SQLite
export USE_SQLITE=True  # Windows: set USE_SQLITE=True

# 4. Run migrations
python manage.py makemigrations
python manage.py migrate

# 5. Create superuser
python manage.py createsuperuser

# 6. Run server
python manage.py runserver
```

Backend will be available at `http://localhost:8000`

### Frontend Setup

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

## 📦 Production Deployment

### Option 1: DigitalOcean Droplet

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and PostgreSQL
sudo apt install python3-pip python3-venv postgresql postgresql-contrib nginx -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

#### 2. Database Setup

```bash
# Create database
sudo -u postgres psql
CREATE DATABASE lsrems_db;
CREATE USER lsrems_user WITH PASSWORD 'your_secure_password';
ALTER ROLE lsrems_user SET client_encoding TO 'utf8';
ALTER ROLE lsrems_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE lsrems_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE lsrems_db TO lsrems_user;
\q
```

#### 3. Backend Deployment

```bash
# Clone repository
git clone <your-repo-url>
cd lsrems

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install gunicorn

# Configure environment
cp .env.example .env
nano .env  # Edit with production values

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Create superuser
python manage.py createsuperuser
```

#### 4. Gunicorn Setup

Create `/etc/systemd/system/lsrems.service`:

```ini
[Unit]
Description=LSREMS Gunicorn daemon
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/path/to/lsrems
Environment="PATH=/path/to/lsrems/venv/bin"
ExecStart=/path/to/lsrems/venv/bin/gunicorn \
          --workers 3 \
          --bind unix:/path/to/lsrems/lsrems.sock \
          lsrems_backend.wsgi:application

[Install]
WantedBy=multi-user.target
```

```bash
# Start and enable service
sudo systemctl start lsrems
sudo systemctl enable lsrems
```

#### 5. Nginx Configuration

Create `/etc/nginx/sites-available/lsrems`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Backend API
    location /api/ {
        proxy_pass http://unix:/path/to/lsrems/lsrems.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Admin panel
    location /admin/ {
        proxy_pass http://unix:/path/to/lsrems/lsrems.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Static files
    location /static/ {
        alias /path/to/lsrems/staticfiles/;
    }

    # Media files
    location /media/ {
        alias /path/to/lsrems/media/;
    }

    # Frontend
    location / {
        root /path/to/lsrems/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/lsrems /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. Frontend Build

```bash
cd frontend
npm install
npm run build
```

#### 7. SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

### Option 2: Heroku Deployment

#### 1. Prepare for Heroku

Create `Procfile`:
```
web: gunicorn lsrems_backend.wsgi
release: python manage.py migrate
```

Create `runtime.txt`:
```
python-3.11.4
```

Update `requirements.txt`:
```bash
pip freeze > requirements.txt
```

#### 2. Deploy

```bash
# Login to Heroku
heroku login

# Create app
heroku create lsrems-app

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set DEBUG=False
heroku config:set SECRET_KEY=your-secret-key

# Deploy
git push heroku main

# Run migrations
heroku run python manage.py migrate

# Create superuser
heroku run python manage.py createsuperuser
```

### Option 3: Docker Deployment

#### 1. Create Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Run gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "lsrems_backend.wsgi:application"]
```

#### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: lsrems_db
      POSTGRES_USER: lsrems_user
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: .
    command: gunicorn lsrems_backend.wsgi:application --bind 0.0.0.0:8000
    volumes:
      - ./media:/app/media
      - ./staticfiles:/app/staticfiles
    ports:
      - "8000:8000"
    depends_on:
      - db
    environment:
      - DEBUG=False
      - DATABASE_URL=postgresql://lsrems_user:secure_password@db:5432/lsrems_db

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./frontend/dist:/usr/share/nginx/html
      - ./staticfiles:/usr/share/nginx/html/static
      - ./media:/usr/share/nginx/html/media
    depends_on:
      - backend

volumes:
  postgres_data:
```

#### 3. Deploy

```bash
docker-compose up -d
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

## 🔒 Security Checklist

- [ ] Change `SECRET_KEY` to a strong random value
- [ ] Set `DEBUG=False` in production
- [ ] Configure `ALLOWED_HOSTS` properly
- [ ] Use HTTPS (SSL certificate)
- [ ] Enable CSRF protection
- [ ] Configure secure password validators
- [ ] Set up database backups
- [ ] Use environment variables for sensitive data
- [ ] Configure proper CORS settings
- [ ] Set up firewall rules
- [ ] Enable rate limiting
- [ ] Configure logging and monitoring

## 📊 Monitoring & Maintenance

### Database Backups

```bash
# Backup
pg_dump lsrems_db > backup_$(date +%Y%m%d).sql

# Restore
psql lsrems_db < backup_20260310.sql
```

### Log Monitoring

```bash
# View Gunicorn logs
sudo journalctl -u lsrems -f

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Performance Optimization

1. **Database Indexing**
   - Add indexes to frequently queried fields
   - Use `select_related()` and `prefetch_related()`

2. **Caching**
   - Install Redis: `pip install django-redis`
   - Configure caching in settings

3. **Static Files**
   - Use CDN for static files
   - Enable gzip compression

## 🔄 Updates & Migrations

```bash
# Pull latest code
git pull origin main

# Activate virtual environment
source venv/bin/activate

# Install new dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Restart services
sudo systemctl restart lsrems
sudo systemctl restart nginx
```

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -U lsrems_user -d lsrems_db -h localhost
```

### Permission Issues
```bash
# Fix media directory permissions
sudo chown -R www-data:www-data /path/to/lsrems/media
sudo chmod -R 755 /path/to/lsrems/media
```

### Gunicorn Not Starting
```bash
# Check logs
sudo journalctl -u lsrems -n 50

# Test manually
cd /path/to/lsrems
source venv/bin/activate
gunicorn lsrems_backend.wsgi:application
```

## 📞 Support

For issues and questions, refer to:
- Backend README: `BACKEND_README.md`
- Frontend README: `frontend/README.md`
- Setup Instructions: `SETUP_INSTRUCTIONS.md`
