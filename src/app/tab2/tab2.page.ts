import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ServicesService } from '../api/services.service';
import { Router, NavigationExtras } from '@angular/router';
import { ModalController, NavController, ToastController, Platform } from '@ionic/angular';
import Swiper from 'swiper';
import { HttpClient } from '@angular/common/http';
import { LoadingScreenAppPage } from '../loading-screen-app/loading-screen-app.page';
import { IonInfiniteScroll, IonContent } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';




@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  tempISO: any = '';
  @ViewChild('swiper')
  swiperRef: ElementRef | undefined;
  swiper?: Swiper;
  loadmoreData = 0;
  slideCounts: any = 1.5;
  allCountriesList: any = [];
  selectedSegment: string = 'singlecountry';
  searchTerm: string = '';
  tempAllCountry: any = [];
  currentPage: number = 1;
  recordsPerPage: number = 20;
  mainObj: any = [];
  currencyCode: any = 'USD';
  countryParam: any = { 'to_currency': '' };
  isSearch: any = false;
  searchData: any = [];
  rate: any = '';
  tempCountryBundle: any = [];
  @ViewChild(IonContent, { static: false }) content?: IonContent;
  @ViewChild(IonInfiniteScroll, { static: false }) infiniteScroll?: IonInfiniteScroll;

  temPopularList: any = [{ 'iso': 'TR', 'name': 'Turkey' }, { 'iso': 'US', 'name': 'USA' }, { 'iso': 'AE', 'name': 'UAE' }, { 'iso': 'SA', 'name': 'Saudi Arabia' }, { 'iso': 'FR', 'name': 'France' }, { 'iso': 'GB', 'name': 'UK' },
  { 'iso': 'ES', 'name': 'Spain' }, { 'iso': 'IT', 'name': 'Italy' }, { 'iso': 'MX', 'name': 'Mexico' },
  { 'iso': 'MA', 'name': 'Morocco' }, { 'iso': 'GR', 'name': 'Greece' }];

  popularCountriesList: any = [];
  zoneList: any = [];

  constructor(private translate: TranslateService, private toastController: ToastController, private platform: Platform, private loadingScreen: LoadingScreenAppPage, private http: HttpClient, private navController: NavController, private modalController: ModalController, private apiService: ServicesService, private Router: Router, private elementRef: ElementRef) {
  }

  isDeletedObj: any = { 'user_id': '' };
  tempArr: any = [];
  userDetails: any = [];
  authToken: any;

  //Init function 
  langDefault: any;
  ngOnInit() {

    this.mainObj = [];
    this.langDefault = window.localStorage.getItem('Or4esim_language');
    this.translate.use(this.langDefault).subscribe(() => {
      this.popularCountriesList = this.temPopularList.map((country: any) => ({
        name: this.translate.instant(`COUNTRIES.${country.iso}`),
        iso: country.iso,
      }));
    });

   
  }


  multipleSearchObj:any=[]; 
  destinations:any =[]; 
  //After Init 
  VIEW_INFO_LABEL:any;
  FROM_LABEL:any;
  DAY_LABEL:any;

  async ionViewDidEnter() {
    //this.isUserDeleted();
    this.mainObj = [];
    this.langDefault = window.localStorage.getItem('Or4esim_language');
    this.content?.scrollToTop();
    this.isSearch = false;
    this.searchTerm = '';
    //List of countries 
    this.allCountriesList = window.localStorage.getItem('Or4esim_countryBundles');
    this.destinations = window.localStorage.getItem('Or4esim_destinations');
    this.destinations = JSON.parse(this.destinations);
    this.allCountriesList = JSON.parse(this.allCountriesList);
    this.translate.use(this.langDefault).subscribe(() => {
     this.VIEW_INFO_LABEL = this.translate.instant("VIEW_INFO_LABEL");
     this.FROM_LABEL = this.translate.instant("FROM_LABEL");
     this.DAY_LABEL = this.translate.instant("DAY_LABEL");
    
      this.allCountriesList = this.allCountriesList.map((country: any) => ({
        name: this.translate.instant(`COUNTRIES.${country.iso}`),
        region: country.region,
        iso: country.iso,
      }));
    });

    //List of zones
    this.zoneList = window.localStorage.getItem('Or4esim_ZoneBundles');
    this.zoneList = JSON.parse(this.zoneList);
    this.translate.use(this.langDefault).subscribe(() => {
      this.zoneList = this.zoneList.map((zones: any) => ({
        name: this.translate.instant(`ZONES.${zones.iso}`),
        region: zones.region,
        iso: zones.iso,
        perDay: zones.perDay,
        countries: zones.countries
      }));
    });

    console.log(JSON.stringify(this.zoneList));

    this.tempAllCountry = this.allCountriesList;
    this.mainObj = this.allCountriesList;

    const languages = ['en', 'tu'];
  
Promise.all(languages.map(lang => this.translate.getTranslation(lang).toPromise()))
  .then((translationsArray) => {
    const translationMap: { [lang: string]: { [iso: string]: string } } = {};

    languages.forEach((lang, index) => {
      const countries = (translationsArray[index] as { COUNTRIES?: { [iso: string]: string } })?.COUNTRIES || {};
      translationMap[lang] = countries;
    });

    // Activate selected language
    this.translate.use(this.langDefault).subscribe(() => {
      const currentLang = this.langDefault;

      this.multipleSearchObj = this.tempAllCountry.map((country: any) => {
        const iso = country.iso;

        const obj: any = {
          iso: iso,
          region: country.region,
          name: translationMap[currentLang]?.[iso] || iso
        };

        languages.forEach(lang => {
          obj[`country_${lang}_name`] = translationMap[lang]?.[iso] || iso;
        });

        return obj;
      });

      // ✅ Moved inside so it logs correct output
      console.log(JSON.stringify(this.mainObj));
    });
  });

    //Current currency 
    if (window.localStorage.getItem("Or4esim_currency") == null) {
      this.currencyCode = 'USD';
    } else {
      this.currencyCode = window.localStorage.getItem("Or4esim_currency");
    }

    this.countryParam.to_currency = this.currencyCode;
  }

  //If User Deleted from DB then 
  isUserDeleted() {
    if (window.localStorage.getItem("Or4esim_auth_token") != null) {
      this.userDetails = window.localStorage.getItem('Or4esim_userDetails');
      this.userDetails = JSON.parse(this.userDetails);
      this.isDeletedObj.user_id = this.userDetails.id;
      this.authToken = window.localStorage.getItem("Or4esim_auth_token");

      this.apiService.isCheckedUserDeleted(this.isDeletedObj, this.authToken).then((res: any) => {
        if (res.code == 200) {
          if (res.data.isUserdeleted != 'no') {
            this.presentToast("Your account has been deactivated.", "Error");
            let navigationExtras: NavigationExtras = {
              state: {
                checkoutData: this.tempArr,
                withOutLogin: false
              }
            };
            this.Router.navigate(['/login'], navigationExtras);
          }
        }
        else {
          // console.log("unable to add player id");
        }
      }).catch(err => {
        //console.log("Something went wrong");
      })
      //End 
    }
  }
  //End of code 

  //Search functionality
  onSearch(event: any) {
    const searchTerm: string = event.target.value;
    this.searchData = this.tempAllCountry;

    if (searchTerm) {
      this.searchData = this.findMatchingItems(searchTerm);
      this.isSearch = true;
    } else {
      this.isSearch = false;
    }
  }

  onClearSearch() {
    this.isSearch = false;
    this.searchTerm = '';
    this.searchData = this.tempAllCountry;
  }

 findMatchingItems(searchTerm: string): any[] {
  if (!searchTerm || searchTerm.trim().length < 2) return [];

  const normalize = (text: string) =>
    text.toLowerCase().trim().replace(/\s+/g, ' ');

  const normalizedSearch = normalize(searchTerm);
  const languageFields = ['city_en_name', 'city_tu_name'];
  const appLang = this.langDefault;
  const displayField = `city_${appLang}_name`;

  const matchedItems: any[] = [];
  const seenKeys = new Set<string>();

  // ✅ 1. Match cities
  if (Array.isArray(this.destinations)) {
    for (const item of this.destinations) {
      for (const field of languageFields) {
        const value = item[field];
        if (value && normalize(value).startsWith(normalizedSearch)) {
          const displayName = item[displayField] || item['city_en_name'];
          const key = `${displayName.toLowerCase()}-${item.iso}`;
          if (!seenKeys.has(key)) {
            matchedItems.push({
              ...item,
              cityName: displayName,
              is_destination: true,
              country_name: this.translate.instant(`COUNTRIES.${item.iso}`)
            });
            seenKeys.add(key);
          }
          break;
        }
      }
    }
  }

  // ✅ 2. Match countries
  if (Array.isArray(this.multipleSearchObj)) {
    for (const country of this.multipleSearchObj) {
      let matchFound = false;

      for (const lang of ['en', 'tu']) {
        const name = country[`country_${lang}_name`];
        if (name && normalize(name).startsWith(normalizedSearch)) {
          matchFound = true;
          break;
        }
      }

      if (matchFound) {
        const displayName = country[`country_${appLang}_name`] || country.name;
        const key = `${country.iso}-${displayName.toLowerCase()}`;
        if (!seenKeys.has(key)) {
          matchedItems.push({
            is_destination: false,
            iso: country.iso,
            name: displayName,
            region: country.region || ''
          });
          seenKeys.add(key);
        }
      }
    }
  }

  console.log('Matched Items:', matchedItems);
  return matchedItems;
}


  gotoHomeSearch() {
    this.navController.navigateRoot('home-search');
  }

  //Toast msg 
  async presentToast(msg: any, status: any) {
    const toast = await this.toastController.create({
      header: status,
      message: msg,
      duration: 2000,
      position: 'top',
      cssClass: status == 'Error' ? 'error-toast' : 'success-toast'
    });
    await toast.present();
  }
  isDestinations:any=false;
  country_name:any='';

  getLocationLabel(iSO: string): string {
    const regionZones = [
      'africa',
      'global',
      'middle east',
      'oceania',
      'asia',
      'europe+',
      'europe',
      'north america'
    ];
  
    return regionZones.includes(iSO.toLowerCase()) ? 'region' : 'country';
  }
  typeOfCountries:any;
  zoneCountries:any=[]; 
  
  zoneFilter(iso: string): string[] {
    const match = this.zoneList.find((zone: any) => zone.iso.toLowerCase() === iso.toLowerCase());
    return match ? match.countries : [];
  }
  
   

  gotoBundlesSearch(name: any, iso: any, type: any, zoneCountries: any, isDestinations:any, country_name:any) {
    
    this.isDestinations =isDestinations;
    this.country_name = country_name;

     this.typeOfCountries= this.getLocationLabel(iso);

     if (this.typeOfCountries == 'region')
     {
      this.zoneCountries =this.zoneFilter(iso);
      this.isDestinations = false;
     }
     else
     {
      this.isDestinations = isDestinations;
      this.zoneCountries =[];
     }
  
    let navigationExtras: NavigationExtras = {
      state: {
        name: name,
        iso: iso,
        type:  this.typeOfCountries,
        iccid: '',
        opt: '',
        zoneCountries: this.zoneCountries,
        isDestinations:this.isDestinations,
        country_name: this.country_name,
      }
    };
    this.Router.navigate(['bundle'], navigationExtras);
    setTimeout(() => {
      this.searchTerm = '';
      this.searchData=[];
      this.isSearch =false;
     }, 200);
  }

  //Goto Bundle details
  gotoBundles(name: any, iso: any, type: any, zoneCountries: any, isDestinations:any, country_name:any) {
    this.isDestinations =isDestinations;
    this.country_name = country_name;

    let navigationExtras: NavigationExtras = {
      state: {
        name: name,
        iso: iso,
        type: type,
        iccid: '',
        opt: '',
        zoneCountries: zoneCountries,
        isDestinations:this.isDestinations,
        country_name: this.country_name,
      }
    };
    this.Router.navigate(['bundle'], navigationExtras);
    setTimeout(() => {
      this.searchTerm = '';
      this.searchData=[];
      this.isSearch =false;
     }, 200);
  }

  gotoMarketPlace()
  {
    this.navController.navigateRoot('marketplace');
  }
  //Common Footers
  gototab1() {
    this.navController.navigateRoot('tab1');
  }
  gotoTab4() {
    this.navController.navigateRoot('tab4');
  }
  gotoTab5() {
  if(window.localStorage.getItem('Or4esim_auth_token')== null || window.localStorage.getItem('Or4esim_auth_token')== '') 
this.navController.navigateRoot('tab5');
else
this.navController.navigateRoot('profile');
  }
  //End of common footers

}
