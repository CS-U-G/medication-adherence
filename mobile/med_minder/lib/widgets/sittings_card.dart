import 'package:flutter/material.dart';

import '../constants/app_colors.dart';

Widget settingCard(
  IconData icon,
  String title,
  String subtitle,
  VoidCallback onTap,
) => GestureDetector(
  onTap: onTap,
  child: Container(
    margin: const EdgeInsets.only(bottom: 12),
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(16),
      border: Border.all(color: Colors.grey.shade200),
    ),
    child: Row(
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: const Color.fromARGB(14, 19, 111, 73),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: AppColors.medMinderGreen, size: 20),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Text(
                subtitle,
                style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
              ),
            ],
          ),
        ),
        Icon(Icons.chevron_right, color: Colors.grey.shade500),
      ],
    ),
  ),
);
