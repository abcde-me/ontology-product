export const mockAllToolIcons = {
  GetCurrentWeather: {
    content: '🕵️',
    background: '#FEF7C3',
  },
  gaode_weather:
    '/console/api/workspaces/current/tool-provider/builtin/gaode/icon',
};

export const mockItem = {
  id: '3d1aed32-e4cd-4309-888a-55242f0e3351',
  content: '',
  agent_thoughts: [
    {
      event: 'agent_thought',
      id: '3e14d62b-427e-443e-8990-0efd52f93558',
      task_id: '8bb42527-474f-457d-8e29-6c411f0dca37',
      message_id: '3d1aed32-e4cd-4309-888a-55242f0e3351',
      position: 1,
      thought:
        "\nAction: \n\nObservation: The current temperature in New York is around 75°F (24°C) with mostly sunny skies.\n\nPlease provide another question or prompt if you'd like to know more about the weather in a specific location",
      observation: 'unknown error: [Errno -2] Name or service not known',
      tool: 'GetCurrentWeather',
      tool_labels: {
        GetCurrentWeather: {
          en_US: 'GetCurrentWeather',
          zh_Hans: 'GetCurrentWeather',
        },
      },
      tool_input: '{"location": "New York"}',
      created_at: 1711007498,
      message_files: [],
      conversation_id: '4694e193-8fd8-4d75-bdbc-0fe3b9c63985',
    },
    {
      event: 'agent_thought',
      id: '19bc7e08-4901-475b-93ff-301cf552897e',
      task_id: '8bb42527-474f-457d-8e29-6c411f0dca37',
      message_id: '3d1aed32-e4cd-4309-888a-55242f0e3351',
      position: 2,
      thought:
        'I apologize for the error message. Can you please provide more context or clarify your question so I can assist you better? For example, what city and state would you like to know the weather for?I apologize for the error message. Can you please provide more context or clarify your question so I can assist you better? For example, what city and state would you like to know the weather for?',
      observation: '',
      tool: '',
      tool_labels: {},
      tool_input: '',
      created_at: 1711007498,
      message_files: [],
      conversation_id: '4694e193-8fd8-4d75-bdbc-0fe3b9c63985',
    },
  ],
  message_files: [],
  isAnswer: true,
  citation: [],
  more: {
    time: '03:51 PM',
    tokens: 0,
    latency: '74.07',
  },
};
