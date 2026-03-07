import { userRepository } from '../repositories/userRepository';
import { AppError } from '../middleware/errorHandler';

export const profileService = {
  async updateProfile(
    userId: number,
    data: { email?: string; display_name?: string },
  ) {
    if (data.email) {
      const existing = await userRepository.findByEmail(data.email);
      if (existing && existing.id !== userId) {
        throw new AppError(409, 'CONFLICT', 'Email already in use');
      }
    }

    return userRepository.updateProfile(userId, {
      email: data.email,
      displayName: data.display_name,
    });
  },
};
