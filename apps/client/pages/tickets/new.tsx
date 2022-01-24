import './new.module.css';

import { Resources } from '@ticketing/shared/constants';
// import Router from 'next/router';
import { ChangeEvent, FormEvent, useState } from 'react';

import { useRequest } from '../../hooks/use-request';

/* eslint-disable-next-line */
export interface NewTicketProps {}

export function NewTicket(props: NewTicketProps): JSX.Element {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const { doRequest, errors } = useRequest({
    url: `/api/${Resources.TICKETS}`,
    method: 'post',
    body: { title, price },
    // onSuccess(ticket) {
    //   console.log(ticket);
    // },
  });

  const onBlur = (e?: ChangeEvent<HTMLInputElement>): void => {
    const value = parseFloat(price);
    if (isNaN(value)) {
      return;
    }
    setPrice(value.toFixed(2));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    await doRequest();
  };

  return (
    <div>
      <h1>Create new ticket</h1>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            value={title}
            className="form-control"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Price</label>
          <input
            value={price}
            className="form-control"
            onBlur={onBlur}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        {errors}
        <button className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
}

export default NewTicket;
