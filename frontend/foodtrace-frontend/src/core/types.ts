export type FarmStatus = 'active' | 'warning' | 'inactive';

export interface Farm {
  id: string;
  name: string;
  province: string;
  ownerName: string;
  status: FarmStatus;
}

export interface Batch {
  id: string;
  farmName: string;
  product: string;
  status: string;
  createdAt: string;
}

export interface TraceEvent {
  time: string;
  location: string;
  actor: string;
  action: string;
}

export interface Activity {
  time: string;
  message: string;
  type: 'info' | 'warning' | 'error';
}
