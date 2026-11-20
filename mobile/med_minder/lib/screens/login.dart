import 'package:flutter/material.dart';
import 'package:med_minder/screens/dashboard.dart';
import 'package:med_minder/screens/sign_in.dart';
import 'package:med_minder/Database/db.dart';
import 'package:med_minder/shared/bottom_navigation.dart';
import 'package:med_minder/widgets/password_field.dart';

import '../constants/app_colors.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _passwordController = TextEditingController();
  bool _isPasswordObscured = true;

  @override
  void dispose() {
    _passwordController.dispose();
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
                    const Text(
                      'A LITTLE HELP, EVERY DAY',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: AppColors.medMinderGreen,
                        letterSpacing: 0.8,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Manage your\nmedications easily',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: AppColors.darkGreenText,
                        letterSpacing: -0.5,
                        height: 1.15,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'A calmer routine. A healthier you.',
                      style: TextStyle(
                        fontSize: 15,
                        color: AppColors.textMuted,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 36),

              const Text(
                'Password',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 10),

              buildPasswordField(
                controller: _passwordController,
                hintText: "Enter password",
                isObscured: _isPasswordObscured,
                onToggleVisibility: () {
                  setState(() {
                    _isPasswordObscured = !_isPasswordObscured;
                  });
                },
              ),
              const SizedBox(height: 28),

              SizedBox(
                width: double.infinity,
                height: 54,
                //Enter button
                //Enter button
                child: ElevatedButton(
                  onPressed: () {
                    final isMatched = DB.checkPassword(
                      _passwordController.text,
                    );

                    if (isMatched) {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const BottomNavigationShared(),
                        ),
                      );
                    } else {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: const Text(
                            'Incorrect password. Please try again.',
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
                  child: const Text(
                    'Enter',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                ),
              ),
              const SizedBox(height: 14),
              SizedBox(
                width: double.infinity,
                height: 54,
                //I don't have a password button
                child: OutlinedButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const SignInScreen(),
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
                  child: const Text(
                    "I don't have a password",
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF4A5550),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 40),
              const Center(
                child: Text(
                  'Build a routine, one day at a time.',
                  style: TextStyle(fontSize: 13, color: AppColors.textMuted),
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
