// src/App.tsx
import React from 'react';
import { RendererProvider } from './context/RendererContext';
import DynamicRenderer from './components/DynamicRenderer/DynamicRenderer';
import { BaseComponentConfig } from './types/renderer';

const App: React.FC = () => {
  const config: BaseComponentConfig = {
    type: 'Card',
    props: { className: 'w-full max-w-md mx-auto mt-8' },
    dataFetch: [
      {
        key: 'users',
        api: {
          url: 'https://jsonplaceholder.typicode.com/users',
          method: 'GET',
        },
        transform: 'toOptions',
        onSuccess: {
          type: 'onChange',
          action: 'setState',
          target: 'usersLoaded',
          params: { value: true }
        }
      }
    ],
    children: [
      {
        type: 'CardHeader',
        children: [
          {
            type: 'CardTitle',
            children: 'User Management'
          }
        ]
      },
      {
        type: 'CardContent',
        children: [
          {
            type: 'Select',
            props: { 
              className: 'mb-4',
              placeholder: 'Select User'
            },
            bindings: {
              options: {
                source: 'users'
              },
              value: {
                source: 'selectedUser'
              },
              loading: {
                source: 'users_loading'
              },
              error: {
                source: 'users_error'
              }
            },
            events: [
              {
                type: 'onChange',
                action: 'setState',
                target: 'selectedUser',
                params: '${event.target.value}'
              }
            ]
          },
          {
            type: 'div',
            props: { className: 'flex gap-2 mb-4' },
            children: [
              {
                type: 'Button',
                props: {
                  variant: 'outline',
                },
                children: 'Get User Details',
                condition: '${state.selectedUser}',
                events: [
                  {
                    type: 'onClick',
                    action: 'api',
                    target: 'userDetails',
                    params: {
                      url: 'https://jsonplaceholder.typicode.com/users/${state.selectedUser}',
                      method: 'GET'
                    }
                  }
                ]
              },
              {
                type: 'Button',
                props: {
                  variant: 'ghost',
                },
                children: 'Clear',
                condition: '${state.selectedUser}',
                events: [
                  {
                    type: 'onClick',
                    action: 'setState',
                    target: 'selectedUser',
                    params: {}
                  },
                  {
                    type: 'onClick',
                    action: 'setState',
                    target: 'userDetails',
                    params: {}
                  }
                ]
              }
            ]
          },
          {
            type: 'Alert',
            props: { variant: 'info' },
            condition: '${state.users_loading}',
            children: 'Loading users...'
          },
          {
            type: 'Alert',
            props: { variant: 'destructive' },
            condition: '${state.users_error}',
            bindings: {
              children: {
                source: 'users_error',
                transform: 'toString'
              }
            }
          },
          {
            type: 'Card',
            condition: '${state.userDetails}',
            children: [
              {
                type: 'CardHeader',
                children: [
                  {
                    type: 'CardTitle',
                    bindings: {
                      children: {
                        source: 'userDetails',
                        field: 'name'
                      }
                    }
                  }
                ]
              },
              {
                type: 'CardContent',
                children: [
                  {
                    type: 'div',
                    props: { className: 'space-y-2' },
                    children: [
                      {
                        type: 'div',
                        children: [
                          {
                            type: 'span',
                            props: { className: 'font-semibold' },
                            children: 'Email: '
                          },
                          {
                            type: 'span',
                            bindings: {
                              children: {
                                source: 'userDetails',
                                field: 'email'
                              }
                            }
                          }
                        ]
                      },
                      {
                        type: 'div',
                        children: [
                          {
                            type: 'span',
                            props: { className: 'font-semibold' },
                            children: 'Phone: '
                          },
                          {
                            type: 'span',
                            bindings: {
                              children: {
                                source: 'userDetails',
                                field: 'phone'
                              }
                            }
                          }
                        ]
                      },
                      {
                        type: 'div',
                        children: [
                          {
                            type: 'span',
                            props: { className: 'font-semibold' },
                            children: 'Website: '
                          },
                          {
                            type: 'span',
                            bindings: {
                              children: {
                                source: 'userDetails',
                                field: 'website'
                              }
                            }
                          }
                        ]
                      },
                      {
                        type: 'div',
                        children: [
                          {
                            type: 'span',
                            props: { className: 'font-semibold' },
                            children: 'Company: '
                          },
                          {
                            type: 'span',
                            bindings: {
                              children: {
                                source: 'userDetails',
                                field: 'company.name'
                              }
                            }
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            type: 'Alert',
            props: { variant: 'info', className: 'mt-4' },
            condition: '${state.userDetails_loading}',
            children: 'Loading user details...'
          },
          {
            type: 'Alert',
            props: { variant: 'destructive', className: 'mt-4' },
            condition: '${state.userDetails_error}',
            bindings: {
              children: {
                source: 'userDetails_error',
                transform: 'toString'
              }
            }
          }
        ]
      }
    ]
  };

  return (
    <RendererProvider>
      <DynamicRenderer config={config} />
    </RendererProvider>
  );
};

export default App;