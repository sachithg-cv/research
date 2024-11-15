// src/types/renderer.ts
import { ReactNode } from 'react';

// Event Types
export type EventType = 
  | 'onClick'
  | 'onChange'
  | 'onSubmit'
  | 'onBlur'
  | 'onFocus'
  | 'onKeyPress'
  | 'onKeyDown'
  | 'onKeyUp'
  | 'onMouseOver'
  | 'onMouseOut';

// Action Types
export type ActionType = 'api' | 'setState' | 'submit' | 'navigate';

// API Configuration
export interface ApiConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: Record<string, any> | Array<any> | null;
}

// Data Binding Configuration
export interface DataBinding {
  source: string;
  field?: string;
  transform?: string;
}

// Event Handler Configuration
export interface EventHandlerConfig {
  type: EventType;
  action: ActionType;
  target?: string;
  params?: string | boolean | number | Record<string, any> | null; // explicitly include null
  successAction?: EventHandlerConfig;
  errorAction?: EventHandlerConfig;
}

// State Configuration
export interface StateConfig {
  key: string;
  initial?: any;
  type: 'local' | 'global';
}

// Data Fetch Configuration
export interface DataFetchConfig {
  key: string;
  api: ApiConfig;
  transform?: string;
  loadingState?: string;
  errorState?: string;
  onSuccess?: EventHandlerConfig;
  onError?: EventHandlerConfig;
}

// Component Configuration
export interface BaseComponentConfig {
  type: string;
  props?: Record<string, any>;
  children?: ComponentChildren;
  condition?: boolean | string;
  repeat?: any[];
  key?: string | number;
  events?: EventHandlerConfig[];
  bindings?: Record<string, DataBinding>;
  state?: StateConfig[];
  dataFetch?: DataFetchConfig[];
  validation?: Record<string, any>;
}

// Component Children Type
export type ComponentChildren = 
  | ReactNode
  | BaseComponentConfig
  | (ReactNode | BaseComponentConfig)[]
  | null
  | undefined;

// Context Type
export interface RendererContextType {
  state: Record<string, any>;
  setState: (key: string, value: any) => void;
  getData: (key: string) => any;
  executeAction: (action: EventHandlerConfig, event?: any) => Promise<void>;
  formatData: (data: any, transform?: string) => any;
}

// UI Component Props
export interface SelectOption {
  label: string;
  value: string | number;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  asChild?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  options?: SelectOption[];
  placeholder?: string;
  loading?: boolean;
  error?: string | boolean;
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'info';
}

// Renderer Props
export interface DynamicRendererProps {
  config: BaseComponentConfig;
}

export interface HTMLElementProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
}

// Component Registry Type with HTML elements
export type ComponentRegistry = {
  [key: string]: React.ComponentType<any>;
} & {
  div: React.ComponentType<React.HTMLAttributes<HTMLDivElement>>;
  span: React.ComponentType<React.HTMLAttributes<HTMLSpanElement>>;
  p: React.ComponentType<React.HTMLAttributes<HTMLParagraphElement>>;
  h1: React.ComponentType<React.HTMLAttributes<HTMLHeadingElement>>;
  h2: React.ComponentType<React.HTMLAttributes<HTMLHeadingElement>>;
  h3: React.ComponentType<React.HTMLAttributes<HTMLHeadingElement>>;
  section: React.ComponentType<React.HTMLAttributes<HTMLElement>>;
  article: React.ComponentType<React.HTMLAttributes<HTMLElement>>;
  header: React.ComponentType<React.HTMLAttributes<HTMLElement>>;
  footer: React.ComponentType<React.HTMLAttributes<HTMLElement>>;
  nav: React.ComponentType<React.HTMLAttributes<HTMLElement>>;
  aside: React.ComponentType<React.HTMLAttributes<HTMLElement>>;
  main: React.ComponentType<React.HTMLAttributes<HTMLElement>>;
  label: React.ComponentType<React.LabelHTMLAttributes<HTMLLabelElement>>;
  input: React.ComponentType<React.InputHTMLAttributes<HTMLInputElement>>;
};

export type ConfigChild = Extract<ComponentChildren, BaseComponentConfig>;

export interface RendererContextType {
  state: Record<string, any>;
  setState: (key: string, value: any) => void;
  getData: (key: string) => any;
  hasState: (key: string) => boolean;  // Add this
  executeAction: (action: EventHandlerConfig, event?: any) => Promise<void>;
  formatData: (data: any, transform?: string) => any;
}