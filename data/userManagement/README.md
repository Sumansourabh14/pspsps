# User Session Management

## Manage user sessions.

- If user is not logged in, redirect to Sign in screen.
- If user is logged in:
  - Don't show the auth screens (sign in, sign out)
  - Listen for session change/update (real time navigation - e.g. if user signs in, redirect home automatically)

## `AuthProvider.tsx`

```
import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { Alert } from "react-native";

type AuthData = {
  session: Session | null;
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthData>({
  session: null,
  user: null,
  loading: true,
});

export default function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      setSession(data.session);
      setUser(data.session?.user);
      setLoading(false);

      if (error) {
        Alert.alert(error.message);
      }
    };

    fetchSession();

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```
