// MessageScreen.tsx (or the main screen file)
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Layout } from "@/components/layout/Layout";
import { useOutlet } from "@/context/outletContext";
import { getToken, getUser } from "@/lib/tokenStorage";
import MessageMain from "./message"; // your real component

export default function MessageScreen() {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loadingToken, setLoadingToken] = useState(true);
  const { activeOutlet } = useOutlet();
const [user, setUser] = useState<any>()
  useEffect(() => {
    const fetchToken = async () => {
      const token = await getToken();
      console.log("✅ Loaded Token:", token);
     
      setAuthToken(token);
      setLoadingToken(false);
       const user = await getUser();
      console.log('use loaded', user)
      setUser(user)
    };
    fetchToken();
  }, []);

  if (loadingToken || !authToken || !activeOutlet) {
    return (
      <Layout>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      </Layout>
    );
  }

  return <MessageMain authToken={authToken} outlet={activeOutlet} userData={user} />;
}
