// import express from 'express';
// import * as usersController from '../controllers/users';
// import authMiddleware from '../middlewares/auth';

// const router = express.Router();

// router.post('/', usersController.register);
// router.post('/login', usersController.login);
// router.get('/', authMiddleware, usersController.currentUser);
// router.get('/current', authMiddleware, usersController.currentUser);
// router.get('/profile/:username', authMiddleware, usersController.getProfile);
// router.put('/profile/:username', authMiddleware, usersController.updateProfile);
// router.get('/:id', usersController.getUserById);
// router.get('/check-credentials', usersController.checkUserCredentialsAvailability);
// router.delete('/profile', authMiddleware, (req, res, next) => {
//     console.log("Delete profile route hit");
//     usersController.deleteProfile(req, res, next);
//   });

// export default router;