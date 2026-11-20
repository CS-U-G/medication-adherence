import 'package:flutter/material.dart';
import 'package:flutter_slidable/flutter_slidable.dart';
import 'package:med_minder/constants/app_colors.dart';
import 'package:med_minder/constants/app_lang.dart';
import 'package:med_minder/Database/db.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  Widget build(BuildContext context) {
    final remainingCount = DB.medications.length;
    final totalDoses =
        DB.takenTodayCount + DB.skippedTodayCount + remainingCount;
    final progressValue = totalDoses == 0
        ? 0.0
        : DB.takenTodayCount / totalDoses;

    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'MedMinder',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Color(0xFF136F48),
              ),
            ),
            const SizedBox(height: 16),

            Text(
              AppLang.t('Today', 'اليوم'),
              style: const TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1D1F1E),
              ),
            ),
            const SizedBox(height: 20),

            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    AppLang.t('Your daily progress', 'تقدمك اليومي'),
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: Color(0xFF6C757D),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    AppLang.t(
                      '${DB.takenTodayCount} of $totalDoses doses taken',
                      'تم تناول ${DB.takenTodayCount} من أصل $totalDoses جرعات',
                    ),
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF212529),
                    ),
                  ),
                  const SizedBox(height: 12),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: progressValue,
                      backgroundColor: Colors.grey.shade200,
                      color: AppColors.medMinderGreen,
                      minHeight: 5,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  AppLang.t('SLIDE RIGHT TO SKIP', 'اسحب لتخطي الجرعة'),
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.2,
                    color: Color(0xFF6C757D),
                  ),
                ),
                Text(
                  AppLang.t('SLIDE LEFT TO DELETE', 'اسحب لحذف الدواء'),
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.0,
                    color: AppColors.medMinderGreen,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: DB.medications.length,
              itemBuilder: (context, index) {
                final med = DB.medications[index];

                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Slidable(
                    endActionPane: ActionPane(
                      motion: const StretchMotion(),
                      children: [
                        CustomSlidableAction(
                          onPressed: (context) {
                            setState(() {
                              DB.deleteMedication(index);
                            });
                          },
                          backgroundColor: const Color.fromARGB(
                            255,
                            238,
                            63,
                            63,
                          ),
                          borderRadius: BorderRadius.circular(16),
                          child: const Icon(
                            Icons.delete,
                            size: 24,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                    startActionPane: ActionPane(
                      motion: const StretchMotion(),
                      children: [
                        CustomSlidableAction(
                          onPressed: (context) {
                            setState(() {
                              DB.skippedTodayCount++;
                              DB.recordDoseAction(index, 'Skipped');
                              DB.updateStatsData();
                            });
                          },
                          backgroundColor: const Color.fromARGB(
                            255,
                            119,
                            79,
                            19,
                          ),
                          borderRadius: BorderRadius.circular(16),
                          child: const Icon(
                            Icons.skip_next_rounded,
                            size: 28,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.borderSubtle),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  med.time,
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w500,
                                    color: Colors.grey.shade600,
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  med.name,
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF1D1F1E),
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  med.dosage,
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: Colors.grey.shade600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.medMinderGreen,
                              foregroundColor: Colors.white,
                              elevation: 0,
                              padding: const EdgeInsets.symmetric(
                                horizontal: 20,
                                vertical: 14,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            onPressed: () {
                              setState(() {
                                DB.takenTodayCount++;
                                DB.recordDoseAction(index, 'Taken');
                                DB.updateStatsData();
                              });
                            },
                            child: Text(
                              AppLang.t('Mark taken', 'تم التناول'),
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
