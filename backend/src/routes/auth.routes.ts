import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { LoginSchema, RegisterSchema, ResendOtpSchema, VerifyOtpSchema } from '../schemas/auth.schema';

const router = Router();

router.post('/register', validate(RegisterSchema), AuthController.register);
router.post('/verify-otp', validate(VerifyOtpSchema), AuthController.verifyOtp);
router.post('/resend-otp', validate(ResendOtpSchema), AuthController.resendOtp);
router.post('/login', validate(LoginSchema), AuthController.login);
router.get('/me', authenticate, AuthController.getMe);

export default router;
