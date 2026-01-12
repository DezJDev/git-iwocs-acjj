# 🎮 Lodle - League of Legends Champion Guessing Game

A web-based guessing game inspired by Wordle, where players try to guess League of Legends champions based on their attributes. Built with Vue.js, Node.js/Express, PostgreSQL (AWS RDS), and Docker.

## 📋 Features

- **Infinite Play Mode**: Play as many times as you want (no daily limit)
- **Smart Matching System**: Get visual feedback on matching attributes:
  - ✅ Green: Correct match
  - ❌ Red: Incorrect match
  - 📅 Year arrows: Shows if target champion is newer/older
- **Autocomplete Search**: Quick champion selection with search filtering
- **Responsive Design**: Works on desktop and mobile
- **Stats Tracking**: Track your games played

## 🏗️ Architecture

```
┌─────────────┐      ┌─────────────┐      ┌──────────────┐
│   Vue.js    │─────▶│  Express    │─────▶│  PostgreSQL  │
│  Frontend   │      │   Backend   │      │   AWS RDS    │
│  (Port 5173)│◀─────│ (Port 3000) │◀─────│              │
└─────────────┘      └─────────────┘      └──────────────┘
      │                                            │
      │                                            │
      └────────────────┐              ┌────────────┘
                       ▼              ▼
                    ┌──────────────────┐
                    │   AWS S3 Bucket  │
                    │  (Champion Icons)│
                    └──────────────────┘
```

## 🚀 Quick Start (Local Development)

### Prerequisites

- Docker and Docker Compose installed
- AWS RDS PostgreSQL database with champion data
- Champion icons hosted on AWS S3

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd git-iwocs-acjj
```

### 2. Configure Environment Variables

The `.env` file is already configured with your AWS RDS credentials. If needed, update:

```bash
# .env file (already created)
DB_HOST=db-iwocs-acjj.c9y8c02yuttu.eu-west-3.rds.amazonaws.com
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_password_here
```

### 3. Start the Application

```bash
# Build and start all containers
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health

### 5. Stop the Application

```bash
docker-compose down
```

## 📁 Project Structure

```
git-iwocs-acjj/
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js              # Express server setup
│   └── routes/
│       └── champions.js        # API endpoints
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.js
│       ├── App.vue            # Main game component
│       └── style.css          # Game styling
├── docker-compose.yml         # Docker orchestration
├── .env                       # Environment variables
├── .env.example              # Example env file
├── data.csv                  # Champion data
└── README.md                 # This file
```

## 🔌 API Endpoints

### GET `/api/champions/random`
Get a random champion for a new game.

**Response:**
```json
{
  "championId": "Ahri",
  "answer": { /* full champion data */ }
}
```

### GET `/api/champions/all`
Get all champion names for autocomplete.

**Response:**
```json
["Aatrox", "Ahri", "Akali", ...]
```

### POST `/api/champions/guess`
Validate a guess and return champion data.

**Request:**
```json
{
  "guess": "Ahri"
}
```

**Response:**
```json
{
  "championname": "Ahri",
  "role": "Mid",
  "genre": "Feminin",
  "espece": "Vastaya",
  "ressource": "Mana",
  "range": "Ranged",
  "regions": "Ionia",
  "releasedate": "2011-12-14",
  "iconurl": "https://s3-iwocs-acjj.s3.eu-west-3.amazonaws.com/champion_icons/Ahri.png"
}
```

## ☁️ Deploying to AWS EC2

### Step 1: Launch an EC2 Instance

1. Go to AWS Console → EC2
2. Click "Launch Instance"
3. Choose **Amazon Linux 2023** or **Ubuntu 22.04 LTS**
4. Instance type: **t2.micro** (free tier eligible)
5. Configure Security Group:
   - SSH (Port 22): Your IP
   - HTTP (Port 80): 0.0.0.0/0
   - Custom TCP (Port 3000): 0.0.0.0/0
   - Custom TCP (Port 5173): 0.0.0.0/0
6. Create/select a key pair for SSH access
7. Launch instance

### Step 2: Connect to EC2

```bash
# Make key file readable only by you
chmod 400 your-key.pem

# Connect via SSH
ssh -i your-key.pem ec2-user@your-ec2-public-ip
```

### Step 3: Install Docker on EC2

```bash
# Update system
sudo yum update -y  # For Amazon Linux
# OR
sudo apt update && sudo apt upgrade -y  # For Ubuntu

# Install Docker
sudo yum install docker -y  # Amazon Linux
# OR
sudo apt install docker.io -y  # Ubuntu

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### Step 4: Deploy Your Application

```bash
# Install Git
sudo yum install git -y  # Amazon Linux
# OR
sudo apt install git -y  # Ubuntu

# Clone your repository
git clone <your-repo-url>
cd git-iwocs-acjj

# Create .env file with your credentials
nano .env
# (Paste your environment variables)

# Build and start containers
docker-compose up -d --build

# Check logs
docker-compose logs -f
```

### Step 5: Configure Nginx (Optional - Production Setup)

For production, use Nginx as a reverse proxy:

```bash
# Install Nginx
sudo yum install nginx -y  # Amazon Linux
# OR
sudo apt install nginx -y  # Ubuntu

# Create Nginx config
sudo nano /etc/nginx/conf.d/lodle.conf
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Restart Nginx
sudo systemctl restart nginx
```

### Step 6: Access Your Application

- Visit: `http://your-ec2-public-ip:5173`
- Or with Nginx: `http://your-ec2-public-ip` or `http://your-domain.com`

### Step 7: Set Up SSL (Optional)

```bash
# Install Certbot
sudo yum install certbot python3-certbot-nginx -y  # Amazon Linux
# OR
sudo apt install certbot python3-certbot-nginx -y  # Ubuntu

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

## 🛠️ Development

### Running Without Docker

**Backend:**
```bash
cd backend
npm install
npm start
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Database Setup

If you need to import champion data:

```bash
python3 importData.py
```

This will import all champions from `data.csv` into your PostgreSQL database.

## 🔧 Troubleshooting

### Docker Issues

```bash
# Rebuild containers
docker-compose down
docker-compose up --build

# View logs
docker-compose logs backend
docker-compose logs frontend

# Access container shell
docker exec -it <container-name> sh
```

### Database Connection Issues

1. Check AWS RDS security group allows inbound connections
2. Verify credentials in `.env` file
3. Test connection: `python3 db.py`

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

## 📊 Database Schema

```sql
CREATE TABLE champion (
    championName VARCHAR(50) PRIMARY KEY,
    role VARCHAR(20),
    genre VARCHAR(20),
    espece VARCHAR(50),
    ressource VARCHAR(30),
    range VARCHAR(10),
    regions VARCHAR(50),
    releaseDate DATE,
    iconUrl TEXT
);
```

## 🎯 Game Rules

1. **Objective**: Guess the mystery League of Legends champion
2. **How to Play**:
   - Type a champion name in the search box
   - Select from autocomplete suggestions
   - Submit your guess
3. **Feedback**:
   - 🟢 **Green**: Attribute matches the target
   - 🔴 **Red**: Attribute doesn't match
   - ⬆️ **Up Arrow**: Target champion is newer
   - ⬇️ **Down Arrow**: Target champion is older
4. **Win**: Match all attributes correctly!

## 📝 Future Enhancements

- [ ] Add difficulty modes
- [ ] Implement user accounts and login
- [ ] Track detailed statistics (average guesses, win rate)
- [ ] Add leaderboard
- [ ] Daily challenge mode
- [ ] Hint system
- [ ] Share results feature

## 🤝 Contributing

Feel free to fork this project and submit pull requests!

## 📄 License

MIT License - feel free to use this project for learning and development.

## 🙏 Acknowledgments

- Champion data from Riot Games
- Icons hosted on AWS S3
- Inspired by Lodle.net and Wordle
