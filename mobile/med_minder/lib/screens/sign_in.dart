import 'package:flutter/material.dart';
import 'package:med_minder/constants/app_lang.dart';
import 'package:med_minder/screens/dashboard.dart';
import 'package:med_minder/Database/db.dart';
import 'package:med_minder/shared/bottom_navigation.dart';

import '../widgets/password_field.dart';
import '../constants/app_colors.dart';

class SignInScreen extends StatefulWidget {
  const SignInScreen({super.key});

  @override
  State<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends State<SignInScreen> {
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confirmPasswordController =
      TextEditingController();

  bool _isPasswordObscured = true;
  bool _isConfirmPasswordObscured = true;

  @override
  void dispose() {
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

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
              IconButton(
                onPressed: () {
                  if (Navigator.canPop(context)) {
                    Navigator.pop(context);
                  }
                },
                icon: const Icon(
                  Icons.arrow_back_ios_new,
                  size: 20,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 36),

              Text(
                AppLang.t('Secure Your Meds', 'احمِ أدويتك'),
                style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                AppLang.t(
                  'Set a password to lock the app',
                  'عيّن كلمة مرور لقفل التطبيق',
                ),
                style: const TextStyle(
                  fontSize: 16,
                  color: AppColors.textMuted,
                ),
              ),
              const SizedBox(height: 40),

              Text(
                AppLang.t('Password', 'كلمة المرور'),
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 10),

              buildPasswordField(
                controller: _passwordController,
                hintText: AppLang.t('Enter password', 'أدخل كلمة المرور'),
                isObscured: _isPasswordObscured,
                onToggleVisibility: () {
                  setState(() {
                    _isPasswordObscured = !_isPasswordObscured;
                  });
                },
              ),
              const SizedBox(height: 24),

              Text(
                AppLang.t('Confirm Password', 'تأكيد كلمة المرور'),
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 10),

              buildPasswordField(
                controller: _confirmPasswordController,
                hintText: AppLang.t('confirm password', 'أكّد كلمة المرور'),
                isObscured: _isConfirmPasswordObscured,
                onToggleVisibility: () {
                  setState(() {
                    _isConfirmPasswordObscured = !_isConfirmPasswordObscured;
                  });
                },
              ),
              const SizedBox(height: 14),

              Text(
                AppLang.t(
                  'Use at least 4 characters.',
                  'استخدم 4 أحرف على الأقل.',
                ),
                style: const TextStyle(
                  fontSize: 13,
                  color: AppColors.textMuted,
                ),
              ),
              const SizedBox(height: 24),

              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 14,
                ),
                decoration: BoxDecoration(
                  color: AppColors.badgeGreenBg,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.lock_outline_rounded,
                      color: AppColors.medMinderGreen,
                      size: 20,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        AppLang.t(
                          'Only you can access your medication routine.',
                          'أنت فقط من يمكنه الوصول إلى جدول أدويتك.',
                        ),
                        style: const TextStyle(
                          fontSize: 13.5,
                          fontWeight: FontWeight.w500,
                          color: AppColors.medMinderGreen,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 36),

              SizedBox(
                width: double.infinity,
                height: 54,
                // Save & Continue button
                child: // Save & Continue button
                ElevatedButton(
                  onPressed: () {
                    final isValid = DB.confirmPassword(
                      _passwordController.text,
                      _confirmPasswordController.text,
                    );

                    if (isValid) {
                      DB.hasPassword();

                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            AppLang.t('Password saved!', 'تم حفظ كلمة المرور!'),
                          ),
                          backgroundColor: AppColors.medMinderGreen,
                          behavior: SnackBarBehavior.floating,
                          duration: const Duration(seconds: 2),
                        ),
                      );

                      Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const BottomNavigationShared(),
                        ),
                      );
                    } else {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            AppLang.t(
                              'Passwords must match and be at least 4 characters.',
                              'يجب أن تتطابق كلمتا المرور وتكون 4 أحرف على الأقل.',
                            ),
                          ),
                          backgroundColor: Colors.red.shade700,
                          behavior: SnackBarBehavior.floating,
                          duration: const Duration(seconds: 2),
                        ),
                      );
                    }
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
                    AppLang.t('Save & Continue', 'حفظ ومتابعة'),
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 14),

              SizedBox(
                width: double.infinity,
                height: 54,
                // Enter without password button
                child: OutlinedButton(
                  onPressed: () {
                    DB.skippedPassword();
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const BottomNavigationShared(),
                      ),
                    );
                  },
                  style: OutlinedButton.styleFrom(
                    backgroundColor: AppColors.surfaceCard,
                    foregroundColor: AppColors.textPrimary,
                    side: const BorderSide(
                      color: AppColors.borderSkip,
                      width: 1,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  child: Text(
                    AppLang.t(
                      'Enter without password',
                      'الدخول بدون كلمة مرور',
                    ),
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF4A5550),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 20),

              Center(
                child: Text(
                  AppLang.t('Your privacy comes first.', 'خصوصيتك تأتي أولاً.'),
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
