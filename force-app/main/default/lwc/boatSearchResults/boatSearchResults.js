import { LightningElement, wire, api } from 'lwc';
import { publish, MessageContext } from 'lightning/messageService';
import{ refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import updateBoatList from '@salesforce/apex/BoatDataService.updateBoatList';
import BOAT_CHANNEL from '@salesforce/messageChannel/BoatMessageChannel__c';

const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT     = 'Ship it!';
const SUCCESS_VARIANT     = 'success';
const ERROR_TITLE   = 'Error';
const ERROR_VARIANT = 'error';

export default class BoatSearchResults extends LightningElement {
  draftValues = [];
  selectedBoatId;
  columns = [];
  boatTypeId = '';
  boats;
  isLoading = false;
  columnsToInclue = ['Name', 'Length', 'Price', 'Descripton'];
  wiredBoatsResult;
  
  // wired message context
  @wire(MessageContext)
  messageContext;
  
  // wired getBoats method 
  @wire(getBoats, {boatTypeId: '$boatTypeId'})
  wiredBoats(result) { 
    this.wiredBoatsResult = result; // Store the result for refreshApex
    if(result.data) {
        this.boats = result.data;
        this.columns = [
          { label: 'Name', fieldName: 'Name', type: 'text', editable: true },
          { label: 'Length', fieldName: 'Length__c', type: 'number', editable: true },
          { label: 'Price', fieldName: 'Price__c', type: 'currency', editable: true },
          { label: 'Description', fieldName: 'Description__c', type: 'text', editable: true }
      ];

      //console.log('BOATS: ', this.boats);

    } else if(result.error) {
        console.log(result.error);
    }
  }
  
  // public function that updates the existing boatTypeId property
  // uses notifyLoading
  @api
  searchBoats(boatTypeId) {
    this.boatTypeId = boatTypeId;
  }
  
  // this public function must refresh the boats asynchronously
  // uses notifyLoading
  refresh() { 
    return refreshApex(this.wiredBoatsResult);
  }
  
  // this function must update selectedBoatId and call sendMessageService
  updateSelectedTile(event) { 
    this.selectedBoatId = event.detail.boatId;
    console.log(this.selectedBoatId);
    this.sendMessageService(this.selectedBoatId);
  }
  
  // Publishes the selected boat Id on the BoatMC.
  sendMessageService(boatId) { 
    // explicitly pass boatId to the parameter recordId
    const payload = { 
      recordId: boatId
    };
    publish(this.messageContext, BOAT_CHANNEL, payload);
  }
  
  // The handleSave method must save the changes in the Boat Editor
  // passing the updated fields from draftValues to the 
  // Apex method updateBoatList(Object data).
  // Show a toast message with the title
  // clear lightning-datatable draft values
  handleSave(event) {
    // notify loading
    const updatedFields = event.detail.draftValues;
    console.log(updatedFields);

    // Update the records via Apex
    updateBoatList({data: updatedFields})
    .then(() => {
      this.refresh();
      this.showNotification(SUCCESS_TITLE, MESSAGE_SHIP_IT, SUCCESS_VARIANT);
      this.draftValues = []; 
    })
    
    .catch(error => {
      console.log(error);
      this.showNotification(ERROR_TITLE, error.message, ERROR_VARIANT);
    })

    .finally(() => {
    });
  }

  // Check the current value of isLoading before dispatching the doneloading or loading custom event
  notifyLoading(isLoading) { 

  }

  showNotification(title, msg, variant) {
    const evt = new ShowToastEvent({
      title: title,
      message: msg,
      variant: variant,
    });
    this.dispatchEvent(evt);
  }
}