interface ResilientFetchOptions<T> {
  timeout?: number;
  retryAttempts?: number;
  onResponse?: (response: Response) => Promise<void>;
  onError?: (error: ResilientFetchError) => void;
}

interface ResilientFetchResponse<T> {
  loading: boolean;
  data: T | null;
  status: "success" | "error" | null;
  error?: ResilientFetchError;
  headers?: Headers;
}

interface ResilientFetchError {
  status: number;
  message: string;
}

export const resilientFetch = <T>(
  url: string,
  options: RequestInit = {},
  customOptions: ResilientFetchOptions<T> = {}
): { promise: Promise<ResilientFetchResponse<T>>; cancel: () => void } => {
  const {
    timeout = 5000,
    retryAttempts = 3,
    onResponse,
    onError,
  } = customOptions;

  const abortController = new AbortController();
  const signal = abortController.signal;

  // Attach the signal to the options
  options.signal = signal;

  // Create a cancel function to abort the request
  const cancel = () => {
    abortController.abort();
  };

  // Promise to handle timeout
  const timeoutPromise = new Promise<ResilientFetchResponse<T>>((_, reject) =>
    setTimeout(
      () =>
        reject({
          loading: false,
          error: { status: 408, message: "Request timed out" },
          status: "error",
        }),
      timeout
    )
  );

  // Promise to handle actual fetch with retries
  const fetchPromise = new Promise<ResilientFetchResponse<T>>(
    async (resolve, reject) => {
      let attempts = 0;

      while (attempts < retryAttempts) {
        try {
          // Perform the fetch
          const response = await fetch(url, options);

          // Call onResponse callback if provided
          if (onResponse) {
            await onResponse(response);
          }

          // If the response is successful, resolve with data
          if (response.ok) {
            const data = (await response.json()) as T;
            resolve({
              loading: false,
              data,
              status: "success",
              headers: response.headers,
            });
            return;
          } else {
            // If the response is not successful, throw an error
            const error: ResilientFetchError = {
              status: response.status,
              message: response.statusText,
            };
            throw error;
          }
        } catch (error) {
          // If there's an error, handle retries and call onError callback if provided
          if (attempts === retryAttempts - 1) {
            reject({ loading: false, error, status: "error" });

            if (onError) {
              onError(error as ResilientFetchError);
            }
          } else {
            attempts++;
          }
        }
      }
    }
  );

  // Combine timeout and fetch promises using Promise.race
  const promise = Promise.race([timeoutPromise, fetchPromise]);

  return { promise, cancel };
};
