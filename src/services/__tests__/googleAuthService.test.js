import { googleAuthService } from '../googleAuthService';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { authService } from '../authService';

// Mock GoogleSignin
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    revokeAccess: jest.fn(),
    isSignedIn: jest.fn(),
    getCurrentUser: jest.fn(),
  },
}));

// Mock authService
jest.mock('../authService', () => ({
  authService: {
    googleLogin: jest.fn(),
  },
}));

describe('googleAuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('configure', () => {
    it('should configure GoogleSignin with correct parameters', () => {
      googleAuthService.configure();
      expect(GoogleSignin.configure).toHaveBeenCalledWith({
        webClientId: expect.any(String),
        offlineAccess: true,
      });
    });
  });

  describe('signIn', () => {
    it('should successfully sign in with Google', async () => {
      const mockUserInfo = {
        idToken: 'mock-id-token',
        user: {
          id: '123',
          email: 'test@example.com',
          name: 'Test User',
        },
      };

      GoogleSignin.hasPlayServices.mockResolvedValue(true);
      GoogleSignin.signIn.mockResolvedValue(mockUserInfo);

      const result = await googleAuthService.signIn();

      expect(GoogleSignin.hasPlayServices).toHaveBeenCalled();
      expect(GoogleSignin.signIn).toHaveBeenCalled();
      expect(result).toEqual(mockUserInfo);
    });

    it('should throw error when Google Play Services not available', async () => {
      GoogleSignin.hasPlayServices.mockRejectedValue(new Error('PLAY_SERVICES_NOT_AVAILABLE'));

      await expect(googleAuthService.signIn()).rejects.toThrow('PLAY_SERVICES_NOT_AVAILABLE');
    });

    it('should throw error when sign in fails', async () => {
      GoogleSignin.hasPlayServices.mockResolvedValue(true);
      GoogleSignin.signIn.mockRejectedValue(new Error('SIGN_IN_FAILED'));

      await expect(googleAuthService.signIn()).rejects.toThrow('SIGN_IN_FAILED');
    });
  });

  describe('handleGoogleLogin', () => {
    it('should successfully handle Google login', async () => {
      const mockUserInfo = {
        idToken: 'mock-id-token',
        user: {
          id: '123',
          email: 'test@example.com',
          name: 'Test User',
        },
      };

      const mockAuthResponse = {
        token: 'mock-jwt-token',
        user: {
          id: '123',
          email: 'test@example.com',
          name: 'Test User',
        },
      };

      GoogleSignin.hasPlayServices.mockResolvedValue(true);
      GoogleSignin.signIn.mockResolvedValue(mockUserInfo);
      authService.googleLogin.mockResolvedValue(mockAuthResponse);

      const result = await googleAuthService.handleGoogleLogin();

      expect(GoogleSignin.hasPlayServices).toHaveBeenCalled();
      expect(GoogleSignin.signIn).toHaveBeenCalled();
      expect(authService.googleLogin).toHaveBeenCalledWith('mock-id-token');
      expect(result).toEqual(mockAuthResponse);
    });

    it('should throw error when no ID token received', async () => {
      const mockUserInfo = {
        user: {
          id: '123',
          email: 'test@example.com',
          name: 'Test User',
        },
      };

      GoogleSignin.hasPlayServices.mockResolvedValue(true);
      GoogleSignin.signIn.mockResolvedValue(mockUserInfo);

      await expect(googleAuthService.handleGoogleLogin()).rejects.toThrow('No ID token received from Google');
    });
  });

  describe('signOut', () => {
    it('should successfully sign out', async () => {
      GoogleSignin.signOut.mockResolvedValue();

      await googleAuthService.signOut();

      expect(GoogleSignin.signOut).toHaveBeenCalled();
    });

    it('should throw error when sign out fails', async () => {
      GoogleSignin.signOut.mockRejectedValue(new Error('SIGN_OUT_FAILED'));

      await expect(googleAuthService.signOut()).rejects.toThrow('SIGN_OUT_FAILED');
    });
  });

  describe('revokeAccess', () => {
    it('should successfully revoke access', async () => {
      GoogleSignin.revokeAccess.mockResolvedValue();

      await googleAuthService.revokeAccess();

      expect(GoogleSignin.revokeAccess).toHaveBeenCalled();
    });

    it('should throw error when revoke access fails', async () => {
      GoogleSignin.revokeAccess.mockRejectedValue(new Error('REVOKE_ACCESS_FAILED'));

      await expect(googleAuthService.revokeAccess()).rejects.toThrow('REVOKE_ACCESS_FAILED');
    });
  });

  describe('isSignedIn', () => {
    it('should return true when user is signed in', async () => {
      GoogleSignin.isSignedIn.mockResolvedValue(true);

      const result = await googleAuthService.isSignedIn();

      expect(GoogleSignin.isSignedIn).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when user is not signed in', async () => {
      GoogleSignin.isSignedIn.mockResolvedValue(false);

      const result = await googleAuthService.isSignedIn();

      expect(GoogleSignin.isSignedIn).toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should return false when error occurs', async () => {
      GoogleSignin.isSignedIn.mockRejectedValue(new Error('ERROR'));

      const result = await googleAuthService.isSignedIn();

      expect(GoogleSignin.isSignedIn).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user when available', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
      };

      GoogleSignin.getCurrentUser.mockResolvedValue(mockUser);

      const result = await googleAuthService.getCurrentUser();

      expect(GoogleSignin.getCurrentUser).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should return null when no current user', async () => {
      GoogleSignin.getCurrentUser.mockResolvedValue(null);

      const result = await googleAuthService.getCurrentUser();

      expect(GoogleSignin.getCurrentUser).toHaveBeenCalled();
      expect(result).toBe(null);
    });

    it('should return null when error occurs', async () => {
      GoogleSignin.getCurrentUser.mockRejectedValue(new Error('ERROR'));

      const result = await googleAuthService.getCurrentUser();

      expect(GoogleSignin.getCurrentUser).toHaveBeenCalled();
      expect(result).toBe(null);
    });
  });
}); 