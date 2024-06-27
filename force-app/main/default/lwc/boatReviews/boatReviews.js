// imports
import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

import getAllReviews from '@salesforce/apex/BoatDataService.getAllReviews';

export default class BoatReviews  extends NavigationMixin(LightningElement) {
    // Private
    _boatId;
    error;
    _boatReviews;
    isLoading;
    
    // Getter and Setter to allow for logic to run on recordId change
    @api
    get recordId() {
      return this._boatId;
    }
    set recordId(value) {
       //sets boatId attribute
       this.setAttribute('boatId', value);
       //sets boatId assignment
       this._boatId = value;
       //get reviews associated with boatId
       this.getReviews();
    }

    @api
    get boatReviews() {
      return this._boatReviews;
    }
    
    // Getter to determine if there are reviews to display
    get reviewsToShow() {
      return this._boatReviews !== undefined && this._boatReviews != null && this._boatReviews.length > 0;
    }
    
    // Public method to force a refresh of the reviews invoking getReviews
    @api
    refresh() { 
      this.getReviews();
    }
    
    // Imperative Apex call to get reviews for given boat
    // returns immediately if boatId is empty or null
    // sets isLoading to true during the process and false when it’s completed
    // Gets all the boatReviews from the result, checking for errors.
    getReviews() {
      if (this._boatId) {
            this.isLoading = true;
            getAllReviews({boatId: this._boatId}).then((result) => {
                this._boatReviews = result;
                this.error = undefined;
            }).catch((error) => {
                this.error = error;
            }).finally(() => {
                this.isLoading = false;
            });
        } else {
            return;
        }
     }
    

    // Helper method to use NavigationMixin to navigate to a given record on click
    navigateToRecord(event) { 
      event.preventDefault();
      event.stopPropagation();
      let recordId = event.target.dataset.recordId;
      this[NavigationMixin.Navigate]({
          type: 'standard__recordPage',
          attributes: {
              recordId: recordId,
              objectApiName: "User",
              actionName: "view"
          },
      });
     }
  }
  