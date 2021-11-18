import { of } from 'rxjs';

export class MockClient {
  public send = jest.fn().mockReturnValue(of({}));
  public emit = jest.fn().mockReturnValue(of({}));
  public close = jest.fn();
}
