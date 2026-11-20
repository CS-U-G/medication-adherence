import 'package:hive_flutter/hive_flutter.dart';
import 'package:med_minder/models/medications.dart';

import 'dart:io';

import 'package:android_intent_plus/android_intent.dart';

class DB {
  static final _passwordsBox = Hive.box("passwordsBox");
  static final _medicationsBox = Hive.box("medicationsBox");
  static final _historyBox = Hive.box("historyBox");
  static final _statsBox = Hive.box("statsBox");

  static List _passwords = [];
  static List<Medication> medications = [];
  static List historyLogs = [];
  static int takenTodayCount = 0;
  static int skippedTodayCount = 0;

  static Future<void> onboardingSeen() async {
    await Hive.box('isFirstTime').put('seenOnboardingScreen', true);
  }

  static Future<void> hasPassword() async {
    await Hive.box('hasOrSkippedPassword').put('hasPasswordValue', true);
  }

  static Future<void> skippedPassword() async {
    await Hive.box('hasOrSkippedPassword').put('skippedPasswordValue', true);
  }

  //Passwords stuff
  static void loadPasswordsData() {
    final savedList = _passwordsBox.get("passwordsList");
    if (savedList is List) {
      _passwords = savedList;
    }
  }

  static void updatePasswordsData() {
    _passwordsBox.put("passwordsList", _passwords);
  }

  static bool checkPassword(String input) {
    final trimmed = input.trim();
    if (trimmed.isEmpty) return false;
    return _passwords.contains(trimmed);
  }

  static bool confirmPassword(String input1, String input2) {
    final a = input1.trim();
    final b = input2.trim();
    if (!_passwords.contains(a)) {
      if (a.length >= 4 && a == b) {
        _passwords.add(a);
        updatePasswordsData();
        return true;
      }
      return false;
    }
    return false;
  }

  static Future<bool> confirmChangingPassword(
    String input1,
    String input2,
  ) async {
    var hasOrSkippedPasswordBox = await Hive.openBox("hasOrSkippedPassword");
    final bool hasPassword = hasOrSkippedPasswordBox.get(
      'hasPasswordValue',
      defaultValue: false,
    ) as bool;

    final oldPass = input1.trim();
    final newPass = input2.trim();
    if (hasPassword) {
      if (!_passwords.contains(oldPass) || newPass.length < 4) {
        return false;
      } else if (oldPass == newPass) {
        return false;
      }
      _passwords.remove(oldPass);
      _passwords.add(newPass);
      updatePasswordsData();
      return true;
    } else {
      if (newPass.length < 4) {
        return false;
      }
      _passwords.add(newPass);
      await DB.hasPassword();
      updatePasswordsData();
      return true;
    }
  }

  //The medications side of logic type of shit..
  static void loadMedicationsData() {
    final savedList = _medicationsBox.get("medicationsList");
    if (savedList is List) {
      medications = savedList
          .map((item) => Medication.fromMap(item as Map))
          .toList();
    }
  }

  static void updateMedicationsData() {
    final mappedList = medications.map((med) => med.toMap()).toList();
    _medicationsBox.put("medicationsList", mappedList);
  }

  static void deleteMedication(int index) {
    medications.removeAt(index);
    updateMedicationsData();
  }

  static bool addMedication(String name, String dosage, String time) {
    final cleanName = name.trim();
    final cleanDosage = dosage.trim();
    if (cleanName.isEmpty || cleanDosage.isEmpty) return false;

    medications.add(
      Medication(time: time, name: cleanName, dosage: cleanDosage),
    );
    updateMedicationsData();
    return true;
  }

  // History stuff
  static void loadHistoryData() {
    final savedList = _historyBox.get("historyList");
    if (savedList is List) {
      historyLogs = savedList;
    }
  }

  static void updateHistoryData() {
    _historyBox.put("historyList", historyLogs);
  }

  static void recordDoseAction(int index, String status) {
    final med = medications[index];
    historyLogs.insert(0, {
      'date': 'Today · ${med.time}',
      'name': med.name,
      'dosage': med.dosage,
      'status': status,
    });
    updateHistoryData();
    deleteMedication(index);
  }

  // Stats stuff
  static void loadStatsData() {
    takenTodayCount = _statsBox.get("takenTodayCount", defaultValue: 0) as int;
    skippedTodayCount =
        _statsBox.get("skippedTodayCount", defaultValue: 0) as int;
  }

  static void updateStatsData() {
    _statsBox.put("takenTodayCount", takenTodayCount);
    _statsBox.put("skippedTodayCount", skippedTodayCount);
  }

  //Alarm
  static Future<void> setSystemAlarm(
    String name,
    String dosage,
    int hour,
    int minute,
  ) async {
    if (!Platform.isAndroid) return;

    final intent = AndroidIntent(
      action: 'android.intent.action.SET_ALARM',
      arguments: <String, dynamic>{
        'android.intent.extra.alarm.HOUR': hour,
        'android.intent.extra.alarm.MINUTES': minute,
        'android.intent.extra.alarm.MESSAGE':
            '${name.trim()} (${dosage.trim()})',
        'android.intent.extra.alarm.SKIP_UI': false,
      },
    );

    await intent.launch();
  }

  //Theme
}
