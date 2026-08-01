// src/shared/articles/help/index.ts
// Help Center Articles

// Export all article categories
export * from './getting-started';
export * from './buying-tickets';
export * from './payments';
export * from './account';
export * from './events';
export * from './refunds';
export * from './organizers';
export * from './security';

// Create a registry for dynamic imports
export const articleComponents: Record<string, React.ComponentType> = {};

// Import and register getting-started articles
import {
  CreatingYourAccount,
  HowToBrowseEvents,
  UnderstandingEventPages,
  AccountSettingsOverview,
} from './getting-started';
articleComponents['CreatingYourAccount'] = CreatingYourAccount;
articleComponents['HowToBrowseEvents'] = HowToBrowseEvents;
articleComponents['UnderstandingEventPages'] = UnderstandingEventPages;
articleComponents['AccountSettingsOverview'] = AccountSettingsOverview;

// Import and register buying-tickets articles
import {
  HowToPurchaseTickets,
  SelectingTicketTypes,
  TicketPricesAndFees,
  AccessingYourDigitalTickets,
  TransferringTickets,
  TroubleshootingMissingTickets,
} from './buying-tickets';
articleComponents['HowToPurchaseTickets'] = HowToPurchaseTickets;
articleComponents['SelectingTicketTypes'] = SelectingTicketTypes;
articleComponents['TicketPricesAndFees'] = TicketPricesAndFees;
articleComponents['AccessingYourDigitalTickets'] = AccessingYourDigitalTickets;
articleComponents['TransferringTickets'] = TransferringTickets;
articleComponents['TroubleshootingMissingTickets'] = TroubleshootingMissingTickets;

// Import and register payment articles
import {
  HowToPayWithMpesa,
  AcceptedPaymentMethods,
  PaymentSecurityAndProtection,
  TroubleshootingFailedPayments,
  UnderstandingServiceFees,
  ViewingYourPaymentHistory,
} from './payments';
articleComponents['HowToPayWithMpesa'] = HowToPayWithMpesa;
articleComponents['AcceptedPaymentMethods'] = AcceptedPaymentMethods;
articleComponents['PaymentSecurityAndProtection'] = PaymentSecurityAndProtection;
articleComponents['TroubleshootingFailedPayments'] = TroubleshootingFailedPayments;
articleComponents['UnderstandingServiceFees'] = UnderstandingServiceFees;
articleComponents['ViewingYourPaymentHistory'] = ViewingYourPaymentHistory;

// Import and register account articles
import {
  UpdatingYourProfile,
  ChangingYourPassword,
  ResettingForgottenPassword,
  EmailVerification,
  ManagingNotificationPreferences,
  DeactivatingYourAccount,
} from './account';
articleComponents['UpdatingYourProfile'] = UpdatingYourProfile;
articleComponents['ChangingYourPassword'] = ChangingYourPassword;
articleComponents['ResettingForgottenPassword'] = ResettingForgottenPassword;
articleComponents['EmailVerification'] = EmailVerification;
articleComponents['ManagingNotificationPreferences'] = ManagingNotificationPreferences;
articleComponents['DeactivatingYourAccount'] = DeactivatingYourAccount;

// Import and register events articles
import {
  PreparingForEventDay,
  UsingYourQrCodeAtEntry,
  WhatIfMyEventIsCancelled,
  RescheduledEvents,
  ContactingEventOrganizers,
  LostOrForgottenTickets,
} from './events';
articleComponents['PreparingForEventDay'] = PreparingForEventDay;
articleComponents['UsingYourQrCodeAtEntry'] = UsingYourQrCodeAtEntry;
articleComponents['WhatIfMyEventIsCancelled'] = WhatIfMyEventIsCancelled;
articleComponents['RescheduledEvents'] = RescheduledEvents;
articleComponents['ContactingEventOrganizers'] = ContactingEventOrganizers;
articleComponents['LostOrForgottenTickets'] = LostOrForgottenTickets;

// Import and register refunds articles
import {
  UnderstandingOurRefundPolicy,
  HowToRequestARefund,
  RefundProcessingTimes,
  EventCancellationRefunds,
  PartialRefundsAndFees,
} from './refunds';
articleComponents['UnderstandingOurRefundPolicy'] = UnderstandingOurRefundPolicy;
articleComponents['HowToRequestARefund'] = HowToRequestARefund;
articleComponents['RefundProcessingTimes'] = RefundProcessingTimes;
articleComponents['EventCancellationRefunds'] = EventCancellationRefunds;
articleComponents['PartialRefundsAndFees'] = PartialRefundsAndFees;

// Import and register organizers articles
import {
  CreatingYourFirstEvent,
  SettingUpTicketTypes,
  ManagingEventSales,
  EventMarketingTools,
  ScanningTicketsAtEntry,
  OrganizerDashboardOverview,
} from './organizers';
articleComponents['CreatingYourFirstEvent'] = CreatingYourFirstEvent;
articleComponents['SettingUpTicketTypes'] = SettingUpTicketTypes;
articleComponents['ManagingEventSales'] = ManagingEventSales;
articleComponents['EventMarketingTools'] = EventMarketingTools;
articleComponents['ScanningTicketsAtEntry'] = ScanningTicketsAtEntry;
articleComponents['OrganizerDashboardOverview'] = OrganizerDashboardOverview;

// Import and register security articles
import {
  AccountSecurityBestPractices,
  RecognizingFraudulentTickets,
  TwoFactorAuthentication,
  PrivacySettingsAndDataProtection,
  ReportingSuspiciousActivity,
} from './security';
articleComponents['AccountSecurityBestPractices'] = AccountSecurityBestPractices;
articleComponents['RecognizingFraudulentTickets'] = RecognizingFraudulentTickets;
articleComponents['TwoFactorAuthentication'] = TwoFactorAuthentication;
articleComponents['PrivacySettingsAndDataProtection'] = PrivacySettingsAndDataProtection;
articleComponents['ReportingSuspiciousActivity'] = ReportingSuspiciousActivity;