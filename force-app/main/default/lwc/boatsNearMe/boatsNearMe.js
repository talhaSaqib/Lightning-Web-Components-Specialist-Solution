// imports
import { LightningElement, wire, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import getBoatsByLocation from '@salesforce/apex/BoatDataService.getBoatsByLocation';

const LABEL_YOU_ARE_HERE = 'You are here!';
const ICON_STANDARD_USER = 'standard:user';
const ERROR_TITLE = 'Error loading Boats Near Me';
const ERROR_VARIANT = 'error';

export default class BoatsNearMe extends LightningElement {
  @api boatTypeId;
  mapMarkers = [];
  isLoading = true;
  isRendered = false;
  latitude;
  longitude;
  center;
  
  
  // Add the wired method from the Apex Class
  // Name it getBoatsByLocation, and use latitude, longitude and boatTypeId
  // Handle the result and calls createMapMarkers
  @wire(getBoatsByLocation, {latitude: '$latitude', longitude: '$longitude', boatTypeId: '$boatTypeId'})
  wiredBoatsJSON({error, data}) {
    if (data) {
        this.createMapMarkers(JSON.parse(data));
    } else if (error) {
        console.log(error);
        this.showNotification(ERROR_TITLE, error.message, ERROR_VARIANT);
    }
    this.isLoading = false;
  }
  
  // Controls the isRendered property
  // Calls getLocationFromBrowser()
  renderedCallback() {
    if(!this.isRendered) {
        this.getLocationFromBrowser();
    }
    this.isRendered = true;
  }
  
  // Gets the location from the Browser
  // position => {latitude and longitude}
  getLocationFromBrowser() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            
            // On Success
            (position) => {
                this.latitude = position.coords.latitude;
                this.longitude = position.coords.longitude;
            },

            // On error
            function(error) {
                console.error('Error Code = ' + error.code + ' - ' + error.message);
            }
        );
      } else {
        console.error("Geolocation is not supported by this browser.");
      }
  }
  
  // Creates the map markers
  createMapMarkers(boatData) {
     const newMarkers = boatData.map(boat => ({
        title: boat.Name,
        location: {
            Latitude: boat.Geolocation__Latitude__s,
            Longitude: boat.Geolocation__Longitude__s,
        }
     }));
     newMarkers.unshift({
        title: LABEL_YOU_ARE_HERE,
        location: {
            Latitude: this.latitude,
            Longitude: this.longitude,
        },
        icon: ICON_STANDARD_USER
     });

     this.center = {
      location: { Latitude: this.latitude, Longitude: this.longitude },
    };

     this.mapMarkers = newMarkers;
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


