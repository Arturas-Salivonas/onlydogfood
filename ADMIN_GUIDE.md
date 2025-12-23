# Admin Dashboard

## Accessing the Admin Panel

1. Navigate to: http://localhost:3000/admin/login

2. **Demo Credentials:**
   - Email: `admin@example.com`
   - Password: `admin123`

## Features

### Dashboard (`/admin`)
- Overview statistics (total products, brands, avg score)
- Recent products list
- Top brands by score
- Quick action buttons

### Products Management (`/admin/products`)
- View all products with search and filtering
- Category filter (All, Dry, Wet, Snacks)
- Product status (Available/Unavailable)
- Edit and delete products
- Add new products (form coming soon)

### Brands Management (`/admin/brands`)
- View all brands with search
- Brand statistics (product count, average score)
- Edit and delete brands
- Add new brands (form coming soon)

### Scraper Control (`/admin/scraper`)
- Run brands scraper
- Run products scraper
- View scrape logs (coming soon)
- Rate limiting and error handling

### Settings (`/admin/settings`)
- Configuration panel (coming soon)

## Authentication

The admin panel uses JWT-based authentication with HTTP-only cookies for security.

### Creating Additional Admin Users

Run the following SQL in your Supabase SQL Editor:

```sql
INSERT INTO admin_users (email, password_hash, role)
VALUES ('newemail@example.com', 'password123', 'admin');
```

**Note:** In production, passwords should be hashed using bcrypt!

## Security Notes

⚠️ **IMPORTANT FOR PRODUCTION:**

1. **Change the JWT Secret:**
   - Update `ADMIN_JWT_SECRET` in `.env.local`
   - Use a strong, random secret (at least 32 characters)

2. **Hash Passwords:**
   - Currently using plain text passwords (for development only!)
   - Install bcrypt: `npm install bcrypt @types/bcrypt`
   - Update `lib/auth.ts` to hash and compare passwords

3. **Enable HTTPS:**
   - The `secure` cookie flag is only set in production
   - Make sure your production environment uses HTTPS

4. **Rate Limiting:**
   - Add rate limiting to login endpoint
   - Prevent brute force attacks

5. **Session Management:**
   - Consider adding session timeout
   - Implement refresh tokens for better security

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Clear session cookie
- `GET /api/auth/me` - Get current user info

### Admin Operations (Coming Soon)
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `POST /api/admin/brands` - Create brand
- `PUT /api/admin/brands/:id` - Update brand
- `DELETE /api/admin/brands/:id` - Delete brand
- `POST /api/admin/scraper/run` - Start scraper
- `GET /api/admin/scraper/logs` - Get scrape logs

## Development

### Adding a New Admin Page

1. Create file in `app/admin/[page]/page.tsx`
2. Add navigation link in `components/admin/AdminNav.tsx`
3. Protected by layout authentication automatically

### Customizing the Dashboard

Edit `app/admin/page.tsx` to add custom widgets and stats.

## Troubleshooting

### "Unauthorized" Error
- Make sure you're logged in
- Check that JWT_SECRET is set in .env.local
- Clear cookies and try logging in again

### "Admin user not found"
- Run `npm run seed:admin` to create default admin user
- Or create manually in Supabase dashboard

### Session Expires Too Quickly
- Current session lasts 24 hours
- Adjust in `lib/auth.ts` `setExpirationTime()` call
