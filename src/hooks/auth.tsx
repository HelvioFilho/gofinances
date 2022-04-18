import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import * as AuthSession from 'expo-auth-session';
import * as AppleAuthentication from 'expo-apple-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const { CLIENT_ID } = process.env;
const { REDIRECT_URI } = process.env;

interface AuthProviderProps {
  children: ReactNode;
}

interface User {
  id: string;
  name: string;
  email: string;
  photo?: string;
}

interface AuthContextData {
  user: User;
  signInWithGoogle(): Promise<void>;
  signInWithApple(): Promise<void>;
  signOut(): Promise<void>;
  userStorageLoading: boolean;
}

interface AuthorizationResponse {
  params: {
    access_token: string;
  };
  type: string;
}
interface DataApple {
  id: string;
  name: string;
  email: string;
}

interface StoreDataApple {
  [id: string]: DataApple
}

const AuthContext = createContext({} as AuthContextData);

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>({} as User);
  const [userStorageLoading, setUserStorageLoading] = useState(true);

  const userStoredKey = '@gofinances:user';

  async function signInWithGoogle() {
    try {
      const RESPONSE_TYPE = 'token';
      const SCOPE = encodeURI('profile email');

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`;
      const { type, params } = await AuthSession.startAsync({ authUrl }) as AuthorizationResponse;

      if (type === 'success') {
        const response = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${params.access_token}`);
        const userInfo = await response.json();
        const userLogged = {
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.given_name,
          photo: userInfo.picture,
        }
        setUser(userLogged);
        await AsyncStorage.setItem(userStoredKey, JSON.stringify(userLogged));
      }

    } catch (error) {
      throw new Error(error as string);
    }
  }

  async function signInWithApple() {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ]
      });

      const secureKey = 'goFinancesApple';
      const secureData = await SecureStore.getItemAsync(secureKey);
      const secureCurrentData = secureData ? (JSON.parse(secureData) as StoreDataApple) : {} as StoreDataApple;
      let data: DataApple = {} as DataApple;

      const checkId = Object.keys(secureCurrentData)
        .filter((id) => id === String(credential.user))
        .map((info) => {
          return { ...secureCurrentData[info], id: info }
        });

      if (checkId.length > 0) {
        data = {
          id: checkId[0].id,
          name: checkId[0].name,
          email: checkId[0].email
        }
      } else {
        data = {
          id: String(credential.user),
          name: credential.fullName!.givenName!,
          email: credential.email!
        }

        const secureStoreData = {
          ...secureCurrentData,
          [String(credential.user)]: {
            name: data.name,
            email: data.email,
          }
        }
        await SecureStore.setItemAsync(secureKey, JSON.stringify(secureStoreData));
      }

      const photo = `https://ui-avatars.com/api/?name=${data.name}&length=1`;
      const userLogged = {
        ...data,
        photo,
      }
      setUser(userLogged);
      await AsyncStorage.setItem(userStoredKey, JSON.stringify(userLogged));

    } catch (error) {
      throw new Error(error as string);
    }
  }

  async function signOut() {
    setUser({} as User);
    await AsyncStorage.removeItem(userStoredKey);
  }

  async function loadUserStorageData() {
    const userStored = await AsyncStorage.getItem(userStoredKey);

    if (userStored) {
      const userLogged = JSON.parse(userStored) as User;
      setUser(userLogged);
    }
    setUserStorageLoading(false);
  }

  useEffect(() => {
    loadUserStorageData();
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      signInWithGoogle,
      signInWithApple,
      signOut,
      userStorageLoading,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

function useAuth() {
  const context = useContext(AuthContext);
  return context;
}

export { AuthProvider, useAuth }