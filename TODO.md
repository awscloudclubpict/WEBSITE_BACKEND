<<<<<<< HEAD
- [x] Update package.json: remove aws-sdk v2, add @aws-sdk/client-s3 and @aws-sdk/lib-storage
- [x] Run npm install to install new packages
- [x] Update src/utils/s3.js: migrate code to use AWS SDK v3
- [ ] Test by running node src/index.js
=======
- [ ] Update package.json to add cookie-parser dependency
- [ ] Update src/index.js to add cookie-parser middleware
- [ ] Update src/controllers/authController.js to set HTTP-only cookie in register and login methods
- [ ] Update src/middleware/authMiddleware.js to check for token in cookies if not in header
- [ ] Update src/routes/authRoutes.js to add logout route
- [ ] Install dependencies
- [ ] Test login/register endpoints
- [ ] Test protected routes with cookie
- [ ] Test logout
>>>>>>> 4a391d5bdfd08e14304e3a1c2c4aa4d9f1d91fb4
