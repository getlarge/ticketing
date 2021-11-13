import axios, { Method } from 'axios';
import { useState } from 'react';

export function useRequest<
  T = Record<string, unknown>,
  R = Record<string, unknown>
>(opts: {
  url: string;
  method: Method;
  body?: T;
  onSuccess?: (data?: R) => void | Promise<void>;
  onFailure?: (err?: Error) => void | Promise<void>;
}): { doRequest: () => Promise<void>; errors: JSX.Element } {
  const [errors, setErrors] = useState<JSX.Element>();
  const { method, url, body, onFailure, onSuccess } = opts;

  async function doRequest(): Promise<void> {
    try {
      setErrors(null);
      const { data } = await axios({
        method,
        url,
        data: body,
      });
      if (onSuccess) {
        await onSuccess(data);
      }
      return data;
    } catch (err) {
      const apiErrors: { message: string }[] =
        err?.response?.data?.errors || [];

      setErrors(
        <div className="alert alert-danger">
          <h4> Oops.. </h4>
          <ul>
            {apiErrors.map((apiError, i) => (
              <li key={i}>{apiError.message}</li>
            ))}
          </ul>
        </div>
      );
      if (onFailure) {
        await onFailure(err);
      }
    }
  }

  return { doRequest, errors };
}
