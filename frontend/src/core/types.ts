export type FarmStatus = 'active' | 'warning' | 'inactive';

export interface IPaginated<T> {
  data: T[],
  pagination: {
    pageIndex: number
    pageSize: number
    total: number
    totalPages: number
  }
  success: boolean
}

export interface IResponse<T> {
  data: T
  success: boolean
}

export interface User {

}

export interface Farm {
  farm_id: number
  name: string
  address: string
  contact_email: string
  contact_phone: string
  country_code: string
  created_at: Date
  created_by: number | null
  is_active: boolean
  latitude: string
  longitude: string
  notes: string | null
  owner_name: string
  updated_at: Date
  updated_by: number | null
  website: string | null
}

export interface Batch {
  applied_license_id: number
  batch_id: number
  batch_number: string
  blockchain_tx: string
  farm_id: number
  farm_name: string
  origin_type: string // backend only has
  product_id: number
  product_name: string
  proof_hash: string
  updated_at: Date
  created_at: Date
  expiry_date: Date
  production_date: Date
  created_by: null
  updated_by: null
}

export interface BatchDetail extends Batch {
  blockchain_verification: {
    onChainHash: string,
    onChainTime: Date,
    match: boolean
  }
}

export type BatchQuery = {
  pageIndex?: number,
  pageSize?: number,
  sortColumn?: keyof Batch,
  sortAscending?: boolean,
  filter?: null, // TODO: replace filter types
  batchNumber?: number,
  productName?: string,
  fromDate?: Date,
  toDate?: Date
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
