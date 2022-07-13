import { act, renderHook } from '@testing-library/react-hooks';
import { AuthProvider, useAuth } from './auth';

jest.mock('expo-auth-session', () => {
  return {
    startAsync: () => {
      return {
        type: 'success',
        params: {
          access_token: 'google-token'
        }
      }
    }
  }
});

describe('Auth Hook', () => {
  it('Should be able to sign in with Google account existing', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    await act(() => result.current.signInWithGoogle());

    expect(result.current.user).toBeTruthy();
  });
});