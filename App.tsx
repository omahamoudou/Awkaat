/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Alert,
  Button,
  Image,
  ImageBackground,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
  PermissionsAndroid,
  NativeModules,
  Keyboard
} from 'react-native';

import {Colors, Header} from 'react-native/Libraries/NewAppScreen';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {changeCount} from './actions/counts';
import moment, { Moment } from 'moment';
import {PRAY_INFO} from './constants';
import {DateData} from 'react-native-calendars/src/types';
//import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import 'react-native-gesture-handler';
import BottomSheet from 'react-native-gesture-bottom-sheet';
import RadioGroup, {RadioButtonProps} from 'react-native-radio-buttons-group';
import CalendarStrip from 'react-native-calendar-strip';
const { UssdModule } = NativeModules;
import 'moment/locale/fr';  // language must match config
//import {LogBox } from 'react-native';

//LogBox.ignoreLogs(['Reanimated 2']);


const locale = {
  name: 'fr',
  config: {
    months: 'Janvier_Février_Mars_Avril_Mai_Juin_Juillet_Août_Septembre_Octobre_Novembre_Décembre'.split(
      '_'
    ),
    monthsShort: 'Janv_Févr_Mars_Avr_Mai_Juin_Juil_Août_Sept_Oct_Nov_Déc'.split(
      '_'
    ),
    weekdays: 'Dimanche_Lundi_Mardi_Mercredi_Jeudi_Vendredi_Samedi'.split('_'),
    weekdaysShort: 'Dim_Lun_Mar_Mer_Jeu_Ven_Sam'.split('_'),
    weekdaysMin: 'Di_Lu_Ma_Me_Je_Ve_Sa'.split('_'),
    longDateFormat: {
      LT: 'HH:mm',
      LTS: 'HH:mm:ss',
      L: 'DD/MM/YYYY',
      LL: 'D MMMM YYYY',
      LLL: 'D MMMM YYYY LT',
      LLLL: 'dddd D MMMM YYYY LT'
    },
    calendar: {
      sameDay: "[Aujourd'hui à] LT",
      nextDay: '[Demain à] LT',
      nextWeek: 'dddd [à] LT',
      lastDay: '[Hier à] LT',
      lastWeek: 'dddd [dernier à] LT',
      sameElse: 'L'
    },
    relativeTime: {
      future: 'dans %s',
      past: 'il y a %s',
      s: 'quelques secondes',
      m: 'une minute',
      mm: '%d minutes',
      h: 'une heure',
      hh: '%d heures',
      d: 'un jour',
      dd: '%d jours',
      M: 'un mois',
      MM: '%d mois',
      y: 'une année',
      yy: '%d années'
    },
    ordinalParse: /\d{1,2}(er|ème)/,
    ordinal: function(number) {
      return number + (number === 1 ? 'er' : 'ème');
    },
    meridiemParse: /PD|MD/,
    isPM: function(input) {
      return input.charAt(0) === 'M';
    },
    // in case the meridiem units are not separated around 12, then implement
    // this function (look at locale/id.js for an example)
    // meridiemHour : function (hour, meridiem) {
    //     return /* 0-23 hour, given meridiem token and hour 1-12 */
    // },
    meridiem: function(hours, minutes, isLower) {
      return hours < 12 ? 'PD' : 'MD';
    },
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 4 // The week that contains Jan 4th is the first week of the year.
    }
  }
};

interface dayInterface {
  Ville?: string;
  Date?: string;
  fajr_azane?: string;
  fajr_priere?: string;
  dhuhr_azane?: string;
  dhuhr_priere?: string;
  asr_azane?: string;
  asr_priere?: string;
  maghrib_azane?: string;
  maghrib_priere?: string;
  isha_azane?: string;
  isha_priere?: string;
}

const radioButtonsData = [
  {
    id: '1', // acts as primary key, should be unique and non-empty string
    label: 'Orange Money',
    value: 'OM',
    color: '#F60',
    labelStyle: {color: '#F60'}
  },
  {
    id: '2',
    label: 'Moov Money',
    value: 'MOB',
    color: '#F60',
    labelStyle: {color: '#F60'}
  },
];

const radioButtonsVille = [
  {
    id: '1', // acts as primary key, should be unique and non-empty string
    label: 'OUAGA',
    value: 'OUAGA',
    selected: true
  },
  {
    id: '2',
    label: 'BOBO DIOULASSO',
    value: 'BOBO',
  },
];

const App = (props: any) => {
  const isDarkMode = useColorScheme() === 'dark';
  const initialDate: dayInterface = {};
  const initialNextDate: dayInterface = {};
  const calendarRef = useRef(null);

  const [dayData, setDayData] = useState(initialDate);
  const [nextDate, setNextDate] = useState(initialNextDate);
  const [dateSelected, setDateSelected] = useState({
    [moment().format('YYYY-MM-DD')]: {selected: true, selectedColor: '#466A8F'},
  });
  const [currentDay, setCurrentDay] = useState(new Date())
  const [currentDayNew, setCurrentDayNew] = useState(new Date())
  const [dateLabel, setDateLabel] = useState('');
  const [nextHour, setNextHour] = useState('');
  const [hourLeft, setHourLeft] = useState('');
  const [radioButtons, setRadioButtons] =
    useState<RadioButtonProps[]>(radioButtonsData);
  const [radioButtonVille, setRadioButtonVille] =
    useState<RadioButtonProps[]>(radioButtonsVille);
  const [text, onChangeText] = React.useState('Useless Text');
  const [number, onChangeNumber] = useState(null);
  const [nextPrayName, setNextPrayName] = useState('');
  const [ville, setVille] = useState('OUAGA')
  const [isInitial, setIsInitial] = useState(false)

  //const bottomSheetRef = useRef<BottomSheetModal>(null);

  const bottomSheet = useRef();


  const snapPoints = useMemo(() => ['30%', '50%'], []);

  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  const openMoneyDialog = () => {
    console.log('===opening');
    console.log(bottomSheet.current);
    
    bottomSheet.current.show();
    //bottomSheetRef.current?.present()
  };

  const requestPhonePermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CALL_PHONE,
        {
          title: "Permission",
          message:
            "We need to acces your phone " +
            "so you can send money.",
          buttonNeutral: "Plus tard",
          buttonNegative: "Annuler",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("You can use the phone");
      } else {
        console.log("Phone permission denied");
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const goToCurrentDay = () => {
    setCurrentDay(new Date());
    setCurrentDayNew(new Date())
    calendarRef.current.setSelectedDate(moment())
    onDateChangedNew(moment())
    
  }

  function onPressRadioButton(radioButtonsArray: RadioButtonProps[]) {
    setRadioButtons(radioButtonsArray);
  }

  function onPressRadioButtonVille(radioButtonsArray: RadioButtonProps[]) {
    console.log(radioButtonsArray,"radioButtonsArray");
    setVille(radioButtonsArray.find(it=>it.selected === true)?.value || '')
    setRadioButtonVille(radioButtonsArray);
  }


  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    console.log("====villestte", ville, isInitial, currentDayNew);
    onDateChangedNew(moment(currentDayNew));
    if (!isInitial) {
      requestPhonePermission()
      let currentDay = moment().format('MM-DD');
      let nexDay = moment().add(1, 'd').format('MM-DD');
      let foundData: any = PRAY_INFO.DAY_PRAY.find(
        it => it.Date === currentDay && it.Ville.toUpperCase().indexOf('OUAGA') !== -1,
      );
      let foundNextDay: any = PRAY_INFO.DAY_PRAY.find(it => it.Date === nexDay && it.Ville.toUpperCase().indexOf('OUAGA') !== -1);
      console.log(foundData);
      setDayData(foundData);
      setNextDate(foundNextDay);
      let foundDay: any = PRAY_INFO.Calendrier_H.find(
        it => it.Date_G === moment().format('YYYY-MM-DD'),
      );
      setDateLabel(foundDay.Date_H);

      //let nexDate: any = PRAY_INFO.DAY_PRAY.find(it => it.Date === moment().add(1, 'd').format('MM-DD'))
      //setNexDay(nexDate)
      let objectCp = {...foundData};
      let isFound = false;
      let nextH: any;
      for (const [key, value] of Object.entries(objectCp)) {
        let valeur: any = value;
        if (key.indexOf('priere') !== -1) {
          if (
            moment(moment().format('HH:mm'), 'HH:mm').isBefore(
              moment(valeur, 'HH:mm'),
            )
          ) {
            setNextHour(valeur);
            setNextPrayName(key.replace('_priere', ''));
            nextH = valeur;
            isFound = true;
            break;
          }
        }
      }
      if (!isFound) {
        let nexDate: any = PRAY_INFO.DAY_PRAY.find(
          it => it.Date === moment().add(1, 'd').format('MM-DD') && it.Ville.toUpperCase().indexOf('OUAGA') !== -1,
        );
        setNextHour(nexDate.fajr_priere);
        nextH = nexDate.fajr_priere;
        setNextPrayName('Fajr');
      }
      console.log('======FoundHour====');
      console.log(nextH);
      setInterval(() => {
        //console.log(nextHour);
        let secondes = moment(moment(nextH, 'HH:mm'), 'HH:mm').diff(
          moment(),
          's',
        );
        setHourLeft(
          moment().startOf('day').seconds(secondes).format('HH:mm:ss'),
        );
      }, 1000);
    }
    setIsInitial(true)
  }, [ville]);

  const onDateChanged = (data: DateData) => {
    setDateSelected({
      [data.dateString]: {selected: true, selectedColor: '#466A8F'},
    });
    setCurrentDay(new Date(data.dateString))
    let currentDay = moment(data.dateString).format('MM-DD');
    let nexDay = moment(data.dateString).add(1, 'd').format('MM-DD');
    let foundData: any = PRAY_INFO.DAY_PRAY.find(it => it.Date === currentDay);
    let foundNextDay: any = PRAY_INFO.DAY_PRAY.find(it => it.Date === nexDay);
    setDayData(foundData);
    setNextDate(foundNextDay);
    let foundDay: any = PRAY_INFO.Calendrier_H.find(
      it => it.Date_G === moment(data.dateString).format('YYYY-MM-DD'),
    );
    setDateLabel(foundDay.Date_H);
  };

  const onDateChangedNew = (data: Moment) => {
    console.log(data, ville);
    console.log(currentDay);
    
    setCurrentDayNew(data.toDate())
    console.log(Math.abs(Math.round(moment(currentDay).diff(moment(),'day',true))))
    let lcurrentDay = data.format('MM-DD');
    let nexDay = data.clone().add(1, 'd').format('MM-DD');
    let foundData: any = PRAY_INFO.DAY_PRAY.find(it => it.Date === lcurrentDay && it.Ville.toUpperCase().indexOf(ville) !== -1);
    let foundNextDay: any = PRAY_INFO.DAY_PRAY.find(it => it.Date === nexDay && it.Ville.toUpperCase().indexOf(ville) !== -1);
    console.log("FOUNDAY",lcurrentDay);
    
    console.log(foundData);
    console.log(foundNextDay);
    
    setDayData(foundData);
    setNextDate(foundNextDay);
    let foundDay: any = PRAY_INFO.Calendrier_H.find(
      it => it.Date_G === data.format('YYYY-MM-DD'),
    );
    
    
    setDateLabel(foundDay.Date_H);
  };



  const sendMoney = () => {

    Keyboard.dismiss();
    console.log("iicicic");
    
    let selected = radioButtons.find(it => it.selected === true);
    if (selected === undefined) {
      Alert.alert('Veuillez selectionner le type de transfert svp');
      return;
    }
    if (
      number === null ||
      number === 0 ||
      number === undefined ||
      number === ''
    ) {
      Alert.alert('Veuillez saisir le montant à tranferer svp');
      return;
    }
    let tel = '';
    if (selected.id === '1') {
      tel = `*144*4*1*5253591*${number}#`;
    } else {
      tel = `*555*4*1*00046383*${number}#`;
    }
    let phoneNumber = '';
    if (Platform.OS === 'android') {
      phoneNumber = `tel:${encodeURIComponent(tel)}`;
      UssdModule.dial(tel);
      bottomSheet.current.close()
    } else {
      phoneNumber = `telprompt:${tel}`;
      Alert.alert('Fonctionnalité indisonible sur IOS');
      bottomSheet.current.close()
    }
  };

  const cloBottomSheet = ()=>{
    onChangeNumber('');
    bottomSheet.current.close()

  }

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps='handled'
        style={backgroundStyle}>
        <View style={{display: 'flex', flexDirection: 'column', backgroundColor: "F3F3F3"}}>
          <View
            style={{
              height: 50,
              width: '100%',
              padding: 5,
              backgroundColor: 'orange',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <View style={{display: 'flex', flexDirection: 'column'}}>
              <Text style={{color: 'white', fontWeight: '800'}}>
                Mouvement Sunnite BF
              </Text>
              <Text  style={{color: 'white', fontWeight: '800'}}>AWKAAT</Text>
            </View>
            <View
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignContent: 'flex-end',
              }}>
              <Text style={{color: 'white', fontSize: 10}}>
                Prochaine prière - {nextPrayName}:
              </Text>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                }}>
                <Image
                  source={require('./assets/icons/timer.png')}
                  style={{width: 15, height: 15}}
                />
                <Text
                  style={{
                    color: 'white',
                    fontSize: 15,
                    textAlign: 'right',
                    fontWeight: '500',
                    marginLeft: 10,
                  }}>
                  {hourLeft}
                </Text>
              </View>
            </View>
          </View>
          <View
            style={{display: 'flex', flexDirection: 'column', marginTop: 5}}>
          
            <CalendarStrip
              scrollable
              calendarAnimation={{type: 'sequence', duration: 30}}
              daySelectionAnimation={{type: 'background', duration: 300, highlightColor: '#9265DC'}}
              style={{height:100, paddingTop: 20, paddingBottom: 10}}
              calendarHeaderStyle={{color: 'black'}}
              calendarColor={'#ffffff'}
              dateNumberStyle={{color: 'black'}}
              dateNameStyle={{color: 'black'}}
              iconContainer={{flex: 0.1}}
              locale={locale}
              highlightDateNameStyle={{color: 'white'}}
              highlightDateNumberStyle={{color: 'yellow'}}
              highlightDateContainerStyle={{backgroundColor: 'black'}}
              //markedDates={dateSelected}
              selectedDate={currentDay}
              onDateSelected={onDateChangedNew}
              useIsoWeekday={false}
              ref={calendarRef}
            />
            <View
              style={{
                marginTop: 10,
                paddingBottom: 20,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
              }}>
              <Text>{dateLabel}</Text>
            </View>
            {(Math.abs(Math.round(moment(currentDayNew).diff(moment(),'day',true)))) > 0 && <View style={{display: 'flex', justifyContent: 'center', marginTop: 10}}>
              <Button title="Aujourd'hui" onPress={()=>goToCurrentDay()}/>
            </View>}
            <View style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                  <RadioGroup
                    radioButtons={radioButtonVille}
                    onPress={onPressRadioButtonVille}
                    layout="row"
                  />
              </View>
            <View style={{height: 300, width: '100%', marginTop: 10}}>
              <ImageBackground
                source={require('./assets/images/background.jpeg')}
                resizeMode="cover"
                style={{flex: 1, justifyContent: 'center'}}>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    marginRight: 50,
                    marginLeft: 20,
                  }}>
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={{width: 40}}></Text>
                    <Text style={{color: 'white'}}>Azane</Text>
                    <Text style={{color: 'white'}}>Iqama</Text>
                  </View>
                  <View
                    style={{
                      marginTop: 20,
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={{color: 'white', width: 50}}>Fajr</Text>
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      <Text style={{color: 'white'}}>{dayData.fajr_azane}</Text>
                      {nextDate.fajr_azane !== dayData.fajr_azane && <Text style={{color: 'red', fontSize: 25}}>.</Text>}
                    </View>
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      <Text style={{color: 'white'}}>
                        {dayData.fajr_priere}
                      </Text>
                      {nextDate.fajr_priere !== dayData.fajr_priere && <Text style={{color: 'red', fontSize: 25}}>.</Text>}
                    </View>
                  </View>
                  <View
                    style={{
                      marginTop: 20,
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={{color: 'white', width: 50}}>Dhuhr</Text>
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      <Text style={{color: 'white'}}>
                        {dayData.dhuhr_azane}
                      </Text>
                      {nextDate.dhuhr_azane !== dayData.dhuhr_azane && <Text style={{color: 'red', fontSize: 25}}>.</Text>}
                    </View>
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      <Text style={{color: 'white'}}>
                        {dayData.dhuhr_priere}
                      </Text>
                      {nextDate.dhuhr_priere !== dayData.dhuhr_priere && <Text style={{color: 'red', fontSize: 25}}>.</Text>}
                    </View>
                  </View>
                  <View
                    style={{
                      marginTop: 20,
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={{color: 'white', width: 50}}>Asr</Text>
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      <Text style={{color: 'white'}}>{dayData.asr_azane}</Text>
                      {nextDate.asr_azane !== dayData.asr_azane && <Text style={{color: 'red', fontSize: 25}}>.</Text>}
                    </View>
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      <Text style={{color: 'white'}}>{dayData.asr_priere}</Text>
                      {nextDate.asr_priere !== dayData.asr_priere && <Text style={{color: 'red', fontSize: 25}}>.</Text>}
                    </View>
                  </View>
                  <View
                    style={{
                      marginTop: 20,
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={{color: 'white', width: 50}}>Magrib</Text>
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      <Text style={{color: 'white'}}>
                        {dayData.maghrib_azane}
                      </Text>
                      {nextDate.maghrib_azane !== dayData.maghrib_azane && <Text style={{color: 'red', fontSize: 25}}>.</Text>}
                    </View>
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      <Text style={{color: 'white'}}>
                        {dayData.maghrib_priere}
                      </Text>
                      {nextDate.maghrib_priere !== dayData.maghrib_priere && <Text style={{color: 'red', fontSize: 25}}>.</Text>}
                    </View>
                  </View>
                  <View
                    style={{
                      marginTop: 20,
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text style={{color: 'white', width: 50}}>Isha</Text>
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      <Text style={{color: 'white'}}>{dayData.isha_azane}</Text>
                      {nextDate.isha_azane !== dayData.isha_azane && <Text style={{color: 'red', fontSize: 25}}>.</Text>}
                    </View>
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      <Text style={{color: 'white'}}>
                        {dayData.isha_priere}
                      </Text>
                      {nextDate.isha_priere !== dayData.isha_priere && <Text style={{color: 'red', fontSize: 25}}>.</Text>}
                    </View>
                  </View>
                </View>
              </ImageBackground>
            </View>
            <View style={{marginTop: 30,paddingBottom: 20,paddingLeft: 10}}>
              <TouchableOpacity onPress={openMoneyDialog}>
                <Text style={{fontStyle: 'italic', fontSize: 12, textDecorationLine: 'underline', textDecorationStyle: "solid",}}>Envoyer une contribution au Mouvement Sunnite</Text>
              </TouchableOpacity>
              
            </View>
            <View style={{display: 'flex', justifyContent: 'flex-start', flexDirection: 'row', paddingLeft: 10}}>
                <Image
                  source={require('./assets/icons/email.png')}
                  style={{width: 30, height: 20}}
                />
                <Text style={{fontStyle: 'italic', marginLeft: 10}}>Contact: </Text>
                <Text style={{color: '#CFA400',fontStyle: 'italic', marginLeft: 10}}
                      onPress={() => Linking.openURL('mailto:info@sunna.bf')}>
                  info@sunna.bf
                </Text>
            </View>
            <View style={{marginTop: 20,display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexDirection: 'row', paddingLeft: 10}}>
                <Image
                  source={require('./assets/icons/website.png')}
                  style={{width: 25, height: 25}}
                />
                <Text style={{fontStyle: 'italic', marginLeft: 10}}>Site web : </Text>
                <Text style={{color: '#CFA400',fontStyle: 'italic', marginLeft: 10}}
                      onPress={() => Linking.openURL('https://www.sunna.bf')}>
                  www.sunna.bf
                </Text>
            </View>
          </View>
          <View style={{flex: 1, padding: 24, backgroundColor: '#F3F3F3'}}>
            <BottomSheet hasDraggableIcon ref={bottomSheet} height={200}>
              <View
                style={{
                  alignItems: 'center',
                  flexDirection: 'column',
                  display: 'flex',
                }}>
                <View style={{display: 'flex', flexDirection: 'column'}}>
                  <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', backgroundColor: '#F3F3F3'}}>
                    <TouchableOpacity onPress={cloBottomSheet}>
                      <Image
                        source={require('./assets/icons/close.png')}
                        style={{width: 25, height: 25}}
                      />
                    </TouchableOpacity>
                  </View>
                  <RadioGroup
                    radioButtons={radioButtons}
                    onPress={onPressRadioButton}
                    layout="row"
                    containerStyle={{color: '#C0C0C0'}}
                  />
                  <TextInput
                    style={{
                      height: 40,
                      margin: 12,
                      borderWidth: 1,
                      padding: 10,
                      color: 'orange'
                    }}
                    onChangeText={onChangeNumber}
                    value={number}
                    placeholder="Saisir le montant"
                    keyboardType="numeric"
                  />
                </View>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    marginTop: 20,
                  }}>
                  <Button
                    title={'Envoyer'}
                    onPress={sendMoney}></Button>
                </View>
              </View>
            </BottomSheet>
          </View>
          <TouchableOpacity
            style={{
              borderWidth: 1,
              borderColor: 'rgba(0,0,0,0.2)',
              alignItems: 'center',
              justifyContent: 'center',
              width: 50,
              position: 'absolute',
              bottom: 110,
              right: 10,
              height: 50,
              backgroundColor: '#fff',
              borderRadius: 100,
            }}
            onPress={() => openMoneyDialog()}>
            <Image
              source={require('./assets/icons/money.png')}
              style={{width: 40, height: 40}}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const mapStateToProps = (state: any) => {
  console.log(state);
  console.log('===state');

  return {count: state.count};
};

const ActionCreators = {changeCount: changeCount};

const mapDispatchToProps = (dispatch: any) => ({
  actions: bindActionCreators(ActionCreators, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
