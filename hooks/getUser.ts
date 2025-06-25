import { getUser } from "@/lib/tokenStorage";
import { useEffect, useState } from "react";

const [userId, setUserId] = useState<string | null>(null);

useEffect(() => {
  const fetchUser = async () => {
    const user = await getUser();
    setUserId(user?.id ?? null);
  };
  fetchUser();
}, []);
