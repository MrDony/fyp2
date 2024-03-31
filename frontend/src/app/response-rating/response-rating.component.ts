import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BackendApiService } from '../backend-api.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-response-rating',
  templateUrl: './response-rating.component.html',
  styleUrls: ['./response-rating.component.css']
})
export class ResponseRatingComponent {
  @Input() responseId: number = 0;
  @Input() previousRating:number = 0;
  @Output() ratingSelected = new EventEmitter<number>();

  constructor(private dataService: BackendApiService){
  }
  rateResponse(rating: number): void {
    this.previousRating = rating;
    this.ratingSelected.emit(rating);
    console.log('response rating:',this.previousRating, ' for response id:',this.responseId)

    // Call backend to update the rating
    const updateResponseRating$ = this.dataService.updateResponseRating(this.responseId, this.previousRating);
    forkJoin([updateResponseRating$]).subscribe((
      [updateResponseRatingResponse]
    ) => {
      console.log('updated response rating:',updateResponseRatingResponse)
    })
  }
}
