import 'package:flutter/material.dart';

class AppColors {
  // Primary Brand Greens
  static const Color medMinderGreen = Color(0xFF136F48);      // Buttons, active states, active tab icons
  static const Color darkGreenText = Color(0xFF0F3E2B);       // Main headers ("Secure Your Meds", "Today")
  
  // Backgrounds & Surfaces
  static const Color backgroundLight = Color(0xFFF8F9F8);     // Main off-white screen background
  static const Color surfaceCard = Color(0xFFFFFFFF);         // White cards, text fields, modals
  static const Color borderSubtle = Color(0xFFE2E8F0);        // Input borders, card outlines
  static const Color borderSkip = Color(0xFF8E9692);          // Outline for secondary Skip button
  
  // Text & Labels
  static const Color textPrimary = Color(0xFF1A2E26);         // Primary body text & titles
  static const Color textMuted = Color(0xFF71807A);           // Subtitles, helper text, inactive tabs
  
  // Status & Badges
  static const Color badgeGreenBg = Color(0xFFE6F4EA);        // "Taken" badge background
  static const Color badgeGreenText = Color(0xFF136F48);      // "Taken" badge text
  static const Color badgeOrangeBg = Color(0xFFFEF3C7);       // "Pending" badge background
  static const Color badgeOrangeText = Color(0xFFD97706);     // "Pending" badge text
  static const Color badgeGrayBg = Color(0xFFEDF2F7);         // "Upcoming" badge background
  static const Color badgeGrayText = Color(0xFF4A5568);       // "Upcoming" badge text
  
  // Overlays
  static const Color modalOverlay = Color(0x61142C22);        // #142C22 at ~38% opacity for skip modal background
}