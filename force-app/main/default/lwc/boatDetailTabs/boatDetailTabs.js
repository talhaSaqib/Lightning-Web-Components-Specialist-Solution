import { LightningElement, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { subscribe, MessageContext } from 'lightning/messageService';
import { NavigationMixin } from 'lightning/navigation';

import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';

// Custom Labels Imports
// import labelDetails for Details
import labelDetails from "@salesforce/label/c.Details";
// import labelReviews for Reviews
import labelReviews from "@salesforce/label/c.Reviews";
// import labelAddReview for Add_Review
import labelAddReview from "@salesforce/label/c.Add_Review";
// import labelFullDetails for Full_Details
import labelFullDetails from "@salesforce/label/c.Full_Details";
// import labelPleaseSelectABoat for Please_select_a_boat
import labelPleaseSelectABoat from "@salesforce/label/c.Please_select_a_boat";

// Boat__c Schema Imports
// import BOAT_ID_FIELD for the Boat Id
import BOAT_ID_FIELD from "@salesforce/schema/Boat__c.Id";
// import BOAT_NAME_FIELD for the boat Name
import BOAT_NAME_FIELD from "@salesforce/schema/Boat__c.Name";

import BOAT_TYPE_FIELD from "@salesforce/schema/Boat__c.BoatType__c";
import BOAT_LENGTH_FIELD from "@salesforce/schema/Boat__c.Length__c";
import BOAT_PRICE_FIELD from "@salesforce/schema/Boat__c.Price__c";
import BOAT_DESCRIPTION_FIELD from "@salesforce/schema/Boat__c.Description__c";
import BOAT_OBJECT_NAME from "@salesforce/schema/Boat__c";

const BOAT_FIELDS = [BOAT_ID_FIELD, BOAT_NAME_FIELD];

export default class BoatDetailTabs extends NavigationMixin(LightningElement) {
  boatId;

  label = {
    labelDetails,
    labelReviews,
    labelAddReview,
    labelFullDetails,
    labelPleaseSelectABoat,
  };

  boatDetailViewFields = {
    BOAT_TYPE_FIELD,
    BOAT_LENGTH_FIELD,
    BOAT_PRICE_FIELD,
    BOAT_DESCRIPTION_FIELD,
    BOAT_OBJECT_NAME
  }
  
  // wired message context
  @wire(MessageContext)
  messageContext;

  @wire(getRecord, { recordId: '$boatId', fields: BOAT_FIELDS })
  wiredRecord;

  // Decide when to show or hide the icon
  // returns 'utility:anchor' or null
  get detailsTabIconName() {
    if(!this.wiredRecord.data) {
      return null;
    }
    return 'utility:anchor';
   }
  
  // Utilize getFieldValue to extract the boat name from the record wire
  get boatName() { 
    return getFieldValue(this.wiredRecord.data, BOAT_NAME_FIELD);
  }
  
  // Private
  _subscription = null;
  
  // Subscribe to the message channel
  subscribeMC() {
    // local boatId must receive the recordId from the message
    this._subscription = subscribe(
      this.messageContext,
      BOATMC,
      (message) => { this.boatId = message.recordId;}
    );
  }
  
  // Calls subscribeMC()
  connectedCallback() { 
    this.subscribeMC();
  }
  
  // Navigates to record page
  navigateToRecordViewPage() { 
    this[NavigationMixin.Navigate]({
      type: "standard__recordPage",
      attributes: {
        recordId: this.boatId,
        actionName: "view",
      }
    });
  }
  
  // Navigates back to the review list, and refreshes reviews component
  handleReviewCreated() {
    this.template.querySelector('lightning-tabset').activeTabValue = 'reviews';
  }
}
