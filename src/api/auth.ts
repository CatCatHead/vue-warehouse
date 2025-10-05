import { ref } from "vue";
import type { Ref } from "vue";
import axios from "axios";
import { ElMessage } from "element-plus";

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  user: UserInfo;
}

interface UserInfo {
  username: string;
  userID: string;
  email: string;
  roles: string[];
}

const user: Ref<UserInfo | null> = ref(null);
const token: Ref<string | null> = ref(null);

const initializeAuth = () => {
  const savedToken = localStorage.getItem("accessToken");
  if (savedToken) {
    token.value = savedToken;
    const savedUser = localStorage.getItem("userInfo");
    if (savedUser) {
      user.value = JSON.parse(savedUser);
    }
  }
};

initializeAuth();

export const useAuth = () => {
  const login = async (credentials: LoginRequest): Promise<boolean> => {
    try {
      const resp = await axios.post<LoginResponse>("/api/login", credentials);
      const { accessToken, user: userInfo } = resp.data;

      token.value = accessToken;
      user.value = userInfo;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("userInfo", JSON.stringify(userInfo));

      return true;
    } catch (error: any) {
      ElMessage.error(error?.response?.data?.message ?? "Login Failed");
      console.error("Login failed:", error);
      return false;
    }
  };

  const logout = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userInfo");
  };

  const checkAuth = (): boolean => {
    return !!token.value;
  };

  return {
    user,
    token,
    login,
    logout,
    checkAuth,
  };
};

export default useAuth;
