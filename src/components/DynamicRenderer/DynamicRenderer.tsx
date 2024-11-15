// src/components/DynamicRenderer/DynamicRenderer.tsx
import React, { useEffect } from 'react';
import { componentRegistry } from './ComponentRegistry';
import { useRenderer } from '../../context/RendererContext';
import { BaseComponentConfig, DynamicRendererProps, DataFetchConfig } from '../../types/renderer';

const DynamicRenderer: React.FC<DynamicRendererProps> = ({ config }) => {
  const { executeAction, getData, setState, formatData } = useRenderer();

  // Improved helper for nested object access
  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  };

  // Enhanced condition evaluation
  const evaluateCondition = (condition: string | boolean | undefined): boolean => {
    if (condition === undefined) return true;
    if (typeof condition === 'boolean') return condition;
    if (typeof condition === 'string') {
      if (condition.startsWith('${') && condition.endsWith('}')) {
        const path = condition.slice(2, -1); // Remove ${ and }
        if (path.startsWith('state.')) {
          const statePath = path.replace('state.', '');
          const value = getData(statePath);
          console.log('Evaluating condition:', { path: statePath, value });
          return !!value;
        }
      }
      return !!condition;
    }
    return false;
  };

  // Process template strings
  const processTemplate = (template: string, item?: any) => {
    if (!template.includes('${')) return template;

    return template.replace(/\${([^}]+)}/g, (_, path) => {
      if (path.startsWith('state.')) {
        const statePath = path.replace('state.', '');
        return String(getData(statePath) ?? '');
      }
      if (path.startsWith('item.')) {
        const itemPath = path.replace('item.', '');
        return String(getNestedValue(item, itemPath) ?? '');
      }
      if (path === 'item') {
        return String(item ?? '');
      }
      return '';
    });
  };

  // Data fetching implementation
  useEffect(() => {
    const fetchData = async (fetchConfig: DataFetchConfig) => {
      try {
        setState(`${fetchConfig.key}_loading`, true);
        setState(`${fetchConfig.key}_error`, null);

        const response = await fetch(fetchConfig.api.url, {
          method: fetchConfig.api.method,
          headers: {
            'Content-Type': 'application/json',
            ...(fetchConfig.api.headers || {})
          },
          body: fetchConfig.api.body ? JSON.stringify(fetchConfig.api.body) : undefined,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const transformedData = fetchConfig.transform 
          ? formatData(data, fetchConfig.transform)
          : data;

        setState(fetchConfig.key, transformedData);

        if (fetchConfig.onSuccess) {
          await executeAction(fetchConfig.onSuccess);
        }
      } catch (error) {
        console.error(`Error fetching data for ${fetchConfig.key}:`, error);
        setState(`${fetchConfig.key}_error`, error);
        
        if (fetchConfig.onError) {
          await executeAction(fetchConfig.onError);
        }
      } finally {
        setState(`${fetchConfig.key}_loading`, false);
      }
    };

    const initializeFetching = async () => {
      if (config.dataFetch && Array.isArray(config.dataFetch)) {
        for (const fetchConfig of config.dataFetch) {
          await fetchData(fetchConfig);
        }
      }
    };

    initializeFetching();
  }, [config.dataFetch]);

  // Process bindings with improved error handling
  const processBindings = (bindings: BaseComponentConfig['bindings']) => {
    if (!bindings) return {};
    
    const processedProps: Record<string, any> = {};
    
    for (const [prop, binding] of Object.entries(bindings)) {
      const isLoading = getData(`${binding.source}_loading`);
      const error = getData(`${binding.source}_error`);
      const data = getData(binding.source);
      
      let value = binding.field 
        ? getNestedValue(data, binding.field)
        : data;

      processedProps[prop] = binding.transform 
        ? formatData(value, binding.transform)
        : value;
      
      if (isLoading !== undefined) {
        processedProps.loading = isLoading;
      }
      if (error) {
        processedProps.error = error;
      }
    }
    
    return processedProps;
  };

  // Process events with improved error handling
  const createEventHandler = (events: BaseComponentConfig['events']) => {
    return async (event: any) => {
      try {
        if (events) {
          for (const eventConfig of events) {
            await executeAction(eventConfig, event);
          }
        }
      } catch (error) {
        console.error('Error handling event:', error);
      }
    };
  };

  // Main render function
  const renderComponent = (
    componentConfig: BaseComponentConfig, 
    index?: number
  ): React.ReactNode => {
    const {
      type,
      props = {},
      children,
      condition,
      repeat,
      events,
      bindings,
      key,
    } = componentConfig;

    console.log('Rendering component:', { type, props, condition });

    // Get component from registry
    const Component = componentRegistry[type];
    if (!Component) {
      console.warn(`Component ${type} not found in registry. Available components:`, Object.keys(componentRegistry));
      return null;
    }

    // Evaluate condition
    const shouldRender = evaluateCondition(condition);
    console.log('Condition evaluation result:', { condition, shouldRender });
    if (!shouldRender) {
      return null;
    }

    // Handle repeated elements
    if (repeat) {
      const data = typeof repeat === 'string' ? getData(repeat) : repeat;
      return data?.map((item: any, idx: number) => {
        const processedProps = Object.entries(props).reduce<Record<string, any>>(
          (acc, [propKey, value]) => {
            acc[propKey] = typeof value === 'string' 
              ? processTemplate(value, item)
              : value;
            return acc;
          },
          {}
        );

        return renderComponent({
          ...componentConfig,
          props: processedProps,
          repeat: undefined,
          key: `${type}-${idx}-${item.id || idx}`,
        }, idx);
      });
    }

    // Process children
    let processedChildren = children;
    if (Array.isArray(children)) {
      processedChildren = children.map((child, idx) =>
        typeof child === 'object' && child !== null && 'type' in child
          ? renderComponent({ ...(child as BaseComponentConfig), key: `${type}-child-${idx}` }, idx)
          : child
      );
    }

    // Process all props
    const finalProps = {
      ...props,
      ...(bindings ? processBindings(bindings) : {}),
      ...(events ? events.reduce((acc, event) => ({
        ...acc,
        [event.type]: createEventHandler([event])
      }), {}) : {})
    };

    // Process any template strings in props
    const processedProps = Object.entries(finalProps).reduce<Record<string, any>>(
      (acc, [propKey, value]) => {
        acc[propKey] = typeof value === 'string' 
          ? processTemplate(value)
          : value;
        return acc;
      },
      {}
    );

    // Return component with key prop
    const componentKey = key || `${type}-${index}`;
    return <Component key={componentKey} {...processedProps}>{processedChildren}</Component>;
  };

  return <>{renderComponent(config)}</>;
};

export default DynamicRenderer;