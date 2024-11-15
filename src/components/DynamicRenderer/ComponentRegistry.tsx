// src/components/DynamicRenderer/ComponentRegistry.tsx
import { ComponentRegistry } from '../../types/renderer';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Alert } from '../ui/alert';
import { Select } from '../ui/select';

// Create wrapper components for HTML elements
const Div = (props: React.HTMLAttributes<HTMLDivElement>) => <div {...props} />;
const Span = (props: React.HTMLAttributes<HTMLSpanElement>) => <span {...props} />;
const Paragraph = (props: React.HTMLAttributes<HTMLParagraphElement>) => <p {...props} />;
const Heading1 = (props: React.HTMLAttributes<HTMLHeadingElement>) => <h1 {...props} />;
const Heading2 = (props: React.HTMLAttributes<HTMLHeadingElement>) => <h2 {...props} />;
const Heading3 = (props: React.HTMLAttributes<HTMLHeadingElement>) => <h3 {...props} />;
const Section = (props: React.HTMLAttributes<HTMLElement>) => <section {...props} />;
const Article = (props: React.HTMLAttributes<HTMLElement>) => <article {...props} />;
const Header = (props: React.HTMLAttributes<HTMLElement>) => <header {...props} />;
const Footer = (props: React.HTMLAttributes<HTMLElement>) => <footer {...props} />;
const Nav = (props: React.HTMLAttributes<HTMLElement>) => <nav {...props} />;
const Aside = (props: React.HTMLAttributes<HTMLElement>) => <aside {...props} />;
const Main = (props: React.HTMLAttributes<HTMLElement>) => <main {...props} />;
const Label = (props: React.LabelHTMLAttributes<HTMLLabelElement>) => <label {...props} />;
const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />;

export const componentRegistry: ComponentRegistry = {
  // UI Components
  Button: Button,           // Make sure Button is registered exactly as used in config
  Card: Card,              // Consistently use capitalization
  CardHeader: CardHeader,
  CardTitle: CardTitle,
  CardContent: CardContent,
  Alert: Alert,
  Select: Select,

  // HTML Elements
  div: Div,
  span: Span,
  p: Paragraph,
  h1: Heading1,
  h2: Heading2,
  h3: Heading3,
  section: Section,
  article: Article,
  header: Header,
  footer: Footer,
  nav: Nav,
  aside: Aside,
  main: Main,
  label: Label,
  input: Input
};