import { Component } from '@angular/core';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Platform } from '@ionic/angular';

declare var SMS: any;

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  messages: any = [];
  results: any = [];
  constructor(private androidPermissions: AndroidPermissions, private platform: Platform) {

  }
  ngOnInit() {
    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA).then(
      result => console.log('Has permission for camera?', result.hasPermission),
      err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA)
    );
    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.READ_SMS).then(
      result => console.log('Has permission for Read SMS?', result.hasPermission),
      err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA)
    );
    // this.checkPermission();

  }

  checkPermission() {
    this.androidPermissions.checkPermission
      (this.androidPermissions.PERMISSION.READ_SMS).then(
        success => {
          console.log("Point 1 ", "Permission Granted");
          //if permission granted
          this.ReadSMSList();
        },
        err => {
          console.log("Point 2 ", "Permission Error");
          this.androidPermissions.requestPermission
            (this.androidPermissions.PERMISSION.READ_SMS).
            then(success => {
              console.log("Point 3 ", "Permission Granted");
              this.ReadSMSList();
            },
              err => {
                console.log("Point 4 ", "Permission Error");
                alert("cancelled")
              });
        });

    this.androidPermissions.requestPermissions
      ([this.androidPermissions.PERMISSION.READ_SMS]);

  }
  ReadSMSList() {

    this.platform.ready().then((readySource) => {

      let filter = {
        box: 'inbox', // 'inbox' (default), 'sent', 'draft'
        indexFrom: 0, // start from index 0
        maxCount: 20, // count of SMS to return each time
      };

      if (SMS) {
        SMS.listSMS(filter, (ListSms) => {
          this.processMessages(ListSms);
        },
          err => {
            console.log(JSON.stringify(err));
            alert(JSON.stringify(err))
          });
      }

    });
  }

  processMessages(smsList) {
    this.messages = smsList;
    console.log(this.messages);
    for (let message of smsList) {
      let result = this.lookforOTP(message);
      if (result != false) this.results.push(result);
    }
    if(this.results.length){
      // WOHOO....!!! We got OTPS. Now we can upload it whereever we want to.
    }
    console.log(this.results);

  }
  lookforOTP(message: any) {
    let result: any = {};
    // Identifying if this message mnay contain an OTP
    const Pattern1 = /OTP/;
    // Checking for a 6 digit otp, note the spaces around, it'll make sure we are not accidentally capturing phone numbers
    const Pattern2 = / [0-9]{6} /
    const Pattern3 = /^[0-9]{6} /
    // Some sites also use 4 digit otps
    const Pattern4 = / [0-9]{4} /
    if (message.body.match(Pattern1)) {
      if (message.body.match(Pattern2) || message.body.match(Pattern3)) {
        // We got a 6 digit otp. 
        result = {
          otp: message.body.match(Pattern2)[0].trim(),
          sender: message.address,
          message: message.body
        }
        return result;
      }
    }
    return false;
  }



}
