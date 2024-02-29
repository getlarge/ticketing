import type { InjectionToken, OptionalFactoryDependency } from '@nestjs/common';

export interface RmqManagerOptions {
  apiUrl?: string;
  username?: string;
  password?: string;
}

export interface RmqManagerAsyncOptions {
  useFactory: (
    ...args: unknown[]
  ) => Promise<RmqManagerOptions> | RmqManagerOptions;
  inject?: (InjectionToken | OptionalFactoryDependency)[];
}

export type ApplyTo = 'all' | 'exchanges' | 'queues';

export type ExchangeType = 'topic' | 'direct' | 'fanout' | 'match';

export enum RmqResources {
  Exchange = 'exchange',
  Queue = 'queue',
  Topic = 'topic',
}

export type RmqState =
  | 'starting'
  | 'tuning'
  | 'opening'
  | 'running'
  | 'flow'
  | 'blocking'
  | 'blocked'
  | 'closing'
  | 'closed';

export interface Connection {
  auth_mechanism?: 'PLAIN' | 'AMQPLAIN' | 'EXTERNAL';
  client_properties: {
    connection_name?: string;
    client_id?: string;
    product?: string;
    version?: string;
    platform?: string;
    information?: string;
    capabilities?: {
      authentication_failure_close?: boolean;
      'basic.nack'?: boolean;
      'connection.blocked'?: boolean;
      consumer_cancel_notify?: boolean;
      exchange_exchange_bindings?: boolean;
      publisher_confirms?: boolean;
    };
  };
  connected_at: number; // timestamp
  name: string;
  node: string;
  peer_cert_issuer?: string | null;
  peer_cert_subject?: string | null;
  peer_cert_validity?: string | null;
  protocol: 'Direct 0-9-1' | 'MQTT 3.1.1' | 'AMQP 0-9-1' | string;
  type: RmqResources | 'network';
  user: string;
  user_who_performed_action: string | 'none';
  vhost: string;
  channel_max?: number;
  channels?: number;
  frame_max?: number;
  garbage_collection?: {
    fullsweep_after: number;
    max_heap_size: number;
    min_bin_vheap_size: number;
    min_heap_size: number;
    minor_gcs: number;
  };
  host?: string; // ip address
  peer_host?: string; // ip address
  peer_port?: number;
  port?: number;
  recv_cnt?: number;
  recv_oct?: number;
  recv_oct_details?: { rate: number };
  reductions?: number;
  reductions_details?: { rate: number };
  send_cnt?: number;
  send_oct?: number;
  send_oct_details?: { rate: number };
  send_pend?: number;
  ssl?: boolean;
  ssl_cipher?: string;
  ssl_hash?: string;
  ssl_key_exchange?: string;
  ssl_protocol?: string;
  state?: RmqState;
  variable_map?: { client_id?: string };
  timeout?: number; // time in seconds
}

export interface ConnectionsResponse {
  total_count: number;
  item_count: number;
  filtered_count: number;
  page: number;
  page_size: number;
  page_count: number;
  items: Connection[];
}

export interface Queue {
  arguments: Record<string, unknown>;
  auto_delete: boolean;
  backing_queue_status: {
    avg_ack_egress_rate: number;
    avg_ack_ingress_rate: number;
    avg_egress_rate: number;
    avg_ingress_rate: number;
    // delta: ['delta', 'undefined', 0, 0, 'undefined'];
    len: number;
    mode: string;
    next_seq_id: number;
    q1: number;
    q2: number;
    q3: number;
    q4: number;
    // target_ram_count: 'infinity';
  };
  consumer_capacity: number;
  consumer_utilisation: number;
  consumers: number;
  durable: boolean;
  effective_policy_definition: Record<string, unknown>;
  exclusive: boolean;
  exclusive_consumer_tag: string | null;
  garbage_collection: {
    fullsweep_after: number;
    max_heap_size: number;
    min_bin_vheap_size: number;
    min_heap_size: number;
    minor_gcs: number;
  };
  idle_since?: string;
  head_message_timestamp: string | null;
  memory: number;
  message_bytes: number;
  message_bytes_paged_out: number;
  message_bytes_persistent: number;
  message_bytes_ram: number;
  message_bytes_ready: number;
  message_bytes_unacknowledged: number;
  messages?: number;
  messages_details?: {
    rate: number;
  };
  messages_paged_out: number;
  messages_persistent: number;
  messages_ram: number;
  messages_ready?: number;
  messages_ready_details?: {
    rate: number;
  };
  messages_ready_ram: number;
  messages_unacknowledged?: number;
  messages_unacknowledged_details?: {
    rate: number;
  };
  messages_unacknowledged_ram?: number;
  messages_stats?: {
    ack: number;
    ack_details: { rate: number };
    deliver: number;
    deliver_details: { rate: number };
    deliver_get: number;
    deliver_get_details: { rate: number };
    deliver_no_ack: number;
    deliver_no_ack_details: { rate: number };
    get: number;
    get_details: { rate: number };
    get_empty: number;
    get_empty_details: { rate: number };
    get_no_ack: number;
    get_no_ack_details: { rate: number };
    publish: number;
    publish_details: { rate: number };
    redeliver: number;
    redeliver_details: { rate: number };
  };
  name: string;
  node: string;
  operator_policy: string | null;
  policy: string | null;
  recoverable_slaves: string | null;
  reductions?: number;
  reductions_details?: {
    rate: number;
  };
  single_active_consumer_tag: string | null;
  state: RmqState;
  type: 'classic' | string;
  vhost: string;
}

export interface Exchange {
  arguments: Record<string, unknown>;
  auto_delete: boolean;
  durable: boolean;
  internal: boolean;
  message_stats: {
    publish_in: number;
    publish_in_details: { rate: number };
    publish_out: number;
    publish_out_details: { rate: number };
  };
  name: string;
  policy: string | null;
  type: ExchangeType;
  user_who_performed_action: 'string';
  vhost: string;
}

export interface Message {
  payload_bytes: number;
  redelivered: boolean;
  exchange: string;
  routing_key: string;
  message_count: number;
  properties: {
    reply_to?: string;
    correlation_id: string;
    delivery_mode: number;
    headers: Record<string, unknown>;
  };
  payload: string;
  payload_encoding: 'string';
}

export interface PaginatedResponse<T> {
  filtered_count: number;
  item_count: number;
  items: T[];
  page: number;
  page_count: number;
  page_size: number;
  total_count: number;
}

export type QueuesResponse = PaginatedResponse<Queue>;

export type ExchangesResponse = PaginatedResponse<Exchange>;
