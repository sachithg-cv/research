// src/context/RendererContext.tsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { RendererContextType, EventHandlerConfig, ApiConfig } from '../types/renderer';

const RendererContext = createContext<RendererContextType | null>(null);

// Debug flag for development environment
const DEBUG = window.location.hostname === 'localhost' || 
             window.location.hostname === '127.0.0.1' ||
             window.location.hostname.includes('dev-');

// Enhanced nested object handling
const getNestedValue = (obj: Record<string, any>, path: string): any => {
  try {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  } catch (error) {
    DEBUG && console.warn(`Error getting nested value for path: ${path}`, error);
    return undefined;
  }
};

// Enhanced template processing
const processTemplate = (template: string, state: Record<string, any>, event?: any): string => {
  try {
    let result = template;

    // Handle event value references
    if (event && template.includes('${event')) {
      result = result.replace(/\${event\.([^}]+)}/g, (_, path) => {
        const value = getNestedValue(event, path);
        DEBUG && console.log('Processing event template:', { path, value });
        return value !== undefined ? String(value) : '';
      });
    }

    // Handle state references
    if (template.includes('${state.')) {
      result = result.replace(/\${state\.([^}]+)}/g, (_, path) => {
        const value = getNestedValue(state, path);
        DEBUG && console.log('Processing state template:', { path, value });
        return value !== undefined ? String(value) : '';
      });
    }

    return result;
  } catch (error) {
    DEBUG && console.error('Error processing template:', error);
    return template;
  }
};

// Enhanced transformers with error handling
const transformers: Record<string, (data: any) => any> = {
  toOptions: (data: any[] | null) => {
    if (!data || !Array.isArray(data)) return [];
    return data.map(item => ({
      label: item.name || item.label || String(item),
      value: item.id || item.value || item
    }));
  },
  toString: (data: any) => {
    try {
      return String(data);
    } catch (error) {
      DEBUG && console.warn('Error converting to string:', error);
      return '';
    }
  },
  toNumber: (data: any) => {
    const num = Number(data);
    return isNaN(num) ? 0 : num;
  },
  toDate: (data: any) => {
    try {
      return new Date(data).toLocaleDateString();
    } catch {
      return new Date().toLocaleDateString();
    }
  },
  toUpperCase: (data: string) => String(data).toUpperCase(),
  toLowerCase: (data: string) => String(data).toLowerCase(),
  toBoolean: (data: any) => Boolean(data),
  toCurrency: (data: number) => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(data);
    } catch {
      return '$0.00';
    }
  },
  toJSON: (data: any) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return '{}';
    }
  },
  toArray: (data: any) => Array.isArray(data) ? data : [data].filter(Boolean),
  toFixed: (data: number) => Number(data).toFixed(2),
  toPercent: (data: number) => `${(Number(data) * 100).toFixed(1)}%`,
};

export const RendererProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize empty state
  const [state, setStateInternal] = useState<Record<string, any>>({});

  // Debug state changes in development
  useEffect(() => {
    DEBUG && console.log('State updated:', state);
  }, [state]);

  // Check if state exists
  const hasState = useCallback((key: string): boolean => {
    const value = getNestedValue(state, key);
    return value !== undefined;
  }, [state]);

  // Enhanced setState with validation
  const setState = useCallback((key: string, value: any) => {
    setStateInternal(prev => {
      try {
        // Handle null/undefined value
        if (value === null || value === undefined) {
          const newState = { ...prev };
          delete newState[key];
          return newState;
        }

        // Handle nested state updates
        const parts = key.split('.');
        if (parts.length === 1) {
          return { ...prev, [key]: value };
        }

        const newState = { ...prev };
        let current = newState;
        const lastPart = parts.pop()!;
        
        for (const part of parts) {
          current[part] = current[part] ? { ...current[part] } : {};
          current = current[part];
        }
        current[lastPart] = value;
        
        return newState;
      } catch (error) {
        DEBUG && console.error('Error setting state:', { key, value, error });
        return prev;
      }
    });
  }, []);

  // Enhanced getData with better error handling
  const getData = useCallback((key: string) => {
    const value = getNestedValue(state, key);
    DEBUG && value === undefined && console.debug(`State key "${key}" not found`);
    return value;
  }, [state]);

  // Enhanced formatData with validation
  const formatData = useCallback((data: any, transform?: string) => {
    if (!transform) return data;
    const transformer = transformers[transform];
    if (!transformer) {
      DEBUG && console.warn(`Transformer "${transform}" not found`);
      return data;
    }
    try {
      return transformer(data);
    } catch (error) {
      DEBUG && console.error(`Error applying transformer "${transform}":`, error);
      return data;
    }
  }, []);

  // Enhanced params processing
  const processParams = (
    params: string | boolean | number | Record<string, any> | null | undefined,
    state: Record<string, any>,
    event?: any
  ): any => {
    try {
      if (params === null || params === undefined) return null;
      
      if (typeof params === 'string') {
        return processTemplate(params, state, event);
      }
    
      if (typeof params === 'boolean' || typeof params === 'number') {
        return params;
      }
    
      if (typeof params === 'object' && params !== null) {
        return Object.entries(params).reduce((acc, [key, value]) => {
          if (typeof value === 'string') {
            acc[key] = processTemplate(value, state, event);
          } else {
            acc[key] = value;
          }
          return acc;
        }, {} as Record<string, any>);
      }
    
      return params;
    } catch (error) {
      DEBUG && console.error('Error processing params:', error);
      return params;
    }
  };

  // Enhanced API call handler
  const callApi = async (config: ApiConfig, event?: any) => {
    const { url, method, headers = {}, body } = config;
    
    try {
      const processedUrl = processTemplate(url, state, event);
      DEBUG && console.log('Making API call:', { url: processedUrl, method, body });
      
      const response = await fetch(processedUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(processParams(body, state, event)) : undefined,
      });
      
      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      DEBUG && console.log('API response:', data);
      return data;
    } catch (error) {
      DEBUG && console.error('API call error:', error);
      throw error;
    }
  };

  // Enhanced action executor
  const executeAction = async (action: EventHandlerConfig, event?: any) => {
    DEBUG && console.log('Executing action:', { action, event });
    
    try {
      switch (action.action) {
        case 'api': {
          setState(`${action.target}_loading`, true);
          setState(`${action.target}_error`, null);
          
          try {
            const processedParams = processParams(action.params, state, event);
            const result = await callApi(processedParams as ApiConfig, event);
            setState(action.target!, result);
            
            if (action.successAction) {
              await executeAction(action.successAction, event);
            }
          } catch (error) {
            DEBUG && console.error('API action error:', error);
            setState(`${action.target}_error`, error);
            
            if (action.errorAction) {
              await executeAction(action.errorAction, event);
            }
          } finally {
            setState(`${action.target}_loading`, false);
          }
          break;
        }
        
        case 'setState': {
          const processedParams = processParams(action.params, state, event);
          setState(action.target!, processedParams);
          break;
        }
        
        case 'submit': {
          const formData = getData(action.params as string);
          const apiAction: EventHandlerConfig = {
            type: action.type,
            action: 'api',
            target: action.target!,
            params: {
              url: action.target!,
              method: 'POST',
              body: formData,
            }
          };
          await executeAction(apiAction, event);
          break;
        }
        
        case 'navigate': {
          const url = processTemplate(
            typeof action.params === 'string' ? action.params : action.target!,
            state,
            event
          );
          window.location.href = url;
          break;
        }

        default:
          DEBUG && console.warn(`Unknown action type: ${action.action}`);
      }
    } catch (error) {
      DEBUG && console.error('Action execution error:', error);
      throw error;
    }
  };

  const contextValue = {
    state,
    setState,
    getData,
    hasState,
    executeAction,
    formatData,
  };

  return (
    <RendererContext.Provider value={contextValue}>
      {children}
    </RendererContext.Provider>
  );
};

export const useRenderer = () => {
  const context = useContext(RendererContext);
  if (!context) {
    throw new Error('useRenderer must be used within a RendererProvider');
  }
  return context;
};

export default RendererContext;