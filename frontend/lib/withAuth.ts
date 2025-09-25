import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

interface User {
  id: string;
  email: string;
  createdAt: string;
}

interface AuthData {
  user: User;
  accessToken: string;
}

interface WithAuthOptions {
  redirectTo?: string;
  requireAuth?: boolean;
}

/**
 * Higher-order function that wraps getServerSideProps with authentication
 * Automatically redirects unauthenticated users to login page
 */
export function withAuth<P extends Record<string, unknown> = Record<string, unknown>>(
  getServerSideProps?: (
    context: GetServerSidePropsContext,
    authData: AuthData
  ) => Promise<GetServerSidePropsResult<P>>,
  options: WithAuthOptions = {}
): GetServerSideProps<P & { authData: AuthData | null }> {
  const { redirectTo = '/login', requireAuth = true } = options;

  return async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P & { authData: AuthData | null }>> => {
    const { req } = context;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    try {
      // Extract cookies from the request
      const cookies = req.headers.cookie || '';

      if (!cookies) {
        if (requireAuth) {
          return {
            redirect: {
              destination: redirectTo,
              permanent: false,
            },
          };
        }
        // If auth is not required, call the original function without auth data
        if (getServerSideProps) {
          const result = await getServerSideProps(context, {} as AuthData);
          if ('props' in result) {
            return {
              ...result,
              props: {
                ...result.props,
                authData: null,
              } as P & { authData: AuthData | null },
            };
          }
          return result;
        }
        return {
          props: {
            authData: null,
          } as P & { authData: AuthData | null },
        };
      }

      // Try to get user info using the /auth/me endpoint
      let userResponse = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          Cookie: cookies,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!userResponse.ok) {
        // If the request fails, try to refresh the token
        const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: {
            Cookie: cookies,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!refreshResponse.ok) {
          // If refresh fails, redirect to login
          if (requireAuth) {
            return {
              redirect: {
                destination: redirectTo,
                permanent: false,
              },
            };
          }
          // If auth is not required, call the original function without auth data
          if (getServerSideProps) {
            const result = await getServerSideProps(context, {} as AuthData);
            if ('props' in result) {
              return {
                ...result,
                props: {
                  ...result.props,
                  authData: null,
                } as P & { authData: AuthData | null },
              };
            }
            return result;
          }
          return {
            props: {
              authData: null,
            } as P & { authData: AuthData | null },
          };
        }

        // If refresh succeeded, try to get user info again
        userResponse = await fetch(`${API_URL}/auth/me`, {
          method: 'GET',
          headers: {
            Cookie: cookies,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!userResponse.ok) {
          if (requireAuth) {
            return {
              redirect: {
                destination: redirectTo,
                permanent: false,
              },
            };
          }
          // If auth is not required, call the original function without auth data
          if (getServerSideProps) {
            const result = await getServerSideProps(context, {} as AuthData);
            if ('props' in result) {
              return {
                ...result,
                props: {
                  ...result.props,
                  authData: null,
                } as P & { authData: AuthData | null },
              };
            }
            return result;
          }
          return {
            props: {
              authData: null,
            } as P & { authData: AuthData | null },
          };
        }
      }

      // Parse user data from the response
      const userData = await userResponse.json();
      const authData: AuthData = {
        user: userData.user,
        accessToken: 'server-side-token', // We don't need the actual access token on server-side
      };

      // Call the original getServerSideProps function with auth data
      if (getServerSideProps) {
        const result = await getServerSideProps(context, authData);
        if ('props' in result) {
          return {
            ...result,
            props: {
              ...result.props,
              authData,
            } as P & { authData: AuthData | null },
          };
        }
        return result;
      }

      // If no getServerSideProps function provided, just return auth data
      return {
        props: {
          authData,
        } as P & { authData: AuthData | null },
      };
    } catch (error) {
      console.error('Authentication error:', error);
      
      if (requireAuth) {
        return {
          redirect: {
            destination: redirectTo,
            permanent: false,
          },
        };
      }

      // If auth is not required, return without auth data
      if (getServerSideProps) {
        const result = await getServerSideProps(context, {} as AuthData);
        if ('props' in result) {
          return {
            ...result,
            props: {
              ...result.props,
              authData: null,
            } as P & { authData: AuthData | null },
          };
        }
        return result;
      }

      return {
        props: {
          authData: null,
        } as P & { authData: AuthData | null },
      };
    }
  };
}

/**
 * Simplified version that only requires authentication
 * Use this for pages that must be authenticated
 */
export function requireAuth<P extends Record<string, unknown> = Record<string, unknown>>(
  getServerSideProps?: (
    context: GetServerSidePropsContext,
    authData: AuthData
  ) => Promise<GetServerSidePropsResult<P>>
): GetServerSideProps<P & { authData: AuthData }> {
  return withAuth(getServerSideProps, { requireAuth: true }) as GetServerSideProps<P & { authData: AuthData }>;
}

/**
 * Optional authentication version
 * Use this for pages that can work with or without authentication
 */
export function optionalAuth<P extends Record<string, unknown> = Record<string, unknown>>(
  getServerSideProps?: (
    context: GetServerSidePropsContext,
    authData: AuthData | null
  ) => Promise<GetServerSidePropsResult<P>>
): GetServerSideProps<P & { authData: AuthData | null }> {
  return withAuth(getServerSideProps, { requireAuth: false });
}
