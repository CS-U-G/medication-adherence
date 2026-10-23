class Medication {
  Medication({
    required this.name,
    required this.dose,
    required this.frequency,
    required this.startDate,
    required this.endDate,
    required this.reminderTimes,
    this.notes = '',
  });

  final String name;
  final String dose;
  final String frequency;
  final DateTime startDate;
  final DateTime? endDate;
  final List<String> reminderTimes;
  final String notes;
}