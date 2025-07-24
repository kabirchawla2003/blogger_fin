module.exports = {
  apps: [{
    name: 'author-blog',
    script: 'npm',
    args: 'start',
    cwd: '/path/to/author-blog',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      ADMIN_USERNAME: 'admin',
      ADMIN_PASSWORD: 'your_secure_password',
      NEXT_PUBLIC_SITE_URL: 'https://yourdomain.com'
    }
  }]
}
