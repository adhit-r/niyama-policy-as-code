import { useState, useCallback } from 'react';
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  retries?: number;
  retryDelay?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export const useApi = <T = any>(options: UseApiOptions = {}) => {
  const { retries = 3, retryDelay = 1000, onSuccess, onError } = options;
  
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (
    config: AxiosRequestConfig,
    attempt: number = 1
  ): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response: AxiosResponse<T> = await axios(config);
      const data = response.data;
      
      setState({ data, loading: false, error: null });
      onSuccess?.(data);
      return data;
    } catch (error) {
      const axiosError = error as AxiosError;
      const errorMessage = axiosError.response?.data?.error || axiosError.message || 'An error occurred';
      
      // Retry logic
      if (attempt < retries && axiosError.response?.status >= 500) {
        console.log(`Retry attempt ${attempt + 1}/${retries} after ${retryDelay}ms`);
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        return execute(config, attempt + 1);
      }
      
      setState({ data: null, loading: false, error: errorMessage });
      onError?.(errorMessage);
      return null;
    }
  }, [retries, retryDelay, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
};

// Specialized hooks for common API patterns
export const useGet = <T = any>(url: string, options?: UseApiOptions) => {
  const api = useApi<T>(options);
  
  const fetch = useCallback(() => {
    return api.execute({ method: 'GET', url });
  }, [api, url]);
  
  return { ...api, fetch };
};

export const usePost = <T = any>(url: string, options?: UseApiOptions) => {
  const api = useApi<T>(options);
  
  const post = useCallback((data: any) => {
    return api.execute({ method: 'POST', url, data });
  }, [api, url]);
  
  return { ...api, post };
};

export const usePut = <T = any>(url: string, options?: UseApiOptions) => {
  const api = useApi<T>(options);
  
  const put = useCallback((data: any) => {
    return api.execute({ method: 'PUT', url, data });
  }, [api, url]);
  
  return { ...api, put };
};

export const useDelete = <T = any>(url: string, options?: UseApiOptions) => {
  const api = useApi<T>(options);
  
  const del = useCallback(() => {
    return api.execute({ method: 'DELETE', url });
  }, [api, url]);
  
  return { ...api, delete: del };
};
