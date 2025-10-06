import { Component, OnInit, OnDestroy, Renderer2, ElementRef, Input } from '@angular/core';
import { NavController,ModalController, Platform } from '@ionic/angular';
import { ServicesService } from '../api/services.service';
import { Router, NavigationExtras } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {FirebaseAnalytics} from '@ionic-native/firebase-analytics/ngx';



@Component({
  selector: 'app-processing-bar-fpay-topup',
  templateUrl: './processing-bar-fpay-topup.page.html',
  styleUrls: ['./processing-bar-fpay-topup.page.scss'],
})
export class ProcessingBarFpayTopupPage implements OnInit, OnDestroy {
  counterValue: number = 0;
  strokeDashOffset: number = 219.91148575129; // Initial value for 0%
  interval: any;
  message: string = this.translate.instant('TOPUP_PROCESSING_MESSAGE');
  isFlipped: boolean = false;
  isCompleted: boolean = false;
  @Input("value") value: any;
  @Input("value1") value1: any;
  error:any = true;
  result:any=[]; 
  resValue:any=''; 
    accessToken:any;
  userDetails:any=[]; 
  constructor(private firebaseAnalytics: FirebaseAnalytics,private platform: Platform,private translate: TranslateService,private Router: Router, private service: ServicesService,private modalController: ModalController, private renderer: Renderer2, private el: ElementRef) {}
  
  ngOnInit() {
        this.accessToken = window.localStorage.getItem('Or4esim_auth_token');
    this.userDetails = window.localStorage.getItem('Or4esim_userDetails');
    this.userDetails = JSON.parse(this.userDetails);
   this.managingAppLogs("From App Step 4 Credit Top-up: Card payment QR code generation started:",this.value.amount, "Credit Top-up");
   
    window.localStorage.setItem('Or4esim_user_result',  "false");
    this.startProgress();
   
    this.service.stripePaymentTopup(this.value, this.value1).then((res: any) => {
      if (res.code == 200) {
        this.result = res.data;
        window.localStorage.setItem('Or4esim_user_result',  "true");
        window.localStorage.setItem('Or4esim_user_wallets',  res.data['user_wallet']);
      this.managingAppLogs("From App Step 5 Credit Top-up: Card payment Success:",this.value.amount, "Credit Top-up");
//Purchase callback
          if (this.platform.is('android') || this.platform.is('ios')) { 
             this.firebaseAnalytics.logEvent('completed_top_up', { amount: this.value.bundle.extraAmount , currency:this.value.currency });
            }
            //End 

      } else {
      this.managingAppLogs("From App Step 5 Credit Top-up: Card payment Error:" + JSON.stringify(res),this.value.amount, "Credit Top-up");
      }
    }).catch(err => {
         this.managingAppLogs("From App Step 5 Credit Top-up: Card payment Error from API:" + JSON.stringify(err),this.value.amount, "Credit Top-up");
    })  
  }


// Common functions for Logs 
  async managingAppLogs(label: any, amount: any, plan: any): Promise<void> {
  let devicePlatform = 'Unknown';

  if (this.platform.is('android')) {
    devicePlatform = 'Android';
  } else if (this.platform.is('ios')) {
    devicePlatform = 'iOS';
  } else if (this.platform.is('desktop')) {
    devicePlatform = 'Desktop';
  } else if (this.platform.is('mobileweb')) {
    devicePlatform = 'Mobile Web';
  }

  const paymentEvent = {
    label,
    data: {
      Action: label,
      Device: devicePlatform,
      Customer_name: `${this.userDetails.first_name}${this.userDetails.last_name ? ' ' + this.userDetails.last_name : ''}`,
      Customer_email: this.userDetails.email,
      Amount: amount,
      Plan: plan
    }
  };

  console.log('Event log:', paymentEvent);

 try {
  const response = await this.service.appSideLogs(paymentEvent, this.accessToken) as { code: number };
  if (response.code === 200) {
    console.log('Logs managed successfully');
  } else {
    console.error('Error managing logs:', response);
  }
} catch (error) {
  console.error('Server error while managing logs:', error);
}
}
  
  startProgress() {
    this.interval = setInterval(() => {
      if (this.counterValue < 100) {
        this.updateProgressBar(this.counterValue + 10);
      } else {
        clearInterval(this.interval);
      }
    }, 3000); // Increment every 1 second
  }

  
  updateProgressBar(percent: number) {
    this.counterValue = percent;
    const radius = 35;
    this.strokeDashOffset = this.calculateStrokeDashOffset(this.counterValue, radius);

    // Update the message based on the percentage
    if (percent == 50) {
      this.message = this.translate.instant('TOPUP_PROCESSING_MESSAGE');
    } else if (percent == 100) {
    //  alert("second-time" + window.localStorage.getItem('Or4esim_user_result'));
    // After Completion  
      if(window.localStorage.getItem('Or4esim_user_result') == "true")
        {
          this.message = this.translate.instant('TOPUP_SUCCESS_MESSAGE');
          this.isFlipped = true;
          this.isCompleted = true;
          this.resValue = 'DONE';
           // Redirect to success page Wallets 
            setTimeout(() => {
              clearInterval(this.interval);
            this.modalController.dismiss();
            this.Router.navigate(['/topup-wallet-success']);
              }, 2000); // Specify the delay in milliseconds
            //End 
        
        }else{
          this.message = this.translate.instant('TOPUP_ERROR_MESSAGE');
          this.isFlipped = true;
          this.isCompleted = true;
          this.resValue = 'Error';
          setTimeout(() => {
            this.modalController.dismiss();
          }, 2000); // Specify the delay in milliseconds
          
        }
    }
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  private calculateStrokeDashOffset(percent: number, radius: number): number {
    const circumference = 2 * Math.PI * radius;
    return circumference - ((percent * circumference) / 100);
  }



  
}
