import 'package:flutter/material.dart';
import 'package:med_minder/constants/app_colors.dart';

class AddMedicationScreen extends StatefulWidget {
  const AddMedicationScreen({super.key});

  @override
  State<AddMedicationScreen> createState() => _AddMedicationScreenState();
}

class _AddMedicationScreenState extends State<AddMedicationScreen> {
  int selectedFrequency = 4; // 1 to 4 times daily
  TimeOfDay firstDoseTime = const TimeOfDay(hour: 18, minute: 0);

  // Helper to calculate future dose times based on frequency
  List<String> _calculateTimes() {
    List<String> times = [];
    int intervalHours = (24 ~/ selectedFrequency);

    for (int i = 0; i < selectedFrequency; i++) {
      int calculatedHour = (firstDoseTime.hour + (i * intervalHours)) % 24;
      int calculatedMinute = firstDoseTime.minute;

      String formattedTime =
          '${calculatedHour.toString().padLeft(2, '0')}:${calculatedMinute.toString().padLeft(2, '0')}';
      times.add(formattedTime);
    }
    return times;
  }

  // Opens native Flutter time picker
  Future<void> _pickTime(BuildContext context) async {
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: firstDoseTime,
    );
    if (picked != null && picked != firstDoseTime) {
      setState(() {
        firstDoseTime = picked;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final calculatedTimes = _calculateTimes();

    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Back Button
            GestureDetector(
              onTap: () => Navigator.pop(context),
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: const Icon(
                  Icons.arrow_back_ios_new,
                  size: 18,
                  color: Color(0xFF1D1F1E),
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Title Header
            const Text(
              'YOUR ROUTINE',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.2,
                color: Color(0xFF6C757D),
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              'Add Medication',
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1D1F1E),
              ),
            ),
            const SizedBox(height: 24),

            // Name Field
            const Text(
              'Name',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                color: Color(0xFF1D1F1E),
              ),
            ),
            const SizedBox(height: 8),
            TextField(
              decoration: InputDecoration(
                hintText: 'e.g., Metformin',
                hintStyle: TextStyle(color: Colors.grey.shade400),
                filled: true,
                fillColor: Colors.white,
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 14,
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide(color: Colors.grey.shade200),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide(color: AppColors.medMinderGreen),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Dosage Field
            const Text(
              'Dosage',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                color: Color(0xFF1D1F1E),
              ),
            ),
            const SizedBox(height: 8),
            TextField(
              decoration: InputDecoration(
                hintText: 'e.g., 500 mg · 1 tablet',
                hintStyle: TextStyle(color: Colors.grey.shade400),
                filled: true,
                fillColor: Colors.white,
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 14,
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide(color: Colors.grey.shade200),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide(color: AppColors.medMinderGreen),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Frequency Dropdown
            const Text(
              'Frequency',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                color: Color(0xFF1D1F1E),
              ),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<int>(
                  value: selectedFrequency,
                  isExpanded: true,
                  icon: Icon(
                    Icons.keyboard_arrow_down,
                    color: Colors.grey.shade600,
                  ),
                  items: [1, 2, 3, 4].map((int freq) {
                    String label = freq == 1
                        ? '1 time daily'
                        : '$freq times daily (every ${24 ~/ freq} hours)';
                    return DropdownMenuItem<int>(
                      value: freq,
                      child: Text(
                        label,
                        style: const TextStyle(
                          fontSize: 15,
                          color: Color(0xFF1D1F1E),
                        ),
                      ),
                    );
                  }).toList(),
                  onChanged: (int? newValue) {
                    if (newValue != null) {
                      setState(() {
                        selectedFrequency = newValue;
                      });
                    }
                  },
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Reminder Setup Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        Icons.notifications_outlined,
                        color: AppColors.medMinderGreen,
                        size: 20,
                      ),
                      const SizedBox(width: 8),
                      const Text(
                        'Reminder Setup',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1D1F1E),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'First Dose Time',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF6C757D),
                    ),
                  ),
                  const SizedBox(height: 8),

                  // Clickable Time Picker Container
                  GestureDetector(
                    onTap: () => _pickTime(context),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8F9FA),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: Colors.grey.shade200),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            Icons.access_time,
                            color: Colors.grey.shade600,
                            size: 20,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              firstDoseTime.format(context),
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                                color: Color(0xFF1D1F1E),
                              ),
                            ),
                          ),
                          Icon(
                            Icons.keyboard_arrow_down,
                            color: Colors.grey.shade600,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Auto-calculated schedule',
                    style: TextStyle(fontSize: 12, color: Color(0xFF6C757D)),
                  ),
                  const SizedBox(height: 8),

                  // Dynamically generated green time pills
                  Row(
                    mainAxisAlignment: MainAxisAlignment.start,
                    children: calculatedTimes.map((time) {
                      return Container(
                        margin: const EdgeInsets.only(right: 8),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 8,
                        ),
                        decoration: BoxDecoration(
                          color: const Color.fromARGB(17, 19, 111, 73),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          time,
                          style: TextStyle(
                            color: AppColors.medMinderGreen,
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Save Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.medMinderGreen,
                  foregroundColor: Colors.white,
                  elevation: 0,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                onPressed: () {
                  // TODO: Save medication & schedule to Hive
                },
                child: const Text(
                  'Save Medication',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
