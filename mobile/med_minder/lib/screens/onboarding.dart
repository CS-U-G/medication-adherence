import 'package:flutter/material.dart';
import 'package:med_minder/constants/app_lang.dart';
import 'package:med_minder/screens/login.dart';
import 'package:med_minder/Database/db.dart';
import 'package:med_minder/widgets/feature_row.dart';

import '../constants/app_colors.dart';
import 'sign_in.dart';

class OnboardingScreen extends StatelessWidget {
  const OnboardingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundLight,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'MedMinder',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.medMinderGreen,
                ),
              ),
              const SizedBox(height: 24),

              Center(
                child: Container(
                  width: 170,
                  height: 140,
                  decoration: BoxDecoration(
                    color: AppColors.surfaceCard,
                    borderRadius: BorderRadius.circular(28),
                    border: Border.all(color: AppColors.borderSubtle, width: 1),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(28),
                    child: Image.asset('assets/images/medminder_logo.png'),
                  ),
                ),
              ),
              const SizedBox(height: 24),

              Center(
                child: Column(
                  children: [
                    Text(
                      AppLang.t(
                        'A LITTLE HELP, EVERY DAY',
                        'مساعدة بسيطة، كل يوم',
                      ),
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: AppColors.medMinderGreen,
                        letterSpacing: 0.8,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      AppLang.t(
                        'Manage your\nmedications easily',
                        'أدِر أدويتك\nبسهولة',
                      ),
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: AppColors.darkGreenText,
                        letterSpacing: -0.5,
                        height: 1.15,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      AppLang.t(
                        'A calmer routine. A healthier you.',
                        'روتين أهدأ. وصحة أفضل لك.',
                      ),
                      style: const TextStyle(
                        fontSize: 15,
                        color: AppColors.textMuted,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),

              buildFeatureRow(
                icon: Icons.access_time_rounded,
                title: AppLang.t(
                  'Right dose, right time',
                  'الجرعة المناسبة، في الوقت المناسب',
                ),
                subtitle: AppLang.t(
                  'Gentle reminders that fit your day.',
                  'تذكيرات لطيفة تناسب يومك.',
                ),
              ),
              const SizedBox(height: 16),

              buildFeatureRow(
                icon: Icons.check_rounded,
                title: AppLang.t(
                  'Keep track with confidence',
                  'تابع التزامك بثقة',
                ),
                subtitle: AppLang.t(
                  "See what's taken and what's next.",
                  'اعرف ما تم تناوله وما هو التالي.',
                ),
              ),
              const SizedBox(height: 16),

              buildFeatureRow(
                icon: Icons.lock_outline_rounded,
                title: AppLang.t(
                  'Your health, kept private',
                  'صحتك محفوظة بخصوصية',
                ),
                subtitle: AppLang.t(
                  'Protect your routine with a password.',
                  'احمِ روتينك بكلمة مرور.',
                ),
              ),
              const SizedBox(height: 40),

              SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton(
                  onPressed: () {
                    DB.onboardingSeen();
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const LoginScreen(),
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.medMinderGreen,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  child: Text(
                    AppLang.t('Get Started', 'ابدأ الآن'),
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              Center(
                child: Text(
                  AppLang.t(
                    'Build a routine, one day at a time.',
                    'ابنِ روتينك، يوماً بعد يوم.',
                  ),
                  style: const TextStyle(
                    fontSize: 13,
                    color: AppColors.textMuted,
                  ),
                ),
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
      ),
    );
  }
}
