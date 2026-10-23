import '../models/medication.dart';

class MedicationService {
  static final List<Medication> _medications = [];

  static List<Medication> get medications =>
      List.unmodifiable(_medications);

  static void add(Medication medication) {
    _medications.add(medication);
  }
}