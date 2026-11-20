import 'package:flutter/material.dart';
import 'package:med_minder/constants/app_lang.dart';
import 'package:med_minder/Database/db.dart';
import 'package:med_minder/constants/app_colors.dart';

class AddMedicationScreen extends StatefulWidget {
  const AddMedicationScreen({super.key});

  @override
  State<AddMedicationScreen> createState() => _AddMedicationScreenState();
}

class _AddMedicationScreenState extends State<AddMedicationScreen> {
  TimeOfDay firstDoseTime = const TimeOfDay(hour: 18, minute: 0);

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

  String _formatTimeOfDay(TimeOfDay time) {
    final hour = time.hour.toString().padLeft(2, '0');
    final minute = time.minute.toString().padLeft(2, '0');
    return '$hour:$minute';
  }

  final TextEditingController _medNameController = TextEditingController();
  final TextEditingController _medDosageController = TextEditingController();

  @override
  void dispose() {
    _medNameController.dispose();
    _medDosageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Title Header
            Text(
              AppLang.t('YOUR ROUTINE', 'جدولك اليومي'),
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.2,
                color: Color(0xFF6C757D),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              AppLang.t('Add Medication', 'إضافة دواء'),
              style: const TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1D1F1E),
              ),
            ),
            const SizedBox(height: 24),

            // Name Field
            Text(
              AppLang.t('Name', 'الاسم'),
              style: const TextStyle(
                fontWeight: FontWeight.w600,
                color: Color(0xFF1D1F1E),
              ),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _medNameController,
              decoration: InputDecoration(
                hintText: AppLang.t('e.g., Metformin', 'مثال: ميتفورمين'),
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
            Text(
              AppLang.t('Dosage', 'الجرعة'),
              style: const TextStyle(
                fontWeight: FontWeight.w600,
                color: Color(0xFF1D1F1E),
              ),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _medDosageController,
              decoration: InputDecoration(
                hintText: AppLang.t(
                  'e.g., 500 mg · 1 tablet',
                  'مثال: 500 ملغ · حبة واحدة',
                ),
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
                      Text(
                        AppLang.t('Reminder Setup', 'إعداد التذكير'),
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1D1F1E),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    AppLang.t('Dose Time', 'وقت الجرعة'),
                    style: const TextStyle(
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
                onPressed: () async {
                  final medName = _medNameController.text;
                  final medDosage = _medDosageController.text;

                  final didAdd = DB.addMedication(
                    medName,
                    medDosage,
                    _formatTimeOfDay(firstDoseTime),
                  );

                  if (!context.mounted) return;

                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        didAdd
                            ? AppLang.t(
                                'Medication added!',
                                'تمت إضافة الدواء!',
                              )
                            : AppLang.t(
                                'Please enter name and dosage.',
                                'يرجى إدخال الاسم والجرعة.',
                              ),
                      ),
                      backgroundColor: didAdd
                          ? AppColors.medMinderGreen
                          : Colors.red.shade700,
                      behavior: SnackBarBehavior.floating,
                      duration: const Duration(seconds: 2),
                    ),
                  );

                  if (didAdd) {
                    _medNameController.clear();
                    _medDosageController.clear();
                    await DB.setSystemAlarm(
                      medName,
                      medDosage,
                      firstDoseTime.hour,
                      firstDoseTime.minute,
                    );
                  }
                },
                child: Text(
                  AppLang.t('Save Medication', 'حفظ الدواء'),
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
