import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
    login as loginRequest,
    register as registerRequest, 
} from '../../../shared/apis';
import { showError } from '../../../shared/utils/toast.js';

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            refreshToken: null,
            expiresAt: null,
            loading: false,
            error: null,
            isLoadingAuth: true,
            isAuthenticated: false,
            checkAuth: () => {
                const token = get().token;
                const role = get().user?.role;
                const isAdmin = role === 'ADMIN_ROLE';

                if (token && !isAdmin) {
                    set({
                        user: null,
                        token: null,
                        refreshToken: null,
                        expiresAt: null,
                        isLoadingAuth: true,
                        isAuthenticated: false,
                        error: "No tienes permiso para acceder a esta aplicación"
                    });
                    return;
                }//Token valido pero el rol no es admin

                set({
                    isLoadingAuth: false,
                    isAuthenticated: Boolean(token) && isAdmin,
                })
            },//Chequear si esta autenticado el usuario


            logout: () => {
                set({
                    user: null,
                    token: null,
                    refreshToken: null,
                    expiresAt: null,
                    isAuthenticated: false,
                })
            },//Función para cerrar sesion,

            login: async ({ emailOrUsername, password }) => {
                try {
                    set({ loading: true, error: null });

                    const { data } = await loginRequest({ emailOrUsername, password })
                    const role = data?.userDetails?.role;
                    if (role !== "ADMIN_ROLE") {
                        const message = "No tienes permiso para acceder a esta aplicacion";
                        set({
                            user: null,
                            token: null,
                            refreshToken: null,
                            expiresAt: null,
                            isLoadingAuth: true,
                            isAuthenticated: false,
                            error: message,
                        });

                        showError(message);
                        return{success: false, error: message};
                    }

                    set({
                        user: data.userDetails,
                        token: data.accessToken,
                        refreshToken: data.refreshToken,
                        expiresAt: data.expiresIn,
                        isAuthenticated: true,
                        loading: false,
                    })
                    return{success: true};
                } catch (err) {
                    const message = err.response?.data?.message || "Error al iniciar sesión";
                    set({ error: message, loading: false });
                    return { success: false, error: message }
                }
            },

          register: async (formData) => {
            try {
                set({ loading: true, error: null });
                const { data } = await registerRequest(formData);
                set({ success: true, error: null });
                set({ loading: false });
                return{
                    success: true,
                    emailVeerificationRequired: data?.emailVeerificationRequired,
                    data
                }
            } catch (err) {
                const message = err.response?.data?.message || "Error al registrar usuario";
                set({ error: message, loading: false });
                return { success: false, error: message }
            }
          }
        }),


        {name: "auth-KS-IN6AM"},
    ),
);