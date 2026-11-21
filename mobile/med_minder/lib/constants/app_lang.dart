import 'package:flutter/material.dart';
import 'package:hive_flutter/hive_flutter.dart';

class AppLang {
  static final ValueNotifier<bool> isArabic = ValueNotifier<bool>(false);

  static void load() {
    isArabic.value = Hive.box('settingsBox').get('isArabic') == true;
  }

  static Future<void> setArabic(bool value) async {
    isArabic.value = value;
    await Hive.box('settingsBox').put('isArabic', value);
  }

  static Future<void> toggle() async {
    await setArabic(!isArabic.value);
  }


  static String t(String en, String ar) => isArabic.value ? ar : en;
}
