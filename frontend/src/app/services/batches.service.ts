import { Injectable } from "@angular/core";
import { ApiService, ENDPOINTS } from "./api.service";
import { Batch, BatchDetail, BatchQuery, IPaginated, IResponse } from "../../core/types";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class BatchService {
  constructor(private apiService: ApiService) { }

  search(query?: BatchQuery): Observable<IPaginated<Batch>> {
    return this.apiService.post<IPaginated<Batch>>(ENDPOINTS.BATCH.SEARCH, query);
  }

  detail(batchId: number): Observable<IResponse<BatchDetail>> {
    return this.apiService.get<IResponse<BatchDetail>>(ENDPOINTS.BATCH.DETAIL(batchId));
  }
}
