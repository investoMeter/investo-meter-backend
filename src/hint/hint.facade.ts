import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Prediction, StockSummary } from './models';
import { Observable } from 'rxjs';

@Injectable()
export class HintFacade implements OnModuleInit {
  private hintsService: any;

  constructor(@Inject('HINT_SERVICE') private client: ClientGrpc) {}

  onModuleInit() {
    this.hintsService = this.client.getService('HintModel');
  }

  getHint(model: StockSummary): Observable<Prediction> {
    return this.hintsService.getPrediction(model);
  }
}
