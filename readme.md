# Resilient Fetch - Version 1.0.0

[![npm](https://img.shields.io/npm/dt/your-package-name.svg)](https://www.npmjs.com/package/resilient-fetch)

### Introduction

Resilient Fetch is a powerful utility library designed to enhance your HTTP requests by providing built-in resilience features. It's especially useful when dealing with unreliable network conditions, ensuring your applications remain robust and responsive even in challenging environments.

**Key Features:**

- **Timeout Handling:** Set a maximum duration for your requests to prevent lengthy waits.
- **Retry Mechanism:** Define the number of attempts for the library to retry the request in case of failure, ensuring a higher likelihood of successful data retrieval.
- **Callback Support:** Utilize `onResponse` and `onError` callbacks for custom handling of responses and errors.

## Installation

```bash
# Using npm
npm  install  --save  resilient-fetch
# Using yarn
yarn  add  resilient-fetch
```

# Usage

```typescript
import { resilientFetch } from 'resilient-fetch';

// Example 1: Fetch data with default options
const fetchDataExample1 = async () => {
  try {
    const { promise, cancel } = resilientFetch<string>(
      'https://api.example.com/data'
    );

    const response = await promise;

    if (response.loading) {
      console.log('Loading...');
    } else if (response.status === 'success') {
      console.log('Success:', response.data);
      console.log('Status:', response.status);
      console.log('Headers:', response.headers);
    } else {
      console.error('Error:', response.error);
      console.log('Status:', response.status);
    }

    // Example cancellation:
    // cancel();
  } catch (error) {
    console.error('Catch Block Error:', error.error);
    console.log('Catch Block Status:', error.status);
  }
};

// Call the example function
fetchDataExample1();

// Example 2: Fetch data with custom options
const fetchDataExample2 = async () => {
  try {
    const { promise, cancel } = resilientFetch<string>(
      'https://api.example.com/data',
      {
        headers: { Authorization: 'Bearer token123' },
        method: 'POST',
        // Add more options as needed
      },
      {
        timeout: 15000,
        retryAttempts: 3,
        onResponse: async (response) => {
          // Handle response interceptors if needed
        },
        onError: (error) => {
          // Handle global error handling
          console.error('Global Error Handling:', error);
        },
      }
    );

    const response = await promise;

    if (response.loading) {
      console.log('Loading...');
    } else if (response.status === 'success') {
      console.log('Success:', response.data);
      console.log('Status:', response.status);
      console.log('Headers:', response.headers);
    } else {
      console.error('Error:', response.error);
      console.log('Status:', response.status);
    }

    // Example cancellation:
    // cancel();
  } catch (error) {
    console.error('Catch Block Error:', error.error);
    console.log('Catch Block Status:', error.status);
  }
};

// Call the example function
fetchDataExample2();
```

## API

### `resilientFetch<T>(url: string, options?: RequestInit, customOptions?: ResilientFetchOptions<T>): { promise: Promise<ResilientFetchResponse<T>>, cancel: () => void }`

- `url`: The URL to fetch data from.
- `options`: Optional request options (same as the standard `fetch` function).
- `customOptions`: Optional custom options for `resilientFetch`: - `timeout`: Timeout duration in milliseconds (default: 5000). - `retryAttempts`: Number of retry attempts (default: 3). - `onResponse`: Callback function to handle the response before resolving the promise. - `onError`: Callback function to handle global errors.
  Returns an object with a `promise` that resolves to a `ResilientFetchResponse<T>` and a `cancel` function to abort the request.

### `ResilientFetchResponse<T>`

- `loading`: Boolean indicating whether the request is still loading.
- `data`: The fetched data (nullable).
- `status`: The status of the request ('success', 'error', or null).
- `error`: An object containing error details (nullable).
- `headers`: The response headers.

### `ResilientFetchError`

- `status`: The HTTP status code of the error.
- `message`: The error message.

## License

This project is licensed under the MIT License - see the [LICENSE](https://opensource.org/license/mit/) file for details.
